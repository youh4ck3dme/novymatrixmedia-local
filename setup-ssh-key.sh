#!/bin/bash
# ============================================================
# Nový Matrix Media – Jednorazové nastavenie SSH kľúča
# WebSupport shell.r6.websupport.sk:25802
# Spusti raz z Git Bash: bash setup-ssh-key.sh
# ============================================================

if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo "❌ Súbor .env.production neexistuje."
    exit 1
fi

KEY_FILE="$HOME/.ssh/websupport_r6"

# Generuj kľúč ak neexistuje
if [ ! -f "$KEY_FILE" ]; then
    echo "🔑 Generujem SSH kľúč: $KEY_FILE"
    ssh-keygen -t ed25519 -C "nmm-websupport-r6" -f "$KEY_FILE" -N ""
    echo "✅ Kľúč vygenerovaný."
else
    echo "ℹ️  SSH kľúč už existuje: $KEY_FILE"
fi

# Pridaj do SSH config
SSH_CONFIG="$HOME/.ssh/config"
if ! grep -q "websupport-r6" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# WebSupport r6 – Nový Matrix Media
Host websupport-r6
    HostName ${SSH_HOST}
    User ${SSH_USER}
    Port ${SSH_PORT}
    IdentityFile ~/.ssh/websupport_r6
    StrictHostKeyChecking accept-new
EOF
    echo "✅ SSH config doplnený."
fi

# Nahraj verejný kľúč na server heslom
echo "📤 Nahrávam verejný kľúč na server (potrebné heslo)..."
if command -v sshpass &> /dev/null; then
    sshpass -p "${SSH_PASS}" ssh-copy-id \
        -i "$KEY_FILE.pub" \
        -p ${SSH_PORT} \
        -o StrictHostKeyChecking=accept-new \
        ${SSH_USER}@${SSH_HOST}
    echo "✅ Verejný kľúč nahraný. Ďalšie prihlásenia budú bez hesla."
else
    echo ""
    echo "⚠️  sshpass nie je dostupný. Skopíruj kľúč manuálne:"
    echo ""
    echo "   Obsah verejného kľúča (skopíruj):"
    cat "$KEY_FILE.pub"
    echo ""
    echo "   Príkaz pre manuálne nahranie (zadaj heslo ${SSH_PASS} ak vyzve):"
    echo "   ssh-copy-id -i $KEY_FILE.pub -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST}"
fi

echo ""
echo "✅ Setup hotový! Otestuj: ssh websupport-r6"
