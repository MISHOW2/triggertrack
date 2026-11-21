import assert from 'node:assert/strict';
import {test} from 'node:test';

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-bytes';
const tokens = await import('../src/services/tokens.js');

test('one-time codes are six digits and hashes are email-bound', () => {
    const code = tokens.createCode();
    assert.match(code, /^\d{6}$/);
    assert.notEqual(tokens.hashCode('one@example.com', code), tokens.hashCode('two@example.com', code));
});

test('access tokens identify the user without embedding personal data', async () => {
    const token = await tokens.createAccessToken('user-123');
    const payload = await tokens.verifyAccessToken(token);
    assert.equal(payload.sub, 'user-123');
    assert.equal(payload.iss, 'triggertrack');
    assert.equal(payload.aud, 'triggertrack-api');
    assert.equal('email' in payload, false);
});

test('refresh tokens are random and only their hash is stored', () => {
    const token = tokens.createRefreshToken();
    assert.notEqual(tokens.hashRefreshToken(token), token);
    assert.notEqual(tokens.hashRefreshToken(token), tokens.hashRefreshToken(tokens.createRefreshToken()));
});
