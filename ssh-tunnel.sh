#!/bin/bash
# ============================================================
# Nový Matrix Media – SSH tunel pre WebSupport r6
# Spusti z Git Bash: bash ssh-tunnel.sh
# ============================================================

set -euo pipefail

if [ -f ".env.production" ]; then
    set -a
    . ./.env.production
    set +a
else
    echo "Súbor .env.production neexistuje."
    exit 1
fi

echo "Otváram SSH tunel..."
echo "  ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "  Lokálny MySQL: 127.0.0.1:3307 -> ${DB_HOST}:3306"
echo "  Lokálny HTTP:  127.0.0.1:8081 -> localhost:80"
echo "  Ctrl+C pre ukončenie."

ssh -N \
    -L 3307:${DB_HOST}:3306 \
    -L 8081:localhost:80 \
    -p "${SSH_PORT}" \
    -i "$HOME/.ssh/websupport_r6" \
    -o IdentitiesOnly=yes \
    -o StrictHostKeyChecking=accept-new \
    "${SSH_USER}@${SSH_HOST}"
