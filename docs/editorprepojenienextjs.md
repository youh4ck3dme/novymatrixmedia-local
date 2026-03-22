# Finalový blueprint – WordPress Editor → Next.js Frontend

## Účel

Tento dokument slúži ako prísny implementačný a kontrolný blueprint pre dokončenie WordPress → Next.js prepojenia. Cieľ je, aby sa všetky body splnili presne do bodky, bez odbočiek, bez improvizácie a bez vynechania kritických krokov.

---

## Tvrdý master prompt

```text
Správaj sa ako extrémne prísny senior WordPress + Next.js implementer, release manager a technical auditor.

Tvoj režim práce:
- nevysvetľuj teóriu
- neodbiehaj
- nehádaj
- nič nepridávaj mimo zadania
- nič nevynechaj
- ak niečo nie je splnené, označ to presne a tvrdo
- ak niečo chýba, nevymýšľaj náhrady bez označenia
- ak niečo existuje v kóde, ale nie je aktivované alebo nastavené, nepovažuj to za hotové

Tvoj cieľ:
Vytvoriť alebo skontrolovať finálny stav WordPress Editor → Next.js Frontend prepojenia tak, aby bol projekt pripravený na redakčné používanie.

DÔLEŽITÉ:
Postupuj iba podľa tohto blueprintu. Každý bod vyhodnoť presne. Ak niečo nie je splnené, pomenuj to ako BLOCKER.

# 1. WORDPRESS NASTAVENIA — POVINNÉ
Musí byť splnené presne toto:

## Kategórie
Vytvor presne tieto kategórie:
- politika
- zahranicie
- komentare
- diskusia
- domov

## Menu
- vytvor menu s názvom presne: Primary Menu
- priraď ho na lokáciu presne: Primary Menu
- toto je povinné pre WPGraphQL navigáciu

## Trvalé odkazy
- nastav WordPress permalinks na: Post name
- výsledná štruktúra musí byť presne:
  /%postname%/

## Application Password
- application password už existuje
- používateľ: nmm
- túto položku skontroluj a označ ako HOTOVÉ / CHÝBA / NEOVERENÉ
- nič nové tu nevytváraj, iba potvrď stav

# 2. FLOW — MUSÍ ZOSTAŤ JASNE POTVRDENÝ
Musíš výslovne potvrdiť alebo vyvrátiť tento flow:

Redaktor napíše článok vo WP editore
    ↓ (Publish / Update)
nmm-revalidate.php odošle POST na Vercel /api/revalidate
    ↓
Next.js invaliduje cache pre slug + homepage
    ↓
Prvý návštevník vidí aktualizovaný článok (ISR)

Pri každom kroku flow uveď:
- SPĹŇA
- NESPĹŇA
- ČIASTOČNE SPĹŇA
- BLOCKER

# 3. REFERENČNÝ STAV PROJEKTU — KONTROLA PODĽA MD
Skontroluj a vyhodnoť tieto body:

## Next.js strana (nmm-pwa)
- REST API klient — `src/lib/wp-rest.ts` — fetchuje z `NEXT_PUBLIC_WP_URL/wp-json/wp/v2`
- GraphQL klient — `src/lib/wp-graphql.ts` — pre navigačné menu
- Dátový model — `src/lib/wp-queries.ts` — normalizuje WP posty na `SitePost` s 25+ poľami
- ISR revalidácia — `src/app/api/revalidate/route.ts` — prijíma webhook z WP a invaliduje cache
- Fallback dáta — ak WP nie je dostupný, zobrazí hardcoded ukážkové články

## WordPress strana
- `nmm-revalidate.php` (mu-plugin) — pri publish/update postu zavolá Next.js `/api/revalidate`
- `nmm-telegram-bridge` (plugin) — registruje Telegram meta polia + ingest endpoint
- `nmm-bluetone-unlocker.php` (mu-plugin) — odomyká Bluetone tému
- `nmm-firewall.php` (mu-plugin) — základná bezpečnosť

Pri každom bode označ presne:
- HOTOVÉ
- ČIASTOČNE
- CHÝBA
- BLOCKER

# 4. PLUGINY NA PRODUKČNOM WP — POVINNÁ KONTROLA
Skontroluj presne tieto pluginy:
- WP GraphQL
- NMM Telegram Bridge
- Rank Math SEO
- Kadence Blocks
- nmm-revalidate.php
- nmm-bluetone-unlocker.php
- nmm-firewall.php

Pri každom plugine uveď:
- názov
- či existuje v kóde
- či je aktivovaný
- či je nastavený
- či je potrebný
- finálny stav: HOTOVÉ / ČIASTOČNE / CHÝBA / BLOCKER

# 5. KRITICKÝ BLOCKER — NMM EDITORIAL FIELDS
Toto je kritická časť. Frontend očakáva redakčné meta polia, ktoré musia byť registrované cez `register_post_meta`, musia mať `show_in_rest => true`, a musia mať redakčný meta box v editore.

Ak tento plugin neexistuje, označ to ako BLOCKER.

Treba vytvoriť mu-plugin s odporúčaným názvom:
- `nmm-editorial-fields.php`

Tento mu-plugin MUSÍ:
- registrovať všetky redakčné meta polia
- vystaviť ich do REST API
- pridať meta box s názvom presne:
  `Novy Matrix Media Editorial Fields`

Polia, ktoré MUSIA byť registrované:
- nmm_subtitle
- nmm_author_name
- nmm_source_name
- nmm_source_url
- nmm_featured_image_alt
- nmm_featured_image_caption
- nmm_gallery
- nmm_video_embed
- nmm_article_type
- nmm_highlight_badge
- nmm_estimated_reading_time
- nmm_fact_box
- nmm_related_posts
- nmm_quote_block
- nmm_editorial_readiness

Pri každom poli uveď:
- registrované v REST API: ÁNO / NIE
- dostupné v editore: ÁNO / NIE
- blocker: ÁNO / NIE

# 6. VÝSTUP MUSÍ BYŤ PRESNE V TOMTO FORMÁTE

A. WORDPRESS NASTAVENIA
- kategórie: HOTOVÉ / CHÝBA
- menu Primary Menu: HOTOVÉ / CHÝBA
- lokácia Primary Menu: HOTOVÉ / CHÝBA
- trvalé odkazy /%postname%/: HOTOVÉ / CHÝBA
- application password (user nmm): HOTOVÉ / CHÝBA / NEOVERENÉ

B. FLOW PUBLISH → REVALIDATE → ISR
- editor publish/update: SPĹŇA / NESPĹŇA / ČIASTOČNE / BLOCKER
- WP revalidate POST: SPĹŇA / NESPĹŇA / ČIASTOČNE / BLOCKER
- Next.js cache invalidation: SPĹŇA / NESPĹŇA / ČIASTOČNE / BLOCKER
- aktualizovaný článok na fronte: SPĹŇA / NESPĹŇA / ČIASTOČNE / BLOCKER

C. KONTROLA KÓDU A PLUGINOV
Pre každý bod a plugin uveď presný stav.

D. NMM EDITORIAL FIELDS
- existuje mu-plugin: ÁNO / NIE
- REST registrácia polí: ÁNO / NIE
- meta box v editore: ÁNO / NIE
- finálny stav: HOTOVÉ / CHÝBA / BLOCKER

E. KROKY NA DOKONČENIE
Zoradiť od najkritickejšieho po najmenej kritický.
Pri každom kroku uveď:
- čo presne spraviť
- kde to spraviť
- čo je výsledok OK
- čo je blocker

F. KONTROLA SÚLADU S MD
Vypíš každý bod z blueprintu a označ:
- SPĹŇA
- NESPĹŇA
- ČIASTOČNE SPĹŇA

G. FINÁLNY VERDIKT
Musí byť iba jedna možnosť:
- PRIPRAVENÉ NA REDAKČNÉ POUŽITIE
- ČIASTOČNE PRIPRAVENÉ
- NEPRIPRAVENÉ

# 7. TVRDÉ OBMEDZENIA
- neodbiehaj k Telegram automatizácii, ak to nie je priamo blocker
- neodporúčaj zbytočné pluginy
- nepis všeobecné WordPress rady
- nevypĺňaj medzery domnienkami
- ak niečo nie je overené, označ to ako NEOVERENÉ
- ak niečo nie je aktivované, nepíš HOTOVÉ
- ak chýba `nmm-editorial-fields.php`, označ projekt minimálne ako ČIASTOČNE PRIPRAVENÉ alebo NEPRIPRAVENÉ podľa zvyšku stavu

# 8. DODATOČNÁ ÚLOHA
Na konci priprav aj stručný súborový návrh, čo má byť uložené do repozitára:
- `docs/editorprepojenienextjs.md` — tento finálny blueprint
- prípadný `wp-content/mu-plugins/nmm-editorial-fields.php`
- úpravy podľa potreby v `.gitignore`

Začni okamžite sekciou A. WORDPRESS NASTAVENIA a pokračuj presne podľa tohto poradia.
```

## Poznámka k „Application Password — user nmm“

To znamená, že vo WordPresse už existuje Application Password pre používateľa `nmm`.

Prakticky je to heslo určené pre API alebo externé integrácie, aby sa aplikácia mohla autentifikovať bez použitia klasického login hesla.

V tomto blueprint-e sa to má:

- neprepisovať naslepo
- iba skontrolovať a potvrdiť stav
- označiť ako `HOTOVÉ`, `CHÝBA`, alebo `NEOVERENÉ`

## Odporúčaný dodatok do `.gitignore`

```gitignore
# Environment files
.env
.env.*
!.env.example

# Node
node_modules/
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS / editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# WordPress secrets / local config
wp-config.php
wp-config-local.php
wp-config-production.php

# Backups / exports
*.sql
*.zip
*.tar.gz

# Temporary scripts with credentials
nmm_*.py

# Local caches
.cache/
coverage/
```
