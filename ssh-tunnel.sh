#!/bin/bash
# ============================================================
# Nový Matrix Media – SSH tunel pre WebSupport r6
# Spusti z Git Bash: bash ssh-tunnel.sh
# ============================================================

if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo "❌ Súbor .env.production neexistuje."
    exit 1
fi

echo "🔗 Otvárám SSH tunel..."
echo "   ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "   Lokálny MySQL: 127.0.0.1:3307 → db.r6.websupport.sk:3306"
echo "   Lokálny HTTP:  127.0.0.1:8081 → localhost:80 (na serveri)"
echo "   Ctrl+C pre ukončenie."

# Použi sshpass ak je dostupný (heslo), inak SSH kľúč
if command -v sshpass &> /dev/null; then
    sshpass -p "${SSH_PASS}" ssh -N \
        -L 3307:${DB_HOST}:3306 \
        -L 8081:localhost:80 \
        -p ${SSH_PORT} \
        -o StrictHostKeyChecking=accept-new \
        ${SSH_USER}@${SSH_HOST}
else
    echo "⚠️  sshpass nenájdený – používam SSH kľúč (~/.ssh/websupport_r6)"
    echo "   Ak kľúč neexistuje: bash setup-ssh-key.sh"
    ssh -N \
        -L 3307:${DB_HOST}:3306 \
        -L 8081:localhost:80 \
        -p ${SSH_PORT} \
        -i ~/.ssh/websupport_r6 \
        -o StrictHostKeyChecking=accept-new \
        ${SSH_USER}@${SSH_HOST}
fi
