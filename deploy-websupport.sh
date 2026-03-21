#!/bin/bash
# ============================================================
# Nový Matrix Media – Deploy na WebSupport
# Použitie: bash deploy-websupport.sh
# ============================================================

set -euo pipefail

RUN_REMOTE_BUILD="${RUN_REMOTE_BUILD:-0}"

if [ -f ".env.production" ]; then
    set -a
    . ./.env.production
    set +a
else
    echo "Súbor .env.production neexistuje."
    exit 1
fi

SSH_KEY_PATH="${SSH_KEY_PATH:-${HOME}/.ssh/websupport_r6}"
if [ -f "${SSH_KEY_PATH}" ]; then
    SSH_OPTS=(-p "${SSH_PORT}" -i "${SSH_KEY_PATH}" -o IdentitiesOnly=yes)
    SSH_RSYNC_CMD="ssh -p ${SSH_PORT} -i ${SSH_KEY_PATH} -o IdentitiesOnly=yes"
    echo "Používam SSH kľúč: ${SSH_KEY_PATH}"
else
    SSH_OPTS=(-p "${SSH_PORT}")
    SSH_RSYNC_CMD="ssh -p ${SSH_PORT}"
    echo "SSH kľúč nebol nájdený, použijem password autentifikáciu."
fi

echo "Spúšťam deploy na ${WP_HOME}"
echo "Server: ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "Cesta:  ${SSH_REMOTE_PATH}"
echo

echo "[1/5] Nahrávam súbory cez rsync..."
rsync -avz --progress \
    --exclude='.git' \
    --exclude='.vscode' \
    --exclude='.env*' \
    --exclude='README.md' \
    --exclude='*.code-workspace' \
    --exclude='docs' \
    --exclude='node_modules' \
    --exclude='nmm-pwa/.next' \
    --exclude='nmm-pwa/node_modules' \
    --exclude='*.sql' \
    --exclude='*.sql.gz' \
    --exclude='*.gz' \
    --exclude='*.tar' \
    --exclude='wp-config.php' \
    --exclude='wp-config-production.php' \
    --exclude='deploy-websupport.sh' \
    --exclude='setup-ssh-key.sh' \
    --exclude='setup_vps.sh' \
    --exclude='ssh-tunnel.sh' \
    --exclude='ws_setup_ssh.py' \
    -e "${SSH_RSYNC_CMD}" \
    . \
    "${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/"

echo "[2/5] Nahrávam wp-config-production.php..."
scp "${SSH_OPTS[@]}" \
    wp-config-production.php \
    "${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/wp-config.php"

if [ -f "novymatrixmedia_export.sql.gz" ] && [ ! -f "novymatrixmedia_export.sql" ]; then
    gunzip -k novymatrixmedia_export.sql.gz
fi

if [ -f "novymatrixmedia_export.sql" ]; then
    echo "[3/5] Nahrávam a importujem databázu..."
    scp "${SSH_OPTS[@]}" \
        novymatrixmedia_export.sql \
        "${SSH_USER}@${SSH_HOST}:${SSH_REMOTE_PATH}/novymatrixmedia_export.sql"

    ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" << REMOTE
cd "${SSH_REMOTE_PATH}"
if command -v wp >/dev/null 2>&1; then
    wp db import novymatrixmedia_export.sql
else
    mysql -h "${DB_HOST}" -u "${DB_USER}" -p'${DB_PASS}' "${DB_NAME}" < novymatrixmedia_export.sql
fi
rm -f novymatrixmedia_export.sql
REMOTE
else
    echo "[3/5] SQL dump neexistuje, DB import preskakujem."
fi

echo "[4/5] Search-replace URL a cache flush..."
ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" << REMOTE
cd "${SSH_REMOTE_PATH}"
if command -v wp >/dev/null 2>&1; then
    wp search-replace '${OLD_URL}' '${WP_HOME}' --all-tables --skip-columns=guid || true
    wp search-replace 'http://novymatrixmedia.sk' 'https://novymatrixmedia.sk' --all-tables --skip-columns=guid || true
    wp rewrite flush || true
    wp cache flush || true
    wp transient delete --all || true
fi
REMOTE

if [ "${RUN_REMOTE_BUILD}" = "1" ]; then
    echo "[5/5] Build Next.js aplikácie..."
    ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_HOST}" << REMOTE
if [ -d "${SSH_REMOTE_PATH}/nmm-pwa" ]; then
    cd "${SSH_REMOTE_PATH}/nmm-pwa"
    npm install --legacy-peer-deps || npm install
    npm run build
    echo "Next.js build dokončený."
    echo "Runtime proces pre Next.js treba spustiť podľa možností WebSupport hostingu."
else
    echo "Adresár nmm-pwa na serveri neexistuje, build preskakujem."
fi
REMOTE
else
    echo "[5/5] Remote build je vypnuty (nastav RUN_REMOTE_BUILD=1 ak ho chces spustit)."
fi

echo
echo "Deploy dokončený."
echo "${WP_HOME}"
