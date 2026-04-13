# Tython X Project Pack

Tento balík je pripravený ako jeden zdroj pravdy pre:

- Projektový návod a onboarding
- URL adresy a prístupy
- Secret registry
- `.env` šablónu pre lokálne/produkčné nastavenie
- Podklad pre založenie projektu a ticketov v Linear

## Obsah

1. `PROJECT_GUIDE.md` - hlavný návod (setup, prevádzka, incident flow)
2. `URLS_AND_ACCESS.md` - všetky URL, účty, roly, odkazy na heslá
3. `SECRETS_REGISTER.md` - evidencia secretov, rotácia, owner
4. `SECRETS.local.env` - lokálny neverejný súbor na reálne hodnoty
5. `LINEAR_PROJECT_BOOTSTRAP.md` - copy/paste štruktúra pre nový Linear projekt
6. `FIREBASE_WEB_PLACEHOLDERS.md` - checklist pre Google/Firebase hodnoty
7. `FIREBASE_APP_CHECK_PLAN.md` - plán zavedenia App Check + enforcement
8. `MODEL_MIGRATION_NOTICE_2026.md` - upozornenie a plán migrácie modelov

## Dôležité bezpečnostné pravidlo

Reálne heslá a tokeny vkladaj len do `SECRETS.local.env` (lokálne), nie do markdown súborov a nie do Linear komentárov.
