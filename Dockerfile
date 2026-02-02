# ===== Base Image =====
FROM php:8.2-cli-alpine

# ===== Set working directory =====
WORKDIR /var/www/html

# ===== Install system dependencies =====
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    nodejs \
    npm \
    yarn \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# ===== Copy entire project first =====
COPY . .

# ===== Install Composer =====
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ===== Install PHP dependencies =====
RUN composer install --no-dev --optimize-autoloader

# ===== Install Node dependencies and build frontend =====
RUN npm install
RUN npm run build

# ===== Set permissions =====
RUN chown -R www-data:www-data storage bootstrap/cache

# ===== Expose port (Render uses PORT env, default 8000) =====
EXPOSE 8000

# ===== Start Laravel HTTP server (binds to 0.0.0.0 so Render can reach it) =====
# Render injects PORT; use 8000 if not set
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
