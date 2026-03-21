# Migrácia Databázy na Websupport.sk

## 📊 Aktuálna konfigurácia

| Parameter | Hodnota |
| ----------- | --------- |
| **Lokálny DB server** | MySQL 9.5.0 (Homebrew) |
| **Cieľový DB server** | MariaDB (Websupport.sk) |
| **DB názov** | `novymatrixmedia` |
| **DB používateľ** | `root` |
| **DB heslo** | (prázdne) |
| **DB host** | `127.0.0.1` |
| **DB charset** | `utf8` |
| **Table prefix** | `wp_` |

---

## 🔄 Možnosti migrácie

### Možnosť A: Inštalácia MariaDB lokálne (odporúčané)

MariaDB je "drop-in replacement" pre MySQL - WordPress funguje na oboch bez zmien kódu. Inštaláciou MariaDB lokálne zabezpečíte 100% kompatibilitu s produkčným serverom.

### Možnosť B: Ponechanie MySQL lokálne

WordPress je kompatibilný s MySQL aj MariaDB. Pri migrácii stačí export/import databázy. Menšie rozdiely môžu nastať pri špeciálnych SQL queries (zriedkavé).

---

## 📦 Krok 1: Inštalácia MariaDB (voliteľné)

### 1.1 Zálohovanie aktuálnej MySQL databázy

```bash
# Vytvorenie zálohy
mysqldump -u root novymatrixmedia > ~/Desktop/novymatrixmedia_backup_$(date +%Y%m%d).sql

# Skomprimovať zálohu (voliteľné)
gzip ~/Desktop/novymatrixmedia_backup_*.sql
```

### 1.2 Inštalácia MariaDB cez Homebrew

```bash
# Zastaviť MySQL
brew services stop mysql

# Inštalácia MariaDB
brew install mariadb

# Spustiť MariaDB
brew services start mariadb

# Zabezpečiť inštaláciu
mysql_secure_installation
```

### 1.3 Import databázy do MariaDB

```bash
# Vytvoriť databázu
mysql -u root -e "CREATE DATABASE novymatrixmedia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importovať zálohu
mysql -u root novymatrixmedia < ~/Desktop/novymatrixmedia_backup_YYYYMMDD.sql
```

### 1.4 Vytvorenie používateľa (ak treba)

```sql
CREATE USER 'novymatrixmedia'@'localhost' IDENTIFIED BY 'vase_heslo';
GRANT ALL PRIVILEGES ON novymatrixmedia.* TO 'novymatrixmedia'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📤 Krok 2: Export databázy pre migráciu

### 2.1 Export cez CLI

```bash
# Základný export
mysqldump -u root novymatrixmedia > novymatrixmedia_export.sql

# Export s kompresiou
mysqldump -u root novymatrixmedia | gzip > novymatrixmedia_export.sql.gz

# Export s špecifickými opciami pre kompatibilitu
mysqldump -u root --single-transaction --routines --triggers --events novymatrixmedia > novymatrixmedia_export.sql
```

### 2.2 Dôležité príznaky pre kompatibilitu

```bash
# Pre maximálnu kompatibilitu s MariaDB
mysqldump -u root \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --skip-add-drop-table \
  --complete-insert \
  novymatrixmedia > novymatrixmedia_websupport.sql
```

---

## 🌐 Krok 3: Príprava na Websupport.sk

### 3.1 Vytvorenie databázy na Websupport.sk

1. Prihláste sa do **Websupport admin panelu**
2. Prejdite do **Databázy** → **Pridať databázu**
3. Vyplňte:
   - Názov databázy: `novymatrixmedia` (alebo podľa konvencie hostingu)
   - Používateľ: vytvorte nového alebo použite existujúceho
   - Heslo: silné heslo
4. **Poznačte si:**
   - DB názov
   - DB používateľ
   - DB heslo
   - DB host (zvyčajne `localhost` alebo špecifický server)

### 3.2 Import databázy cez phpMyAdmin

1. Otvorte **phpMyAdmin** na Websupport.sk
2. Vyberte vytvorenú databázu
3. Kliknite na **Import**
4. Vyberte súbor `novymatrixmedia_websupport.sql`
5. Kliknite na **Spustiť**

### 3.3 Import cez CLI (ak je dostupný SSH)

```bash
# Na serveri websupport.sk
mysql -u db_user -p db_name < novymatrixmedia_websupport.sql
```

---

## ⚙️ Krok 4: Konfigurácia WordPress

### 4.1 Úprava wp-config.php

Upravte nasledujúce konštanty v `wp-config.php`:

```php
// ** Database settings - Websupport.sk ** //
define( 'DB_NAME', 'nazov_databazy' );           // DB názov z websupportu
define( 'DB_USER', 'nazov_pouzivatela' );        // DB používateľ
define( 'DB_PASSWORD', 'vase_heslo' );           // DB heslo
define( 'DB_HOST', 'localhost' );                // DB host (zvyčajne localhost)
define( 'DB_CHARSET', 'utf8mb4' );               // Odporúčané utf8mb4
define( 'DB_COLLATE', 'utf8mb4_unicode_ci' );    // Odporúčané collation
```

### 4.2 Generovanie nových salt keys

```bash
# Stiahnuť nové kľúče
curl -s https://api.wordpress.org/secret-key/1.1/salt/
```

Nahraďte existujúce `AUTH_KEY`, `SECURE_AUTH_KEY`, atď. novými hodnotami.

---

## 🔗 Krok 5: Search & Replace URL

Ak sa mení doména (localhost → domena.sk), je potrebné aktualizovať URL v databáze.

### 5.1 Použitie WP-CLI (odporúčané)

```bash
# Inštalácia WP-CLI (ak nie je)
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Search & Replace
wp search-replace 'http://localhost/novymatrixmedia-local' 'https://vasadomena.sk' --all-tables

# Alebo pre serializované dáta (lepšie)
wp search-replace 'http://localhost/novymatrixmedia-local' 'https://vasadomena.sk' --all-tables --precise
```

### 5.2 Použitie pluginu

1. Nainštalujte plugin **Better Search Replace**
2. Prejdite do **Nástroje** → **Better Search Replace**
3. Vyplňte:
   - Search for: `http://localhost/novymatrixmedia-local`
   - Replace with: `https://vasadomena.sk`
4. Vyberte všetky tabuľky
5. Spustite nahradenie

### 5.3 SQL dotaz (manuálne)

```sql
UPDATE wp_options SET option_value = REPLACE(option_value, 'http://localhost/novymatrixmedia-local', 'https://vasadomena.sk') WHERE option_name = 'home' OR option_name = 'siteurl';

UPDATE wp_posts SET post_content = REPLACE(post_content, 'http://localhost/novymatrixmedia-local', 'https://vasadomena.sk');

UPDATE wp_posts SET guid = REPLACE(guid, 'http://localhost/novymatrixmedia-local', 'https://vasadomena.sk');

UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'http://localhost/novymatrixmedia-local', 'https://vasadomena.sk');
```

---

## 📁 Krok 6: Prenos súborov

### 6.1 Prenos cez FTP

```bash
# Použite FTP klienta (FileZilla, Cyberduck)
# Nahrajte všetky súbory okrem:
# - wp-config.php (upravte podľa produkcie)
# - .git/ (ak používate git)
# - node_modules/ (ak existuje)
```

### 6.2 Prenos cez rsync (rýchlejšie)

```bash
rsync -avz --exclude 'wp-config.php' --exclude '.git' --exclude 'node_modules' \
  /Users/youh4ck3dme/Developer/01_ACTIVE/novymatrixmedia-local/ \
  user@vasadomena.sk:/public_html/
```

---

## ✅ Krok 7: Overenie migrácie

### 7.1 Kontrolný zoznam

- [ ] Databáza importovaná bez chýb
- [ ] wp-config.php aktualizovaný
- [ ] URL nahradené v databáze
- [ ] Súbory prenesené
- [ ] Permalinks obnovené (Settings → Permalinks → Save)
- [ ] Stránka sa načíta správne
- [ ] Prihlásenie do adminu funguje
- [ ] Média sa zobrazujú správne
- [ ] Pluginy fungujú
- [ ] Téma sa zobrazuje správne

### 7.2 Testovacie URL

```text
https://vasadomena.sk
https://vasadomena.sk/wp-admin
```

---

## 🚨 Časté problémy a riešenia

### Problém: "Error establishing a database connection"

**Riešenie:**

1. Skontrolujte DB credentials v `wp-config.php`
2. Overte, či DB host je správny
3. Skontrolujte, či používateľ má práva k databáze

### Problém: White screen of death

**Riešenie:**

1. Povoľte WP_DEBUG v `wp-config.php`
2. Skontrolujte `wp-content/debug.log`
3. Zvýšte memory limit:

```php
define( 'WP_MEMORY_LIMIT', '256M' );
```

### Problém: Presmerovanie na localhost

**Riešenie:**

1. Spustite search-replace znova
2. Skontrolujte tabuľku `wp_options` (home, siteurl)
3. Vymažte cache prehliadača

### Problém: Chyba pri importe databázy

**Riešenie:**

1. Skúste export s `--skip-add-drop-table`
2. Zväčšite `max_execution_time` a `upload_max_filesize` v php.ini
3. Importujte po častiach (veľké databázy)

---

## 📋 Rýchly prehľad príkazov

```bash
# === LOKÁLNE ===

# Export databázy
mysqldump -u root --single-transaction --routines --triggers novymatrixmedia > export.sql

# S kompresiou
mysqldump -u root novymatrixmedia | gzip > export.sql.gz

# Search & Replace (WP-CLI)
wp search-replace 'http://localhost' 'https://vasadomena.sk' --all-tables

# === NA SERVERI ===

# Import databázy
mysql -u db_user -p db_name < export.sql

# Obnova permalinks (WP-CLI)
wp rewrite flush

# === INŠTALÁCIA MARIA DB ===

brew install mariadb
brew services start mariadb
mysql_secure_installation
```

---

## 📞 Podpora Websupport.sk

- **Dokumentácia:** [https://www.websupport.sk/podpora/](https://www.websupport.sk/podpora/)
- **phpMyAdmin:** Dostupný cez admin panel
- **SSH:** Na vyžiadanie pre vyššie balíčky
- **Support email:** <support@websupport.sk>

---

*Dokument vytvorený: 24.2.2026*
*Projekt: novymatrixmedia-local*
