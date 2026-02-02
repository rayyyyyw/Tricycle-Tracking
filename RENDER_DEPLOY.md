# Deploying to Render

## Required Environment Variables

Set these in **Render Dashboard → Your Service → Environment**:

| Variable | Value | Required |
|----------|-------|----------|
| `APP_KEY` | Run `php artisan key:generate --show` locally | **Yes** |
| `APP_URL` | `https://tricycle-tracking.onrender.com` (your Render URL) | **Yes** |
| `APP_ENV` | `production` | Yes |
| `APP_DEBUG` | `false` | Yes |

## Database Options

### Option A: SQLite (simplest, data resets on redeploy)
- `DB_CONNECTION` = `sqlite`
- No other DB vars needed. The entrypoint creates the DB and runs migrations automatically.
- **Note:** Render's disk is ephemeral; SQLite data is lost when the instance restarts. Use only for testing.

### Option B: Render PostgreSQL (recommended for production)
1. Add a **PostgreSQL** database in Render (same project).
2. Set these env vars (Render auto-injects them if you use "Connect" from the DB):
   - `DB_CONNECTION` = `pgsql`
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
3. Set **Release Command**: `php artisan migrate --force`
4. The entrypoint will also run migrations; either is fine.

## Session & Cache (if you get 500 errors)

If you see 500 errors and suspect database/session issues, try:

| Variable | Value |
|----------|-------|
| `SESSION_DRIVER` | `cookie` |
| `CACHE_STORE` | `array` |

This avoids needing database tables for session/cache. Use only for debugging; for production with a DB, use `database`.

## Debugging 500 Errors

1. **Check Render logs**: Dashboard → Your Service → Logs. Look for the PHP/Laravel exception.
2. **Temporarily enable debug**: Set `APP_DEBUG=true` to see the error page, then **set it back to `false`**.
3. **Common causes**:
   - Missing `APP_KEY`
   - Database not set up or wrong credentials
   - Migrations not run (sessions/cache tables missing)
