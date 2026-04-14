# MODEL MIGRATION NOTICE (2026)

## Dôležité dátumy

1. `Gemini 2.0 Flash` a `Gemini 2.0 Flash-Lite` končia: **June 1, 2026**.
2. Všetky `Imagen` modely končia: **June 24, 2026**.

## Riziko

Ak zostanú staré modely v produkcii, po uvedených dátumoch môže nastať výpadok AI funkcií.

## Migračný plán

1. Auditovať všetky endpointy/knižnice, kde sa volajú Gemini 2.0 Flash/Flash-Lite alebo Imagen.
2. Vybrať náhradné modely a spraviť compatibility test.
3. Zaviesť feature flag pre postupný rollout.
4. Pred cutoff dátumami dokončiť produkčný prechod.

## Owneri

- Product owner: rozhodnutie cieľových modelov.
- Engineering owner: implementácia migrácie.
- QA owner: regresné testy výkonu a kvality.
