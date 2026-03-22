# Telegram Bridge

Vlastny WordPress plugin `nmm-telegram-bridge` prijima autentifikovany POST payload a vytvara clanok v WordPresse.

## Co plugin robi

- vytvori `post` z prijateho titulku a obsahu
- standardne uklada clanok ako `draft`
- nastavi kategorie a tagy
- zapisuje editorial meta polia pouzivane v Next.js article template
- pri ingest clankoch nastavi aj `editorial_readiness` pre workflow badge na fronte
- vie volitelne stiahnut featured image z URL
- vrati `postId`, `editLink` a `permalink`

## Aktivacia

1. Aktivuj plugin `NMM Telegram Bridge` vo WordPress admin.
2. Do lokalneho alebo produkcneho `wp-config.php` pridaj token mimo Gitu:

```php
define('NMM_TELEGRAM_BRIDGE_TOKEN', 'sem-daj-silny-tajny-token');
define('NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS', 'draft');
```

## Endpoint

- `POST /wp-json/nmm-telegram-bridge/v1/ingest`

Autorizacia:

- header `X-NMM-Bridge-Token: ...`
- alebo `Authorization: Bearer ...`

## Minimalny payload

```json
{
  "title": "Nadpis z Telegramu",
  "content": "<p>Obsah clanku...</p>"
}
```

## Rozsireny payload

```json
{
  "title": "Nadpis z Telegramu",
  "slug": "nadpis-z-telegramu",
  "excerpt": "Kratky perex",
  "content": "<p>HTML obsah clanku...</p>",
  "status": "draft",
  "editorial_readiness": "needs-review",
  "published_at": "2026-03-22T07:30:00Z",
  "categories": [
    { "slug": "zahranicie", "name": "Zahranicie" }
  ],
  "tags": ["telegram", "breaking"],
  "featured_image_url": "https://example.com/image.jpg",
  "subtitle": "Volitelny podnadpis",
  "author_name": "Redakcia NMM",
  "source_name": "Telegram kanal",
  "source_url": "https://t.me/novy_matrix_lm",
  "article_type": "Sprava",
  "highlight_badge": "Breaking",
  "estimated_reading_time": "4 min",
  "fact_box": "Klucovy fakt alebo kontext.",
  "quote_block": "Citacia alebo vytah.",
  "video_embed": "<iframe ...></iframe>",
  "gallery": [
    {
      "url": "https://example.com/gallery-1.jpg",
      "caption": "Popis obrazka",
      "alt": "Alt text"
    }
  ],
  "related_post_ids": [123, 456],
  "telegram": {
    "message_id": "18",
    "chat_id": "-1001234567890",
    "chat_title": "Novy Matrix Media",
    "author": "telegram-bot",
    "permalink": "https://t.me/novy_matrix_lm/18"
  }
}
```

## Odpoved

```json
{
  "success": true,
  "postId": 321,
  "status": "draft",
  "editLink": "https://.../wp-admin/post.php?post=321&action=edit",
  "permalink": "https://.../?p=321"
}
```

## Sender script

V repozitari je aj maly sender/normalizer script [send_telegram_bridge.py](send_telegram_bridge.py).

Dry run nad Telegram-like JSON payloadom:

```bash
python send_telegram_bridge.py sample-telegram.json --dry-run
```

Dry run nad realnym Telegram Desktop exportom:

```bash
python send_telegram_bridge.py result.json --dry-run
```

Import konkretnej spravy z exportu podla message id:

```bash
python send_telegram_bridge.py result.json --message-id 481 --site-url http://localhost:8080 --token local-telegram-bridge-token
```

Priame odoslanie do lokalneho WordPressu:

```bash
python send_telegram_bridge.py sample-telegram.json --site-url http://localhost:8080 --token local-telegram-bridge-token
```

## Poznamky

- Token je zamerne cez `wp-config.php`, nie v plugin subore.
- Featured image sa sťahuje do WordPress media library iba ak je poslana `featured_image_url`.
- Plugin je zamerne postaveny ako bezpecny ingest do draftu; publikovanie sa da povolit cez `status` alebo `NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS`.
- Pri Telegram exporte script automaticky vyberie poslednu textovu spravu, ak explicitne nezadas `--message-id`.
