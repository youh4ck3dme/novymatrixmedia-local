# LINEAR PROJECT BOOTSTRAP

Použi tento obsah pri zakladaní nového projektu v Linear.

## Project

- Name: `Tython X - Mobile SOS`
- Description: `Cross-platform emergency app (Android + iOS), secure contacts, SOS dispatch flow, capability-aware fallback by platform.`
- Target date: `YYYY-MM-DD`
- Priority: `High`

## Initial Labels

1. `mobile`
2. `security`
3. `incident-response`
4. `ios`
5. `android`
6. `backend-phase2`

## Initial Issues

1. `MVP: Single-screen SOS flow`
Description:
`Implement long-press SOS action, location lookup, SMS compose intent, and emergency dial intent.`

2. `Contacts: local secure register`
Description:
`Add create/edit/delete for emergency contacts with strict phone validation.`

3. `Capability policy by platform`
Description:
`Implement explicit Android/iOS capability matrix and runtime fallback behavior.`

4. `Permission hardening`
Description:
`Audit location + intent permissions, denial states, and user feedback flow.`

5. `Release prep: Android`
Description:
`Prepare signed build pipeline, store listing assets, and test checklist.`

6. `Release prep: iOS`
Description:
`Prepare provisioning/signing, TestFlight pipeline, and App Store checklist.`

7. `Security baseline`
Description:
`Move all operational credentials to vault references, define rotation policy.`

8. `Firebase App Check rollout`
Description:
`Enable App Check providers (Android/iOS/Web), run monitor mode, then enforce by service with staged rollout.`

9. `AI model migration before June 2026 cutoffs`
Description:
`Replace any Gemini 2.0 Flash/Flash-Lite usage before 2026-06-01 and any Imagen usage before 2026-06-24.`

## Linear content policy for secrets

1. Do issue text vkladaj iba:
   - URL
   - account názov
   - vault reference (`vault://...`)
2. Nevložiť:
   - heslá
   - API token plaintext
   - certifikáty
