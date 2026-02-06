# Deploying to Render

## Required Environment Variables

Set these in **Render Dashboard → Your Service → Environment**:

| Variable | Value | Required |
|----------|-------|----------|
| `APP_KEY` | Run `php artisan key:generate --show` locally | **Yes** |
| `APP_URL` | `https://trigo.pro` (or your custom domain / Render URL) | **Yes** |
| `APP_ENV` | `production` | Yes |
| `APP_DEBUG` | `false` | Yes |

## Images / Storage

- The deployment runs `php artisan storage:link` so `/storage` URLs work.
- **Note:** Render's disk is ephemeral. User-uploaded images (avatars, documents) are lost on each redeploy. For persistent uploads, use **S3** or **Render Disk** and configure `FILESYSTEM_DISK=s3` (or equivalent).

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

## Socket Server (Chat / Real-time)

To run the chat socket server online:

### 1. Add a second Web Service

1. Render Dashboard → **+ New** → **Web Service**.
2. Connect the **same repository** as your Laravel app.
3. Configure:
   - **Name:** `trigo-socket` (or similar)
   - **Root Directory:** `socket-server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `LARAVEL_URL` | `https://trigo.pro` (or your Laravel app URL) |
   | `CORS_ORIGIN` | `https://trigo.pro` (same as Laravel – allows frontend to connect) |
   | `CHAT_INTERNAL_SECRET` | Generate a random string (e.g. `openssl rand -hex 32`) |
   | `CHAT_TOKEN_SECRET` | Same as Laravel `APP_KEY` (or set `CHAT_TOKEN_SECRET` in both) |
   | `APP_KEY` | Same as Laravel `APP_KEY` (used if `CHAT_TOKEN_SECRET` is not set) |

5. Deploy. Render will assign a URL like `https://trigo-socket.onrender.com`.

### 2. Configure Laravel to use the socket URL

In your **Laravel service** Environment, add:

| Variable | Value |
|----------|-------|
| `SOCKET_IO_URL` | `https://trigo-socket.onrender.com` (your socket service URL) |
| `CHAT_INTERNAL_SECRET` | **Same value** as in the socket service |

The socket server uses `PORT` (Render sets this automatically).

### 3. (Free tier) Keep the socket service awake

On Render’s free tier, services sleep after ~15 minutes of inactivity. Cold starts take 30–60 seconds, which can cause chat to appear offline on first load.

**Option A – UptimeRobot (free):**

1. Go to [uptimerobot.com](https://uptimerobot.com) and create an account.
2. Add a new monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Trigo Socket
   - **URL:** `https://trigo-socket.onrender.com`
   - **Monitoring Interval:** 5 minutes (or the minimum allowed)
3. UptimeRobot will ping the socket service regularly so it stays awake.

**Option B – Upgrade:** Use a paid Render instance for the socket service so it stays running.

---

## Debugging 500 Errors

1. **Check Render logs**: Dashboard → Your Service → Logs. Look for the PHP/Laravel exception.
2. **Temporarily enable debug**: Set `APP_DEBUG=true` to see the error page, then **set it back to `false`**.
3. **Common causes**:
   - Missing `APP_KEY`
   - Database not set up or wrong credentials
   - Migrations not run (sessions/cache tables missing)

## Debugging Chat / Socket Offline

If chat shows "Offline" or "Chat is temporarily unavailable":

1. **Check Trigo-Socket logs**: Render Dashboard → Trigo-Socket → Logs. Look for errors or "Socket.IO server listening on port X".
2. **Verify env vars**: Laravel must have `SOCKET_IO_URL` and `CHAT_INTERNAL_SECRET`; both must match the socket service.
3. **Free tier cold start**: On the free tier, the socket service sleeps. First connection can take 30–60 seconds. The app will retry for about 2 minutes—wait or set up UptimeRobot (see Socket Server section above).
4. **Test socket URL**: Open `https://trigo-socket.onrender.com` in a browser. You should get some response (e.g. 400 or Socket.IO handshake); a timeout means the service isn’t reachable.
