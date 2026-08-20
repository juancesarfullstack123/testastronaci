# syntax=docker/dockerfile:1

########################################
# 1. PHP dependencies (composer install)
########################################
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --ignore-platform-reqs \
    --prefer-dist

########################################
# 2. Frontend assets (Vite + React build)
########################################
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
RUN npm run build

########################################
# 3. Application runtime
########################################
FROM php:8.4-cli-alpine AS app

RUN apk add --no-cache --virtual .build-deps ${PHPIZE_DEPS} sqlite-dev oniguruma-dev \
    && docker-php-ext-install pdo pdo_sqlite mbstring \
    && apk del .build-deps \
    && apk add --no-cache sqlite-libs oniguruma

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p database \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && touch database/vouchers.db \
    && chmod -R 775 storage bootstrap/cache database

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
