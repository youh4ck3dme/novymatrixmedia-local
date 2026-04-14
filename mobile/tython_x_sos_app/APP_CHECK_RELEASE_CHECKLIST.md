# App Check Release Checklist (thyton-sos)

1. Firebase Console > App Check:
   - Web app: provider `reCAPTCHA v3` configured.
   - Android app: provider `Play Integrity` configured.
   - iOS app: provider `App Attest` (fallback DeviceCheck) configured.
2. Add debug tokens only for local testing and remove stale debug tokens.
3. Verify app startup in production URL:
   - https://thyton-sos.web.app
4. Enable enforcement product-by-product in App Check:
   - Firestore
   - Storage
   - Functions (if used later)
5. Monitor App Check metrics for rejected/allowed requests after enforcement.
6. Keep `RECAPTCHA_SITE_KEY` in release build args if rotating keys.
