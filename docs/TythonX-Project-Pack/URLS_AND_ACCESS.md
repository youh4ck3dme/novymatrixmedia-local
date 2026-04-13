# URLS AND ACCESS

Vyplň konkrétne hodnoty. Heslá nedávaj sem, iba odkaz na vault položku.

| Systém | URL | Prostredie | Účet/Rola | Vault položka | Poznámka |
|---|---|---|---|---|---|
| Web frontend | `https://novymatrixmedia.sk` | Production | `admin` | `vault://nmm/web/prod` | hlavný frontend |
| WordPress CMS/API | `https://info.novymatrixmedia.sk` | Production | `editor/admin` | `vault://nmm/wp/prod` | source of truth |
| WordPress REST API | `https://info.novymatrixmedia.sk/wp-json/wp/v2` | Production | `service-account` | `vault://nmm/wp-rest/prod` | content API |
| WordPress GraphQL | `https://info.novymatrixmedia.sk/graphql` | Production | `service-account` | `vault://nmm/wp-graphql/prod` | query API |
| Frontend API route | `https://novymatrixmedia.sk/api/comments` | Production | `server runtime` | `vault://nmm/frontend/env` | komentáre |
| Frontend API route | `https://novymatrixmedia.sk/api/revalidate` | Production | `server runtime` | `vault://nmm/frontend/env` | cache invalidácia |
| Frontend API route | `https://novymatrixmedia.sk/api/search` | Production | `server runtime` | `vault://nmm/frontend/env` | search endpoint |
| Frontend API route | `https://novymatrixmedia.sk/api/env-check` | Production | `server runtime` | `vault://nmm/frontend/env` | health/env check |
| Firebase Console | `https://console.firebase.google.com/project/thyton-sos/overview` | Production | `owner` | `vault://tythonx/firebase` | projekt dashboard |
| WebSupport shell | `https://shell.r6.websupport.sk` | Production | `uid user` | `vault://nmm/websupport/ssh` | shell login |
| WebSupport REST API | `https://rest.websupport.sk/v2` | Production | `api login` | `vault://nmm/websupport/api` | DNS/hosting API |
| WebSupport DB host | `db.r6.websupport.sk:3306` | Production | `db user` | `vault://nmm/websupport/db` | produkčná DB |
| Apple Developer | `https://developer.apple.com` | Production | `team-agent` | `vault://tythonx/apple` | iOS signing |
| Google Play Console | `https://play.google.com/console` | Production | `owner` | `vault://tythonx/google-play` | Android release |

## Lokálne cesty projektu

1. Repo root: `C:\Users\42195\Downloads\loveable-PHDbooking-finale-3-3-26\novymatrixmedia-local`
2. Mobilná app: `C:\Users\42195\Downloads\loveable-PHDbooking-finale-3-3-26\novymatrixmedia-local\mobile\tython_x_sos_app`
3. Lokálny Flutter SDK: `C:\Users\42195\Downloads\loveable-PHDbooking-finale-3-3-26\novymatrixmedia-local\tools\flutter`

## Prístupová politika

1. Každý systém má určeného ownera.
2. Žiadne heslá v plain texte v dokumentácii.
3. Povinná rotácia pri incidente alebo zmene člena tímu.
