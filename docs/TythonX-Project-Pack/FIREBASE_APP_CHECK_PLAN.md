# FIREBASE APP CHECK PLAN

## Cieľ

Znížiť riziko neautorizovaného prístupu a billing fraud pri Firebase API.

## Fáza 1 (hneď)

1. V Firebase Console otvoriť App Check pre projekt `thyton-sos`.
2. Zaregistrovať App Check provider:
   - Android: Play Integrity
   - iOS: App Attest (fallback DeviceCheck)
   - Web: reCAPTCHA Enterprise alebo reCAPTCHA v3
3. Zapnúť App Check SDK v appke (najprv monitor mode).

## Fáza 2 (po overení)

1. Vynútiť App Check enforcement pre služby:
   - Firestore
   - Realtime Database (ak sa používa)
   - Cloud Functions
   - Firebase Storage
2. Skontrolovať legitímny traffic vs blocked requests.
3. Doladiť allowlist/test build flow.

## Prevádzkové pravidlá

1. Enforcement zapínať postupne po službách.
2. Pred enforcement mať hotový release build test matrix.
3. Incident fallback: dočasne prepnúť na monitor, nie úplne vypnúť ochranu.
