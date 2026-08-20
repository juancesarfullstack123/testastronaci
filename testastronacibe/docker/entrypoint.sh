#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q "^APP_KEY=base64" .env; then
    php artisan key:generate --force
fi

if [ ! -f database/vouchers.db ]; then
    touch database/vouchers.db
fi

php artisan migrate --force

exec "$@"
