export const config = {
    port: Number(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    appOrigin: process.env.APP_ORIGIN,
    isProduction: process.env.NODE_ENV === 'production',
    allowDevCode:
        process.env.NODE_ENV !== 'production' &&
        (process.env.AUTH_RETURN_CODE !== 'false'),
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
        from: process.env.SMTP_FROM,
    },
};

export function validateConfig() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'APP_ORIGIN',
    ];
    const missing = required.filter((name) => !process.env[name]);
    const smtpConfigured = Boolean(
        config.smtp.host && config.smtp.user && config.smtp.password && config.smtp.from,
    );
    if (!smtpConfigured && (config.isProduction || !config.allowDevCode)) {
        const smtpRequired = ['SMTP_HOST', 'SMTP_USER', 'SMTP_FROM'];
        if (!process.env.SMTP_PASSWORD && !process.env.SMTP_PASS) {
            smtpRequired.push('SMTP_PASSWORD (or SMTP_PASS)');
        }
        missing.push(...smtpRequired.filter((name) => !process.env[name]));
        if (!config.isProduction && !config.allowDevCode) {
            missing.push('AUTH_RETURN_CODE=true for local development without SMTP');
        }
    }
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (Buffer.byteLength(config.jwtSecret, 'utf8') < 32) {
        throw new Error('JWT_SECRET must be at least 32 bytes long.');
    }
    if (!Number.isInteger(config.smtp.port) || config.smtp.port < 1 || config.smtp.port > 65535) {
        throw new Error('SMTP_PORT must be a valid TCP port.');
    }
    try {
        const origin = new URL(config.appOrigin);
        if (!['http:', 'https:'].includes(origin.protocol)) {
            throw new Error();
        }
    } catch {
        throw new Error('APP_ORIGIN must be an absolute HTTP or HTTPS URL.');
    }
}