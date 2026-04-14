# Tython X SOS App (Flutter)

Cross-platform starter for Android + iOS + Web with a single SOS action.

## Current status

Completed:

1. Flutter project scaffold created (`android`, `ios`, `web` capable via Flutter).
2. FlutterFire configured for project `thyton-sos`.
3. Generated `lib/firebase_options.dart`.
4. Added `firebase_core` and `firebase_analytics`.
5. Firebase initialization wired in `lib/main.dart`.

## Commands used (A–Z setup)

From repo root:

```powershell
tools\flutter\bin\flutter.bat create mobile\tython_x_sos_app --platforms=android,ios,web --org com.tythonx --project-name tython_x_sos_app
tools\flutter\bin\dart.bat pub global activate flutterfire_cli
```

From app root (`mobile/tython_x_sos_app`):

```powershell
..\..\tools\flutter\bin\dart.bat pub global run flutterfire_cli:flutterfire configure --project=thyton-sos --platforms=android,ios,web --android-package-name=com.tythonx.sos --ios-bundle-id=com.tythonx.sos --yes
..\..\tools\flutter\bin\flutter.bat pub add firebase_core firebase_analytics
```

## Run locally

```powershell
..\..\tools\flutter\bin\flutter.bat pub get
..\..\tools\flutter\bin\flutter.bat analyze
..\..\tools\flutter\bin\flutter.bat test
..\..\tools\flutter\bin\flutter.bat run
```

## Firebase integration

- Generated config: `lib/firebase_options.dart`
- Android registration artifact: `android/app/google-services.json`
- FlutterFire mapping: `firebase.json`
- Default Firebase project alias: `.firebaserc`

## Web deploy (Firebase Hosting)

```powershell
..\..\tools\flutter\bin\flutter.bat build web
C:\nvm4w\nodejs\firebase.cmd deploy --only hosting
```

## Notes

- Silent auto-SMS and silent emergency dialing are blocked by OS policy.
- For reliable emergency fanout and check-ins, add backend dispatch in Phase 2.
- App Check should be enabled before production enforcement rollout.
- Gemini 2.0 Flash/Flash-Lite deprecation date: 2026-06-01.
- Imagen deprecation date: 2026-06-24.
