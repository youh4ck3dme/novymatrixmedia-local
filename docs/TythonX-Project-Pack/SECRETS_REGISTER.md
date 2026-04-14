# SECRETS REGISTER

Tento register je pre metadata o secretoch. Reálne hodnoty patria do `SECRETS.local.env` alebo do vaultu.

| Secret key | Použitie | Prostredie | Owner | Rotácia | Posledná rotácia | Uloženie |
|---|---|---|---|---|---|---|
| `API_BASE_URL` | base URL pre mobilný klient | prod/stage | mobile lead | pri zmene infra | `YYYY-MM-DD` | vault ref |
| `API_AUTH_TOKEN` | server-to-server autentifikácia | prod | ops lead | 90 dní | `YYYY-MM-DD` | vault ref |
| `SMS_PROVIDER_KEY` | SMS provider dispatch | prod/stage | ops lead | 60 dní | `YYYY-MM-DD` | vault ref |
| `SENTRY_DSN` | error tracking | prod/stage | mobile lead | pri incidente | `YYYY-MM-DD` | vault ref |
| `MAPS_API_KEY` | map provider | prod/stage | mobile lead | 90 dní | `YYYY-MM-DD` | vault ref |
| `FIREBASE_PROJECT_ID` | Firebase project identity | prod/stage | mobile lead | pri migrácii | `YYYY-MM-DD` | vault ref |
| `FIREBASE_APP_ID_WEB` | web app registration id | prod/stage | mobile lead | pri re-create app | `YYYY-MM-DD` | vault ref |
| `FIREBASE_API_KEY_WEB` | web API key | prod/stage | ops lead | 90 dní + restrikcie | `YYYY-MM-DD` | vault ref |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | prod/stage | mobile lead | pri migrácii | `YYYY-MM-DD` | vault ref |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | prod/stage | mobile lead | pri migrácii | `YYYY-MM-DD` | vault ref |
| `FIREBASE_MESSAGING_SENDER_ID` | push sender id | prod/stage | mobile lead | pri migrácii | `YYYY-MM-DD` | vault ref |
| `FIREBASE_MEASUREMENT_ID` | analytics id | prod/stage | product owner | pri reconfigure analytics | `YYYY-MM-DD` | vault ref |
| `APPLE_SIGNING_CERT_REF` | iOS release signing | prod | release manager | pri renew | `YYYY-MM-DD` | vault ref |
| `GOOGLE_PLAY_SERVICE_JSON_REF` | Android release signing/deploy | prod | release manager | pri incidente | `YYYY-MM-DD` | vault ref |

## Minimálne bezpečnostné pravidlá

1. Secret nesmie byť v commite.
2. Secret nesmie byť v Linear komentári ani issue body.
3. V Linear sa zapisuje iba vault referencia.
