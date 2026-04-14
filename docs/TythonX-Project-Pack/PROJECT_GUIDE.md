# PROJECT GUIDE

## Cieľ projektu

Tython X je emergency/SOS produkt pre rýchle spustenie krizového flow na mobile (Android + iOS) s dôrazom na:

- ultra jednoduché UX
- bezpečné spracovanie kontaktov a polohy
- platformovo korektné fallback správanie

## Architektúra (high-level)

1. Mobilná app vrstva (Flutter) pre UI a device capabilities.
2. Kontaktový register na zariadení (lokálne úložisko).
3. SOS dispatch flow:
   - získanie polohy
   - otvorenie SMS compose pre kontakty
   - otvorenie emergency dialera podľa krajiny
4. Budúca backend vrstva pre spoľahlivý fanout a audit (Phase 2).

## Prevádzkový postup (MVP)

1. Spusti appku.
2. Nastav kontakty.
3. Long-press SOS tlačidla.
4. Potvrď odoslanie SMS v systémovej appke.
5. Potvrď volanie emergency čísla v dialeri.

## Incident postup

1. Over dostupnosť SMS appky a dialera.
2. Over location permission.
3. Over kontaktové čísla v E.164 formáte.
4. Ak zlyhá poloha, odoslať fallback text bez mapy.
5. Ak zlyhá SMS, spusti aspoň emergency call flow.

## Prevádzkové role

- Product owner: rozhoduje scope a release priority
- Mobile developer: Flutter + natívne capability integrácie
- Ops/Security owner: správa secretov, rotácia, audit
- QA owner: test matrix Android/iOS, locale, permission scenáre
