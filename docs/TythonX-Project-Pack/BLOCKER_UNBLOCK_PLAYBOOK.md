# BLOCKER UNBLOCK PLAYBOOK

## Aktuálny blocker

Nemáme ešte potvrdený central vault + finálne produkčné credentials pre Tython X mobilný rollout.

## Unblock kroky

1. Vyplň `SECRETS.local.env` reálnymi hodnotami z password managera.
2. Každú hodnotu prenes do central vaultu a v `SECRETS_REGISTER.md` doplň:
   - owner
   - dátum poslednej rotácie
3. Do `URLS_AND_ACCESS.md` doplň konkrétne účty/roly pre každý systém.
4. V Linear založ projekt podľa `LINEAR_PROJECT_BOOTSTRAP.md`.
5. V Linear issue textoch nikdy neuvádzaj heslo alebo token, len `vault://...` referenciu.

## Hotovo keď

1. Každý riadok v `SECRETS_REGISTER.md` má ownera a dátum rotácie.
2. `SECRETS.local.env` je vyplnený lokálne (a necommitnutý).
3. Linear projekt a prvých 7 issue je založených.
