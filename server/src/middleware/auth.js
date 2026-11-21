import {verifyAccessToken} from '../services/tokens.js';

export async function requireAuth(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) {
        return res.status(401).json({error: 'Authentication required.'});
    }

    try {
        const payload = await verifyAccessToken(match[1]);
        if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
            return res.status(401).json({error: 'Invalid access token.'});
        }
        req.user = {id: payload.sub};
        return next();
    } catch {
        return res.status(401).json({error: 'Invalid or expired access token.'});
    }
}