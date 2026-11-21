import {createHash, createHmac, randomInt, randomBytes, randomUUID} from 'node:crypto';
import {SignJWT, jwtVerify} from 'jose';
import {config} from '../config.js';

const ISSUER = 'triggertrack';
const AUDIENCE = 'triggertrack-api';
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const jwtKey = () => new TextEncoder().encode(config.jwtSecret);

export function createCode() {
    return String(randomInt(1_000_000)).padStart(6, '0');
}

export function hashCode(email, code) {
    return createHmac('sha256', config.jwtSecret)
        .update(`${email}:${code}`)
        .digest('hex');
}

export function createRefreshToken() {
    return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token) {
    return createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiresAt() {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}

export async function createAccessToken(userId) {
    return new SignJWT({})
        .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_TTL)
        .setJti(randomUUID())
        .sign(jwtKey());
}

export async function verifyAccessToken(token) {
    const {payload} = await jwtVerify(token, jwtKey(), {
        issuer: ISSUER,
        audience: AUDIENCE,
        algorithms: ['HS256'],
    });
    return payload;
}

export const accessTokenExpiresIn = 900;