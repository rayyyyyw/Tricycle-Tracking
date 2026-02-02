# ===== Base Image =====
FROM php:8.2-fpm

# ===== Set working directory =====
WORKDIR /var/www/html

# ===== Install system dependencies =====
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    curl \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_pgsql zip

# ===== Copy application files =====
COPY . .

# ===== Install Composer =====
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ===== Install PHP dependencies =====
RUN composer install --no-dev --optimize-autoloader

# ===== Install Node.js dependencies & build frontend =====
RUN npm install
RUN npm run build

# ===== Expose port =====
EXPOSE 8000

# ===== Start Laravel server =====
# Laravel will automatically read APP_KEY and DB credentials from environment variables
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
