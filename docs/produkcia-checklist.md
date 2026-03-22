# NMM – Produkčný nasadenie checklist

> Odškrtávaj v poradí. Každý krok má **očakávaný výsledok** — ak ho nedosiahneš, zastav a riešPriority namiesto toho, aby si pokračoval ďalej.

---

## FÁZA 0 — Pred začatím

### Príprava (urob raz, pred akýmkoľvek krokom)

- [ ] Máš prístup na Websupport FTP (hostiteľ, login, heslo)
- [ ] Máš prístup do phpMyAdmin na Websupport paneli (DB `ytk8fobx`)
- [ ] Máš prístup do Vercel Dashboard (projekt `nmm-pwa`)
- [ ] Máš otvorenú Vercel konzolu (Deployments → posledný deploy → Functions a Logs tab)

---

## FÁZA 1 — WordPress admin prístup

### 1.1 — SQL email fix (phpMyAdmin)

1. Otvor Websupport panel → MySQL → databáza `ytk8fobx` → záložka **SQL**
2. Vlož a spusti obsah súboru [`nmm_fix_production_emails.sql`](../nmm_fix_production_emails.sql)
3. Skontroluj výsledok dotazu — musia sa vrátiť 2 riadky:

```text
source                   | value
-------------------------|---------------------------
wp_users admin_nmm       | info@novymatrixmedia.sk
wp_options admin_email   | info@novymatrixmedia.sk
```

**✓ OK:** Oba riadky ukazujú `info@novymatrixmedia.sk`  
**✗ STOP:** Ak ešte vidíš `linfo@` alebo `admin@example.com` — dotaz zlyhal, skús znova.

---

### 1.2 — Resetovanie hesla (FTP + prehliadač)

1. Nahrať súbor `nmm-pass-reset.php` do WP rootu cez FTP
   - cieľ: `public_html/nmm-pass-reset.php` (alebo kde je WP root)
2. Otvoriť v prehliadači:

   ```text
   https://novymatrixmedia.sk/nmm-pass-reset.php?token=nmm_reset_2026
   ```

3. Skopírovať vygenerované heslo do bezpečného miesta (správca hesiel)

**✓ OK:** Stránka zobrazuje zelený box s novým heslom  
**✗ STOP:** Ak vidíš 403 / 404 / bielu stránku — súbor nie je správne nahratý

<!-- Po overení hesla -->

1. **OKAMŽITE** zmazať súbor cez FTP:

   ```text
   Zmaž: public_html/nmm-pass-reset.php
   ```

2. Overiť, že súbor je preň:

   ```text
   https://novymatrixmedia.sk/nmm-pass-reset.php
   ```

   **✓ Musí vrátiť 404**

---

### 1.3 — Prihlásenie do WP adminu

1. Otvoriť: `https://novymatrixmedia.sk/wp-admin`
2. Prihlásiť sa:
   - **Login:** `admin_nmm`
   - **Heslo:** (skopírované v kroku 1.2)

**✓ OK:** Vidíš WP Dashboard  
**✗ STOP:** Nesprávne heslo → zopakuj krok 1.2 (celý)

---

### 1.4 — Vizuálna kontrola po prihlásení

Po úspešnom prihlásení skontroluj tieto veci priamo v adminu:

| Kde | Čo skontrolovať | Očakávaná hodnota |
| ----- | ----------------- | ------------------- |
| Users → admin_nmm → Edit | Email | `info@novymatrixmedia.sk` |
| Settings → General | Administration Email | `info@novymatrixmedia.sk` |
| Settings → General | WordPress Address (URL) | `https://novymatrixmedia.sk` |
| Settings → General | Site Address (URL) | `https://novymatrixmedia.sk` |
| Settings → Permalinks | Common Settings | `/%postname%/` |

**✓ OK:** Všetky hodnoty sedí  
**✗ STOP:** Ak URLs ukazujú `localhost` — je to zlé, wp-config.php defines nemajú prednosť

---

## FÁZA 2 — Vercel environment variables

### 2.1 — Nastaviť env premenne

V Vercel Dashboard → projekt `nmm-pwa` → Settings → Environment Variables:  
(Nastav pre **Production**, **Preview** aj **Development** — alebo aspoň Production)

| Premenná | Hodnota |
| ---------- | --------- |
| `NEXT_PUBLIC_WP_URL` | `https://info.novymatrixmedia.sk` |
| `NEXT_PUBLIC_API_URL` | `https://info.novymatrixmedia.sk/wp-json/wp/v2` |
| `NEXT_PUBLIC_GRAPHQL_URL` | `https://info.novymatrixmedia.sk/graphql` |
| `NEXT_PUBLIC_SITE_URL` | `https://novymatrixmedia.sk` |
| `REVALIDATE_SECRET` | *(vygeneruj: napr. `openssl rand -hex 32`)* |

- [ ] Všetkých 5 premenných je zadaných

---

### 2.2 — Nastaviť WP revalidation konštanty

V súbore `wp-config-production.php` nahradiť placeholder hodnoty:

```php
define( 'NMM_REVALIDATE_SECRET', 'ROVNAKÁ_HODNOTA_AKO_V_VERCEL_REVALIDATE_SECRET' );
define( 'NMM_REVALIDATE_URL',    'https://nmm-pwa.vercel.app/api/revalidate' );
//                                          ^ alebo tvoja vlastná doména
```

- [ ] `NMM_REVALIDATE_SECRET` = presne rovnaká hodnota ako Vercel `REVALIDATE_SECRET`
- [ ] `NMM_REVALIDATE_URL` = správna produkčná URL (nie preview, nie localhost)

Nahraný `wp-config-production.php` na server cez FTP (ak ho ešte nemáš nahratý).

---

### 2.3 — Redeploy Next.js bez cache

V Vercel Dashboard:

1. Deployments → posledný deploy → **...** menu → **Redeploy**
2. Zaškrtnúť **"Clear build cache"**
3. Potvrdiť

- [ ] Deploy prebehol úspešne (zelená bulka, nie červená)
- [ ] V deploy logu nie sú `Error:` relevantné pre WP fetch

---

## FÁZA 3 — Testovanie WordPress REST API

### 3.1 — Základný REST ping

Otvor v prehliadači (alebo `curl`):

```text
https://novymatrixmedia.sk/wp-json/wp/v2/posts?per_page=3&_embed
```

**✓ OK:** Vracia JSON pole článkov, každý má `id`, `slug`, `title`, `_embedded`  
**✗ STOP ak:** `{"code":"rest_no_route"}` → Permalinks nie sú nastavené, choď Settings → Permalinks → Uložiť  
**✗ STOP ak:** prázdne pole `[]` → Ešte nie sú žiadne publikované články (ok, pokračuj na Fázu 4)  
**✗ STOP ak:** 403 alebo Wordfence block → pozri krok 3.2

---

### 3.2 — Ak REST API blokuje Wordfence

WP Admin → Wordfence → Firewall → Allowlisted URLs:  
Pridaj pattern: `/wp-json/.*`

---

### 3.3 — GraphQL ping

```text
https://novymatrixmedia.sk/graphql
```

**✓ OK:** Vracia `{"data":null,"errors":[...]}` alebo GraphQL introspection response  
**✗ STOP:** 404 → WPGraphQL plugin nie je aktívny → Plugins → Activate

---

## FÁZA 4 — Vytvorenie testovacieho článku

### 4.1 — Napísať a publikovať článok

1. WP Admin → Posts → Add New
2. Vyplniť:
   - **Titulok:** `Test článok – produkcia`
   - **Perex (excerpt):** `Toto je testovací článok pre overenie publish flow.`
   - **Obsah:** Aspoň 2 odseky textu
   - **Featured Image:** Odporúčané (nahrať nejakú fotku)
   - **Kategória:** Vybrať existujúcu (napr. `Domov`)
3. Kliknúť **Publish → Publish** (dvakrát potvrdiť)

- [ ] Článok sa objaví v Posts liste so statusom **Published**
- [ ] Skopíruj slug z URL v admin editore (napr. `test-clanok-produkcia`)

---

### 4.2 — Overiť v REST API

```text
https://novymatrixmedia.sk/wp-json/wp/v2/posts?slug=test-clanok-produkcia&_embed
```

**✓ OK:** Vracia JSON s 1 článkom, `status: "publish"`, správny `slug`  
**✗ STOP:** Vracia `[]` → Slug je iný ako predpokladáš, alebo sa ešte nesave-olvalo

---

## FÁZA 5 — Testovanie Next.js frontendu

### 5.1 — Domovská stránka

Otvoriť: `https://novymatrixmedia.sk` (alebo Vercel preview URL)

**✓ OK:** Vidíš reálny obsah z WP, nie placeholder (Daško, Hormuz, atď.)  
**✗ STOP:** Ak stále vidíš placeholder:

- Vercel env vars nie sú správne nastavené → krok 2.1
- Redeploy nebol spravený → krok 2.3
- Skontroluj Vercel Function logs — hovorí tam `shouldUseWordPressFallback: true`?

---

### 5.2 — Detail testovacieho článku

Otvoriť: `https://novymatrixmedia.sk/test-clanok-produkcia`

**✓ OK:** Vidíš obsah článku, titulok, perex, obrázok  
**✗ STOP:** 404 → Next.js slug page nezbuildovala, skontroluj `[slug]/page.tsx` logs vo Verceli

---

### 5.3 — Revalidation test (časovanie)

Hneď po publishi (do 30 sekúnd):

1. Otvoriť domovskú stránku
2. Skontrolovať, či sa testovací článok objavil v zozname

**✓ OK:** Článok vidíš ihneď → revalidácia funguje  
**~OK:** Článok sa objaví do 5 minút → ISR revalidate=300 funguje, mu-plugin nie  
**✗ STOP:** Článok sa neobjaví vôbec po 5+ minútach → env var `NEXT_PUBLIC_WP_URL` je zle nastavený

---

## FÁZA 6 — Testovanie on-demand revalidácie

### 6.1 — Manuálny test revalidation endpointu

Spusti z terminála (nahraď `SECRET` skutočnou hodnotou):

```powershell
$secret = "TVOJ_REVALIDATE_SECRET"
$body = @{
    secret        = $secret
    slug          = "test-clanok-produkcia"
    postId        = 999   # nahraď skutočným ID z REST API
    categorySlugs = @("domov")
    purgeAll      = $false
} | ConvertTo-Json

Invoke-RestMethod `
    -Method POST `
    -Uri "https://nmm-pwa.vercel.app/api/revalidate" `
    -ContentType "application/json" `
    -Body $body
```

**✓ OK:**

```json
{
  "revalidated": ["wp-posts", "wp-post-test-clanok-produkcia", "wp-post-id-999", "wp-category-posts-domov"],
  "message": "Revalidation complete"
}
```

**✗ STOP ak `401`:** `REVALIDATE_SECRET` v Verceli ≠ `NMM_REVALIDATE_SECRET` vo WP  
**✗ STOP ak `404`:** URL je zlá alebo Vercel nezbuildoval `/api/revalidate` route  
**✗ STOP ak `500`:** Sleduj Vercel Function logs

---

### 6.2 — Overenie, že WP mu-plugin volá endpoint

1. Uprav testovací článok (napr. titulok)
2. Kliknúť **Update**
3. Otvoriť Vercel Dashboard → projekt → Logs (alebo Functions tab)
4. Filtrovať na `/api/revalidate`

**✓ OK:** Vidíš POST request s 200 statusom od `novymatrixmedia.sk` user-agenta  
**~OK:** Nevidíš request → WP vie robiť `wp_remote_post()` → pozri WP debug log  
**Tipy na debug:**

```php
// Dočasne pridaj do wp-config.php (len na debug, potom odober):
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
```

Potom pozri: `wp-content/debug.log`

---

## FÁZA 7 — Post-deployment potvrdenie

### 7.1 — Finálny checklist

- [x] `admin_nmm` má email `info@novymatrixmedia.sk`  
- [x] Settings > General admin email = `info@novymatrixmedia.sk`  
- [x] `nmm-pass-reset.php` vracia 404 (zmazaný)  
- [x] REST API vracia články: `/wp-json/wp/v2/posts`  
- [x] GraphQL odpovedá: `/graphql`  
- [x] Domovská stránka Next.js ukazuje živý WP obsah  
- [x] Detail článku `/{slug}` funguje  
- [x] `/api/revalidate` vracia 200 pri správnom secrete  
- [x] `/api/revalidate` vracia 401 pri zlom secrete  
- [x] Po WP publishu sa zmeny objavia na fronte do 30 sekúnd  

---

## Čo NEmáme ešte vyriešené (na neskôr)

| Vec | Prečo čakáme |
| ----- | ------------- |
| SMTP email (`redakcia@novymatrixmedia.sk`) | Treba najprv vytvoriť schránku na Websupport paneli |
| Telegram integrácia | Odložená, nie je kritická pre editorial flow |
| Cache-Enabler REST exclusion | Nízka priorita, ISR to obchádza |
| nmm-telegram-bridge aktivácia | Odložená s Telegramom |

---

### Posledná aktualizácia: 22. 3. 2026

---

## Poznámky z nasadenia

- **CMS URL**: `https://info.novymatrixmedia.sk` (subdoména smeruje na Websupport server)
- **Frontend URL**: `https://novymatrixmedia.sk` (DNS → Vercel)
- **Vercel alias**: `nmm-pwa.vercel.app` (nie `novymatrixmedia.vercel.app`!)
- **Vercel deploy**: spúšťať z koreňa repozitára, nie z `nmm-pwa/` (Vercel root dir = `nmm-pwa`)
- **Env vars**: nastavovať cez Python subprocess, nie PowerShell pipe (pridáva newline)
- **Mu-plugin v1.2**: priame volanie `wp_remote_post()` namiesto WP-Cron (spoľahlivejšie)
- **POST redirect**: `novymatrixmedia.sk` → 307 → `www.novymatrixmedia.sk` (preto mu-plugin volá priamo `nmm-pwa.vercel.app`)
