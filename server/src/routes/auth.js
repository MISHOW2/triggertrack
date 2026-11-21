import { randomUUID, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { sendLoginCode } from '../services/email.js';
import {
    accessTokenExpiresIn,
    createAccessToken,
    createCode,
    createRefreshToken,
    hashCode,
    hashRefreshToken,
    refreshTokenExpiresAt,
} from '../services/tokens.js';
import { config } from '../config.js';

const router = Router();
const CODE_TTL_MINUTES = 10;
const CODE_RESEND_SECONDS = 30;
const MAX_CODE_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_CODE_MESSAGE = 'If this address can sign in, a code will be sent shortly.';

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many authentication requests. Try again later.' },
});

function normalizeEmail(value) {
    if (typeof value !== 'string') return null;
    const email = value.trim().toLowerCase();
    return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

function sameHash(actual, expected) {
    const actualBuffer = Buffer.from(actual, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    return actualBuffer.length === expectedBuffer.length &&
        timingSafeEqual(actualBuffer, expectedBuffer);
}

async function requestCode(req, res) {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: 'Enter a valid email address.' });

    const code = createCode();
    const codeHash = hashCode(email, code);
    const result = await pool.query(
        `INSERT INTO auth_codes (email, code_hash, expires_at, attempts, last_sent_at)
         VALUES ($1, $2, now() + ($3 * interval '1 minute'), 0, now())
         ON CONFLICT (email) DO UPDATE
         SET code_hash = EXCLUDED.code_hash,
             expires_at = EXCLUDED.expires_at,
             attempts = 0,
             last_sent_at = now()
         WHERE auth_codes.last_sent_at <= now() - ($4 * interval '1 second')
         RETURNING email`,
        [email, codeHash, CODE_TTL_MINUTES, CODE_RESEND_SECONDS],
    );

    if (result.rowCount === 0) {
        return res.status(429).json({ error: 'Please wait before requesting another code.' });
    }

    const smtpConfigured = Boolean(
        config.smtp.host && config.smtp.user && config.smtp.password && config.smtp.from,
    );
    if (!smtpConfigured && !config.allowDevCode) {
        throw new Error('Configure SMTP or explicitly enable AUTH_RETURN_CODE for local development.');
    }

    if (smtpConfigured) {
        try {
            await sendLoginCode(email, code);
        } catch (error) {
            await pool.query(
                'DELETE FROM auth_codes WHERE email = $1 AND code_hash = $2',
                [email, codeHash],
            );
            throw error;
        }
    }

    return res.status(200).json({
        message: GENERIC_CODE_MESSAGE,
        ...(!smtpConfigured && config.allowDevCode ? { devCode: code } : {}),
    });
}

router.post(['/signup', '/login', '/request-code'], authRateLimit, requestCode);

router.post('/verify', authRateLimit, async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === 'string' ? req.body.code : '';
    if (!email || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ error: 'Enter a valid email and six-digit code.' });
    }//if theres no email or email is gibirish or code is not 6 digits, return error

    const client = await pool.connect();// connect to the database
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `SELECT code_hash, expires_at, attempts
             FROM auth_codes
             WHERE email = $1
             FOR UPDATE`,
            [email],
        );

        const challenge = result.rows[0];
        if (!challenge || new Date(challenge.expires_at) <= new Date() ||
            challenge.attempts >= MAX_CODE_ATTEMPTS) {
            await client.query('DELETE FROM auth_codes WHERE email = $1', [email]);
            await client.query('COMMIT');
            return res.status(400).json({ error: 'That code is invalid or expired. Request a new one.' });
        }//?

        if (!sameHash(challenge.code_hash, hashCode(email, code))) {
            const attempts = challenge.attempts + 1;
            if (attempts >= MAX_CODE_ATTEMPTS) {
                await client.query('DELETE FROM auth_codes WHERE email = $1', [email]);
            } else {
                await client.query(
                    'UPDATE auth_codes SET attempts = $2 WHERE email = $1',
                    [email, attempts],
                );
            }
            await client.query('COMMIT');
            return res.status(400).json({ error: 'That code is invalid or expired. Request a new one.' });
        }//?

        const userResult = await client.query(
            `INSERT INTO users (email)
             VALUES ($1)
             ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
             RETURNING id`,
            [email],
        );
        const userId = userResult.rows[0].id;
        const refreshToken = createRefreshToken();
        const refreshExpiresAt = refreshTokenExpiresAt();
        await client.query('DELETE FROM auth_codes WHERE email = $1', [email]);
        await client.query(
            `INSERT INTO auth_sessions (id, user_id, refresh_token_hash, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [randomUUID(), userId, hashRefreshToken(refreshToken), refreshExpiresAt],
        );
        const accessToken = await createAccessToken(userId);
        await client.query('COMMIT');

        return res.status(200).json({
            accessToken,
            accessTokenExpiresIn,
            refreshToken,
            user: { id: userId, email },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

router.post('/refresh', authRateLimit, async (req, res) => {
    const token = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    if (!token || token.length > 200) {
        return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }//if the token is not valid or is too long, return an error

    const client = await pool.connect();//borrow a client from the connection pool to interact with the database
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `SELECT id, user_id
             FROM auth_sessions
             WHERE refresh_token_hash = $1
               AND revoked_at IS NULL
               AND expires_at > now()
             FOR UPDATE`,
            [hashRefreshToken(token)],
        );//retrieve the session associated with the provided refresh token, ensuring that it is not revoked and has not expired. The FOR UPDATE clause locks the selected row to prevent concurrent modifications.

        const session = result.rows[0];//if there is no session, return an error
        if (!session) {
            await client.query('COMMIT');
            return res.status(401).json({ error: 'Invalid or expired refresh token.' });
        }

        const nextRefreshToken = createRefreshToken();
        await client.query(
            `UPDATE auth_sessions
             SET refresh_token_hash = $2, expires_at = $3
             WHERE id = $1`,
            [session.id, hashRefreshToken(nextRefreshToken), refreshTokenExpiresAt()],
        );//update the session with a new refresh token and expiration time, effectively rotating the refresh token for security purposes.

        const accessToken = await createAccessToken(session.user_id);
        await client.query('COMMIT');
        return res.status(200).json({
            accessToken,
            accessTokenExpiresIn,
            refreshToken: nextRefreshToken,
        });//return the new access token and refresh token to the client, allowing them to continue their authenticated session without needing to log in again.
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

router.post('/logout', async (req, res) => {
    const token = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    if (token && token.length <= 200) {
        await pool.query(
            `UPDATE auth_sessions
             SET revoked_at = now()
             WHERE refresh_token_hash = $1 AND revoked_at IS NULL`,
            [hashRefreshToken(token)],
        );
    }
    return res.status(204).end();
});

export default router;