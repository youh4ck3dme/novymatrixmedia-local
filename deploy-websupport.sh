#!/bin/bash
# ============================================================
# Nový Matrix Media – Deploy na WebSupport (shared hosting)
# Použitie: bash deploy-websupport.sh
# ============================================================

set -e

# Načítaj premenné z .env.production
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo "❌ Súbor .env.production neexistuje!"
    exit 1
fi

echo "🚀 Spúšťam deploy na ${WP_HOME}..."
echo "   Server: ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "   Cesta:  ${SSH_REMOTE_PATH}"
echo ""

# --- Krok 1: Nahranie WordPress súborov cez rsync cez SSH ---
echo "📂 [1/6] Nahrávam WordPress súbory (rsync)..."
rsync -avz --progress \
    --exclude='.git' \
    --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='nmm-pwa/.next' \
    --exclude='nmm-pwa/node_modules' \
    --exclude='*.gz' \
    --exclude='*.tar' \
    --exclude='wp-config.php' \
    -e "ssh -p ${SSH_PORT}" \
    . \
    ${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/

echo "✅ Súbory nahrané."

# --- Krok 2: Nahranie wp-config.php (produkčná verzia) ---
echo "⚙️  [2/6] Nahrávam wp-config-production.php ako wp-config.php..."
scp -P ${SSH_PORT} \
    wp-config-production.php \
    ${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/wp-config.php

echo "✅ wp-config.php nasadený."

# --- Krok 3: Import databázy cez SSH + WP-CLI ---
echo "📥 [3/6] Importujem databazu..."
# Rozbaľ SQL dump lokálne ak je komprimovaný
if [ -f "novymatrixmedia_export.sql.gz" ]; then
    gunzip -k -f novymatrixmedia_export.sql.gz
fi

# Nahranie SQL súboru
scp -P ${SSH_PORT} \
    novymatrixmedia_export.sql \
    ${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/novymatrixmedia_export.sql

# Import cez WP-CLI (alebo mysql priamo)
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << REMOTE
    cd ${SSH_REMOTE_PATH}
    # Použi WP-CLI ak existuje, inak mysql klient
    if command -v wp &> /dev/null; then
        wp db import novymatrixmedia_export.sql --allow-root 2>/dev/null || \
        wp db import novymatrixmedia_export.sql
    else
        mysql -h ${DB_HOST} -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < novymatrixmedia_export.sql
    fi
    rm -f novymatrixmedia_export.sql
    echo "✅ DB importovaná."
REMOTE

# --- Krok 4: WP-CLI search-replace URL ---
echo "🔗 [4/6] Search-replace URL v databáze..."
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << REMOTE
    cd ${SSH_REMOTE_PATH}
    if command -v wp &> /dev/null; then
        wp search-replace '${OLD_URL}' '${WP_HOME}' --all-tables --skip-columns=guid
        wp search-replace 'http://novymatrixmedia.sk' 'https://novymatrixmedia.sk' --all-tables --skip-columns=guid
        echo "✅ URL search-replace hotový."
    else
        echo "⚠️  WP-CLI nie je dostupné. Spusti manuálne search-replace."
    fi
REMOTE

# --- Krok 5: Flush cache, permalinky ---
echo "🧹 [5/6] Flush cache a rewrite pravidlá..."
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << REMOTE
    cd ${SSH_REMOTE_PATH}
    if command -v wp &> /dev/null; then
        wp rewrite flush
        wp cache flush 2>/dev/null || true
        wp transient delete --all 2>/dev/null || true
        echo "✅ Cache vymazaná."
    fi
REMOTE

# --- Krok 6: Next.js PWA build & štart ---
echo "⚛️  [6/6] Build a deploy Next.js PWA..."
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << REMOTE
    cd ${SSH_REMOTE_PATH}/nmm-pwa
    npm install --production --legacy-peer-deps 2>/dev/null || npm install --production
    npm run build
    # Ak je dostupný PM2
    if command -v pm2 &> /dev/null; then
        pm2 delete nmm-pwa 2>/dev/null || true
        pm2 start npm --name "nmm-pwa" -- start
        pm2 save
        echo "✅ PWA beží pod PM2."
    else
        echo "⚠️  PM2 nie je dostupné. Spusti: npm start v ${SSH_REMOTE_PATH}/nmm-pwa"
    fi
REMOTE

echo ""
echo "✅ Deploy dokončený!"
echo "   🌐 ${WP_HOME}"
echo ""
echo "Ďalšie kroky:"
echo "  1. Over SSL certifikát (Let's Encrypt / WebSupport panel)"
echo "  2. Aktivuj Wordfence a nastav 2FA"
echo "  3. Vlož ShortPixel API kľúč"
