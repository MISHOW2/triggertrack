import pino from 'pino';

const logger = pino();

export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    logger.error({err: error, method: req.method, path: req.path}, 'Request failed');
    res.status(500).json({error: 'An unexpected server error occurred.'});
}