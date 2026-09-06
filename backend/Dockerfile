FROM php:8.2-apache

# Install PDO MySQL extension and SSL CA certificates
RUN docker-php-ext-install pdo pdo_mysql && \
    apt-get update && apt-get install -y ca-certificates && \
    update-ca-certificates && \
    a2enmod rewrite headers

# Copy backend application files
COPY . /var/www/html/

# Set working directory & Apache port
WORKDIR /var/www/html
EXPOSE 80

CMD ["apache2-foreground"]
