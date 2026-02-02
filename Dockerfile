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

# ===== Copy composer files and install PHP dependencies =====
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# ===== Copy Node.js package files and install JS dependencies =====
COPY package.json package-lock.json ./
RUN npm install

# ===== Copy all application files =====
COPY . .

# ===== Build frontend assets =====
RUN npm run build

# ===== Expose port =====
EXPOSE 8000

# ===== Start Laravel server =====
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
