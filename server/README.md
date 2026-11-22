# TriggerTrack API authentication

> This is a separate, experimental authentication API. The current local-only
> TriggerTrack PWA does not call or require this server. Do not deploy it as part
> of the v1 PWA; the client stores diary data on the device and has no account
> or sync flow.

Passwordless authentication uses an emailed six-digit code. Both `POST /auth/signup`
and `POST /auth/login` request a code; new users are created only after the code is
verified. `POST /auth/verify` returns a 15-minute JWT access token and a 30-day
refresh token. Access tokens contain the user ID in `sub`, plus standard issuer,
audience, issue-time, expiry, and token-ID claims. Refresh tokens rotate on use.

## Setup

1. Copy `.env.example` to `.env` and set a PostgreSQL connection string, a random
   `JWT_SECRET` of at least 32 bytes, the frontend origin, and SMTP credentials.
2. Apply `migrations/0001_profiles_and_auth.sql` to the database.
3. Run `npm run dev` from this directory.

Never commit `.env`. The database stores only hashes of verification codes and
refresh tokens. Codes expire in 10 minutes, allow five attempts, and can be
resent after 30 seconds. Authentication requests are also rate-limited by IP.
For local testing without SMTP, keep `NODE_ENV=development`; `/auth/login`
then returns the generated code in `devCode`. Set `AUTH_RETURN_CODE=false` to
disable local code exposure explicitly. This option is always disabled in
production. Never enable a development environment in a deployed system.

## Endpoints

- `POST /auth/signup` or `POST /auth/login` with `{ "email": "..." }`
- `POST /auth/verify` with `{ "email": "...", "code": "123456" }`
- `POST /auth/refresh` with `{ "refreshToken": "..." }`
- `POST /auth/logout` with `{ "refreshToken": "..." }`

Send the access token to protected API routes as
`Authorization: Bearer <accessToken>`. Use `requireAuth` middleware to verify it;
the authenticated user ID is available as `req.user.id`.
