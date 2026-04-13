# FIREBASE WEB PLACEHOLDERS

Použi tento súbor ako checklist pre doplnenie Google Developer/Firebase údajov.

## Povinné polia

1. `projectId=YOUR_PROJECT_ID`
2. `appId=YOUR_WEB_APP_ID`
3. `apiKey=YOUR_WEB_API_KEY`
4. `authDomain=YOUR_PROJECT_ID.firebaseapp.com`
5. `storageBucket=YOUR_PROJECT_ID.appspot.com`
6. `messagingSenderId=YOUR_MESSAGING_SENDER_ID`
7. `measurementId=YOUR_MEASUREMENT_ID_OR_EMPTY`
8. `consoleUrl=https://console.firebase.google.com/project/YOUR_PROJECT_ID/overview`

## Kde to zapísať

1. Flutter template:
   - `mobile/tython_x_sos_app/lib/src/config/firebase_web_config.template.dart`
2. Lokálny env:
   - `docs/TythonX-Project-Pack/SECRETS.local.env`
3. Registry metadata:
   - `docs/TythonX-Project-Pack/SECRETS_REGISTER.md`

## Bezpečnostná poznámka

`apiKey` pre Firebase web nie je sama o sebe tajný root secret, ale stále ju drž v projektovej konfigurácii kontrolovane a s pravidlami domén/API restrikcií.
