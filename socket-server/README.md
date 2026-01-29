# TriGo Socket Server (Booking Chat)

Real-time chat between passenger and driver uses Socket.IO. This server handles `join_booking` and `message` events, verifies tokens, stores messages via Laravel, and broadcasts to the room.

## Setup

1. Install deps: run `npm install` inside `socket-server/` once. Then from project root, run `npm run socket` (the script `cd`s into `socket-server/` and runs the server).
2. Ensure `.env` exists in project root with:
   - `CHAT_TOKEN_SECRET` – same as Laravel (used to verify chat tokens)
   - `CHAT_INTERNAL_SECRET` – same as Laravel (used when calling Laravel store-internal)
   - `APP_URL` or `LARAVEL_URL` – Laravel app URL (e.g. `http://127.0.0.1:8000`)
   - `SOCKET_PORT` (optional) – default `3001`

The server loads `../.env` via `node --env-file=../.env` when run from project root.

## Run

From project root:

```bash
npm run socket
```

Or from this directory: `node --env-file=../.env server.js` (after `npm install`).

## Laravel

- Ensure `config('services.chat.socket_url')` matches this server (e.g. `http://127.0.0.1:3001`).
- Run `php artisan config:clear` after changing `.env`.
