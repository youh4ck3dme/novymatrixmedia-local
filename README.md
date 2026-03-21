# Nový Matrix Media – Projektová Dokumentácia

Informačno-publicistický portál **novymatrixmedia.sk** — WordPress + Next.js PWA.

---

## 📂 Štruktúra projektu

```text
novymatrixmedia-local/
├── nmm-pwa/                  # Next.js 16 PWA (React 19, Tailwind 4)
│   ├── src/app/              # App Router stránky
│   ├── src/components/       # MatrixBackground, MatrixHero
│   ├── .env.local            # LOKÁLNE premenné (gitignored)
│   └── .env.example          # Šablóna pre produkciu
├── wp-content/               # WordPress témy, pluginy, uploads
│   └── themes/kadence-child/ # Aktívna téma
├── wp-config.php             # Lokálna WP konfigurácia
├── wp-config-production.php  # ⚠️ Produkčná konfigurácia (gitignored)
├── .env.production           # ⚠️ Produkčné premenné (gitignored)
├── deploy-websupport.sh      # Deploy skript (rsync + WP-CLI)
├── ssh-tunnel.sh             # SSH tunel na WebSupport
├── setup-ssh-key.sh          # Jednorazový SSH kľúč setup
└── setup_vps.sh              # Legacy VPS setup (archív)
```

---

## 🖥️ Lokálny Vývoj

### Požiadavky

- Node.js 22+ / npm 10+
- PHP 8.2+ + MySQL (Local by WP Engine / XAMPP)
- Git Bash (pre deploy skripty)

### Spustenie Next.js PWA

```bash
cd nmm-pwa
npm install          # prvé spustenie
npm run dev          # http://localhost:3000
npm run build        # produkčný build
```

### WordPress lokálne

- URL: `http://localhost:8080`
- DB: `novymatrixmedia` @ `127.0.0.1:3306`
- Admin: viď lokálne `.env` / správcovský prístup

---

## 🚀 Deploy na Produkciu (WebSupport)

### Hosting infraštruktúra

| Komponent | Hodnota |
| --- | --- |
| Hosting | WebSupport – server **r6** |
| Doména | `novymatrixmedia.sk` |
| PHP | 8.2-fpm |
| Databázový server | `db.r6.websupport.sk:3306` |
| SSH Host | `shell.r6.websupport.sk` + aktuálny shell port |
| API | `https://rest.websupport.sk/v2` |

### Pred prvým deployom – jednorazový setup

**1. Vyplň prístupové údaje** (dostaneš ich od administrátora):

```bash
# Otvor .env.production a dokonči SMTP_PASS po vytvorení emailovej schránky
# Over SSH_REMOTE_PATH: po SSH prihlásení spusti `pwd`
```

**2. Nastav SSH kľúč** (odporúčané – nevyžaduje heslo pri každom deployi):

> ⚠️ **WebSupport rotuje SSH/FTP heslo každú hodinu.** Preto je kľúčová autentifikácia nevyhnutná pre automatizovaný deploy.

Vygenerovaný verejný kľúč (už existuje v `~/.ssh/websupport_r6.pub`):

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKTJ14/M+HeYHWmNzFZAv+Rew3VXNldZIsiJ+FfrM5J8 nmm-websupport-r6
```

#### Možnosť A – Automaticky cez Python (odporúčané)

Získaj čerstvé heslo z WebSupport panela (sekcia **SSH / Shell**), potom spusti:

```bash
set SSH_PORT=AKTUALNY_PORT
set SSH_PASS=AKTUALNE_HESLO
python ws_setup_ssh.py
```

> Ak `paramiko` nie je nainštalovaný: `pip install paramiko`

#### Možnosť B – Ručne cez webový shell

1. Otvor `https://shell.r6.websupport.sk:24753` (prihlás sa cez WebSupport panel)
2. Vlož do terminálu:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKTJ14/M+HeYHWmNzFZAv+Rew3VXNldZIsiJ+FfrM5J8 nmm-websupport-r6" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys
pwd
```

1. Výstup `pwd` skopíruj do `.env.production` → `SSH_REMOTE_PATH`

#### Možnosť C – Cez Git Bash skript

```bash
# z Git Bash v koreňovom adresári projektu:
bash setup-ssh-key.sh
```

**3. Over cestu na serveri (po nahratí kľúča):**

```bash
ssh websupport-r6        # použije ~/.ssh/websupport_r6 (bez hesla)
# alebo:
ssh -i ~/.ssh/websupport_r6 uid6237660@shell.r6.websupport.sk -p29753
pwd                      # → skopíruj cestu do SSH_REMOTE_PATH v .env.production
```

> Predpokladaná hodnota býva `/web/uid6237660/sub/www`, ale rozhodujúci je reálny výstup `pwd`.

### Deploy (každé vydanie)

```bash
# Windows PowerShell v koreňovom adresári projektu:
pwsh -File .\deploy-websupport.ps1

# Git Bash alternatíva:
bash deploy-websupport.sh
```

Deploy automaticky:

1. Nahrá súbory cez `rsync` (preskočí `.git`, `node_modules`, `.env*`)
2. Nasadí `wp-config-production.php` ako `wp-config.php`
3. Importuje databázu zo SQL dumpu
4. Vykoná `wp search-replace` URL (localhost → <https://novymatrixmedia.sk>)
5. Flushne cache a rewrite pravidlá
6. Remote Next.js build je štandardne vypnutý, pretože na shared hostingu často padá na limite pamäte

Ak chceš explicitne skúsiť remote build:

```bash
pwsh -File .\deploy-websupport.ps1 -RunBuild

# alebo v Git Bash:
RUN_REMOTE_BUILD=1 bash deploy-websupport.sh
```

### SSH tunel (pre vzdialený prístup k DB)

```bash
# Otvorí lokálny port 3307 → MySQL na produkčnom serveri
bash ssh-tunnel.sh

# Pripoj sa (napr. TablePlus, DBeaver):
# Host: 127.0.0.1, Port: 3307, DB: ytk8fobx
```

---

## 🌐 WebSupport REST API (DNS správa)

Dokumentácia: <https://rest.websupport.sk/v2/docs>

```bash
# Príklad – zoznam DNS záznamov pre novymatrixmedia.sk
curl -u "$WS_API_LOGIN:$WS_API_SECRET" \
  https://rest.websupport.sk/v2/user/self/zone/novymatrixmedia.sk/record
```

API prihlasovacie údaje sú uložené v `.env.production` (gitignored).

---

## 📧 Email (WebSupport)

Po vytvorení emailovej schránky `redakcia@novymatrixmedia.sk` vo WebSupport paneli:

1. Vlož heslo do `.env.production` → `SMTP_PASS`
2. Vlož heslo do `wp-config-production.php` → `WPMS_SMTP_PASS`
3. Spusti deploy: `bash deploy-websupport.sh`

SMTP nastavenia (WebSupport):

- Host: `mail.websupport.sk`, Port: `587`, Šifrovanie: `TLS`

---

## 🛠️ WordPress Konfigurácia

- **Téma**: Kadence + Kadence Child (`kadence-child`)
- **Jazyk**: Slovenčina (sk_SK)
- **Permalinks**: `/post-name/`

### Aktívne Pluginy

1. Rank Math SEO
2. Cache Enabler
3. ShortPixel Image Optimizer
4. UpdraftPlus
5. Antispam Bee
6. Wordfence Security
7. Kadence Blocks
8. WP Mail SMTP *(nakonfigurovať po deployi)*

---

## 🔒 Bezpečnosť

- `DISALLOW_FILE_EDIT = true`
- `FORCE_SSL_ADMIN = true`
- `.htaccess` blokuje: `wp-config.php`, PHP v uploads, directory listing, `xmlrpc.php`
- Wordfence Security (nastaviť 2FA po deployi)
- **Gitignorované súbory**: `.env.production`, `wp-config-production.php`, `*.sql`, `*.gz`

---

## 🔧 Git Workflow

```bash
# Klonuj (private repo)
git clone git@github.com:ORG/novymatrixmedia.git

# Nová feature
git checkout -b feature/nazov
git add .
git commit -m "feat: popis zmeny"
git push origin feature/nazov

# Merge do main → spustí deploy
git checkout main
git merge feature/nazov
bash deploy-websupport.sh
```

---

## 📦 Ďalšie kroky po deployi

1. Over SSL certifikát v WebSupport paneli (Let's Encrypt)
2. Dokonči Rank Math Setup Wizard v WP-Admin
3. Aktivuj Wordfence Firewall (Learning Mode) + 2FA pre admina
4. Vlož ShortPixel API kľúč
5. Nastav emailovú schránku a SMTP_PASS
