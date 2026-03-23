# Workflow: Headless Content + Komentáre (3 kroky)

Tento dokument berie ako **východiskový stav** už hotové zmeny a určuje inkrementálny postup, aby sa nič nerozbilo.

## 0. Baseline (už vyriešené)

- Draft/článok `ID 637` existuje a obsahuje doplnenú sekciu o moderovaní komentárov.
- Globálne CSS zvýraznenie sekcie je doplnené (`nmm-comments-guide`, `nmm-comments-checklist`).
- Frontend comments flow je pridaný:
  - `GET/POST /api/comments`
  - zobrazenie komentárov pod článkom
  - stránka agregovaných komentárov (`/reakcie`)
- Root cause fallback obrázka je riešený systémovo:
  - public featured image REST polia v MU plugine
  - frontend query mapovanie používa tieto polia pred fallbackom.

Poznámka: tieto body sa **neprepisujú** bez explicitného dôvodu.

---

## 1) Návrh workflowu

### 1.1 Scope gate
- Každá zmena musí uviesť:
  - čo je cieľ,
  - ktoré súbory sa dotkne,
  - čo je už vyriešené (a preto sa nemení).

### 1.2 Implementačné pravidlá
- Iba malé, izolované kroky.
- Najprv root cause, potom UI.
- Žiadne reverty existujúcich funkčných úprav.
- Ak sa riešenie prekrýva s baseline, označiť to ako `already solved`.

### 1.3 Verifikačné pravidlá
- Povinné:
  - `npm run lint`
  - `npm run build`
  - syntax check pre PHP MU pluginy (`php -l`)
- Funkčné testy:
  - comments flow (pending -> approved)
  - featured image flow (custom image -> frontend render)
  - článok 637 obsahuje sekciu a vizuálne triedy.

---

## 2) Implementácia workflowu

### 2.1 Changelog discipline
- Každý krok zapisovať do reportu s jednou vetou:
  - `already solved` / `new change` / `blocked`.

### 2.2 Safety pred deployom
- Pred nasadením vždy overiť:
  - že sa nemenila taxonómia bez zadania,
  - že comments listing filtruje iba `status=approve`,
  - že fallback obrázok sa používa iba keď chýba featured image.

### 2.3 Deploy poradie
1. MU pluginy (WP)
2. Next frontend deploy
3. Cache clear
4. Smoke test

---

## 3) Test a verifikácia

### 3.1 Test matrix (minimum)
- **Komentáre**
  - neprihlásený submit -> uložené ako pending/hold
  - pending nie je viditeľný na fronte
  - approved je viditeľný pod článkom aj na agregačnej stránke
- **Featured image**
  - post s featured image neukazuje Unsplash fallback
  - post bez featured image fallback používa
- **Obsah 637**
  - sekcia „Ako spravovať komentáre pod článkami“ je v obsahu
  - checklist box je vizuálne zvýraznený.

### 3.2 Report formát
- `already solved`: čo sa nemenilo
- `implemented`: nové alebo doplnené veci
- `verified`: čo prešlo testami
- `blocked`: čo sa nedalo overiť a prečo
