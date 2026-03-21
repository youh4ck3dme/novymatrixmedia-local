#!/bin/bash
# ============================================================
# Nový Matrix Media – Jednorazové nastavenie SSH kľúča
# WebSupport shell.r6.websupport.sk:29753
# Spusti raz z Git Bash: bash setup-ssh-key.sh
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

KEY_FILE="$HOME/.ssh/websupport_r6"
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [ ! -f "$KEY_FILE" ]; then
    echo "Generujem SSH kľúč: $KEY_FILE"
    ssh-keygen -t ed25519 -C "nmm-websupport-r6" -f "$KEY_FILE" -N ""
    echo "Kľúč vygenerovaný."
else
    echo "SSH kľúč už existuje: $KEY_FILE"
fi

SSH_CONFIG="$HOME/.ssh/config"
touch "$SSH_CONFIG"

if ! grep -q "Host websupport-r6" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# WebSupport r6 – Nový Matrix Media
Host websupport-r6
    HostName ${SSH_HOST}
    User ${SSH_USER}
    Port ${SSH_PORT}
    IdentityFile ~/.ssh/websupport_r6
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
    echo "SSH config doplnený."
fi

echo "Nahrávam verejný kľúč na server."
echo "Ak WebSupport heslo expirovalo, vygeneruj nové a aktualizuj SSH_PASS v .env.production."

if command -v ssh-copy-id >/dev/null 2>&1; then
    ssh-copy-id -i "$KEY_FILE.pub" -p "${SSH_PORT}" \
        -o StrictHostKeyChecking=accept-new \
        "${SSH_USER}@${SSH_HOST}"
else
    echo "ssh-copy-id nie je dostupné. Nahraj kľúč ručne cez web shell:"
    echo "https://shell.r6.websupport.sk:24753"
    echo
    cat "$KEY_FILE.pub"
fi

echo
echo "Otestuj prihlásenie:"
echo "ssh websupport-r6"
