#!/bin/bash

# Novy Matrix Media - VPS Setup & Deployment Script
# This script automates the installation of PHP, Nginx, MariaDB, Node.js, and PM2.
# It also handles the deployment of the WordPress + PWA bundle.

set -e

# --- Configuration ---
DOMAIN="novymatrixmedia.sk"  # REPLACE WITH YOUR ACTUAL DOMAIN
DB_NAME="novymatrixmedia"
DB_USER="nmm_user"
DB_PASS=$(openssl rand -base64 12)
PROJECT_DIR="/var/www/novymatrixmedia"
BUNDLE_FILE="nmm_deploy_bundle.tar.gz"

echo "🚀 Starting VPS Setup for $DOMAIN..."

# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
sudo apt install -y nginx mariadb-server php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip unzip curl git

# 3. Install Node.js (LTS) & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 4. Prepare Project Directory
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# 5. Extract Bundle
if [ -f "$BUNDLE_FILE" ]; then
    echo "📦 Extracting bundle..."
    tar -xzf $BUNDLE_FILE -C $PROJECT_DIR
else
    echo "❌ Error: $BUNDLE_FILE not found in current directory."
    exit 1
fi

# 6. Database Setup
echo "DB Password for $DB_USER: $DB_PASS"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 7. Import Database
echo "📥 Importing database..."
zcat $PROJECT_DIR/novymatrixmedia_export.sql.gz | sudo mysql $DB_NAME

# 8. Update WordPress Config
echo "⚙️ Updating wp-config.php..."
cd $PROJECT_DIR
sed -i "s/define( 'DB_NAME', '.*' );/define( 'DB_NAME', '$DB_NAME' );/" wp-config.php
sed -i "s/define( 'DB_USER', '.*' );/define( 'DB_USER', '$DB_USER' );/" wp-config.php
sed -i "s/define( 'DB_PASSWORD', '.*' );/define( 'DB_PASSWORD', '$DB_PASS' );/" wp-config.php
sed -i "s/define( 'DB_HOST', '.*' );/define( 'DB_HOST', 'localhost' );/" wp-config.php

# 9. Search & Replace URL (Assumes WP-CLI if needed, or simple SQL)
# For simplicity, we use a manual SQL update for basic URLs.
# For full serialization support, install WP-CLI.
echo "🔗 Updating URLs in database..."
sudo mysql $DB_NAME -e "UPDATE wp_options SET option_value = REPLACE(option_value, 'http://localhost:8888', 'https://$DOMAIN') WHERE option_name = 'home' OR option_name = 'siteurl';"

# 10. Configure Nginx
echo "🌐 Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/novymatrixmedia"
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $PROJECT_DIR;

    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    # PWA Proxy (Next.js)
    location /pwa {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo system merry reload nginx

# 11. Start PWA with PM2
echo "⚛️ Starting Next.js PWA..."
cd $PROJECT_DIR/nmm-pwa
npm install --production
pm2 start npm --name "nmm-pwa" -- start

# 12. Final touches
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

echo "✅ Deployment completed!"
echo "Next steps:"
echo "1. Point DNS of $DOMAIN to this VPS IP."
echo "2. Run 'sudo certbot --nginx -d $DOMAIN' to enable SSL (requires certbot installed)."
