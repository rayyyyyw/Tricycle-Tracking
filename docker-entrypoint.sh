#!/bin/sh
set -e

# Create SQLite database file if using sqlite and it doesn't exist
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    if [ ! -f database/database.sqlite ]; then
        touch database/database.sqlite
        echo "Created database/database.sqlite"
    fi
fi

# Create storage symlink so /storage URLs work (avatars, uploads)
php artisan storage:link --force 2>/dev/null || true

# Run migrations (needed for sessions, cache, and app tables)
php artisan migrate --force --no-interaction

exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
