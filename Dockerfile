# ===== Base Image =====
FROM php:8.2-fpm

# ===== Install System Dependencies =====
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libonig-dev \
    curl \
    npm \
    nodejs \
    && docker-php-ext-install pdo pdo_pgsql mbstring

# ===== Set Working Directory =====
WORKDIR /var/www/html

# ===== Copy Files =====
COPY . .

# ===== Install PHP Dependencies =====
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# ===== Install Node Dependencies & Build Frontend =====
RUN npm install
RUN npm run build

# ===== Generate Laravel APP Key =====
RUN php artisan key:generate

# ===== Expose Port =====
EXPOSE 10000

# ===== Start Laravel Server =====
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=10000"]
