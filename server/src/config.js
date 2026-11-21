const required = ['DATABASE_URL', 'JWT_SECRET', 'APP_ORIGIN'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    appOrigin: process.env.APP_ORIGIN,
};