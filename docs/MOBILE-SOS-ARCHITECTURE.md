# MOBILE SOS ARCHITECTURE (Tython X)

## Decision

Framework: Flutter.

Reason:

- One codebase for Android and iOS.
- Fast development cycle for SOS workflows.
- Strong plugin ecosystem for device capabilities.

## Capability-driven runtime

The app checks platform capabilities at runtime and selects the safest supported path.

- Android:
  - Foreground SOS flow fully supported.
  - Background extensions possible with native foreground service.
- iOS:
  - Foreground SOS flow fully supported.
  - Background tasks restricted by iOS policy and must use iOS-approved patterns.

## SOS flow (MVP)

1. User long-presses one main SOS button.
2. App requests/reads location.
3. App creates SOS payload with map link.
4. App opens SMS composer to emergency contacts.
5. App opens emergency dialer using locale-based emergency number.

## Compliance-aware defaults

- No silent emergency calling.
- No silent SMS sending.
- User confirmation stays in system dialer/messaging app.
- Location is not persisted beyond runtime in this MVP.

## Next production steps

1. Add backend dispatch service for resilient multi-contact fanout.
2. Add encrypted event log with explicit retention policy.
3. Add native Android foreground service module for stronger background behavior.
4. Add iOS BGTask integration with compliant fallback expectations.
