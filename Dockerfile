# ===== Base Image =====
FROM php:8.2-fpm-alpine

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

# ===== Install Node dependencies =====
RUN npm install
RUN npm run build

# ===== Set permissions =====
RUN chown -R www-data:www-data storage bootstrap/cache

# ===== Expose port =====
EXPOSE 8000

# ===== Start PHP-FPM =====
CMD ["php-fpm"]
