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
RUN chown -R www-data:www-data storage bootstrap/cache database

# ===== Copy and set entrypoint =====
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ===== Expose port (Render uses PORT env, default 8000) =====
EXPOSE 8000

# ===== Start via entrypoint (creates DB, runs migrations, starts server) =====
ENTRYPOINT ["docker-entrypoint.sh"]
