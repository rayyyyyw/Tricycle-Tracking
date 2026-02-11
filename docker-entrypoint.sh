#!/bin/sh
set -e

# Create SQLite database file if using sqlite and it doesn't exist
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    if [ ! -f database/database.sqlite ]; then
        touch database/database.sqlite
        echo "Created database/database.sqlite"
    fi
fi

# Start the server in the background immediately so Render's port scan sees an open port
# (migrations can take 30+ seconds; Render times out if no port is open in time)
php artisan serve --host=0.0.0.0 --port=${PORT:-8000} &
SERVER_PID=$!

# Create storage symlink so /storage URLs work (avatars, uploads)
php artisan storage:link --force 2>/dev/null || true

# Run migrations (sessions, cache, app tables)
php artisan migrate --force --no-interaction

# Wait for the server (keeps container running)
wait $SERVER_PID
