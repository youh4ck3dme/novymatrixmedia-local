# Telegram mirroring (`@novymatrixmedia`) setup

This project already contains the `nmm-telegram-bridge` plugin.  
The plugin now supports direct Telegram webhooks and duplicate protection.

## 1) Required WP constants

Set these in production `wp-config.php`:

```php
define('NMM_TELEGRAM_BRIDGE_ENABLED', true); // default is disabled
define('NMM_TELEGRAM_BRIDGE_TOKEN', 'replace-with-long-random-token');
define('NMM_TELEGRAM_BRIDGE_DEFAULT_STATUS', 'draft'); // draft|pending|publish
define('NMM_TELEGRAM_WEBHOOK_SECRET', 'replace-with-telegram-webhook-secret');
define('NMM_TELEGRAM_SOURCE_CHAT', '@novymatrixmedia'); // or -1001234567890
```

Notes:
- If `NMM_TELEGRAM_BRIDGE_ENABLED` is missing/false, plugin routes are not registered.
- `NMM_TELEGRAM_WEBHOOK_SECRET` must match the `secret_token` passed to Telegram `setWebhook`.
- `NMM_TELEGRAM_SOURCE_CHAT` can be a comma-separated allowlist if needed.

## 2) Telegram bot prerequisites

1. Create bot in `@BotFather` and keep the bot token.
2. Add bot to channel/group `@novymatrixmedia`.
3. Give bot admin rights (at least to read/post updates in that chat).

## 3) Set webhook

From repo root:

```bash
python tools/telegram-webhook-setup.py \
  --bot-token "<BOT_TOKEN>" \
  --webhook-url "https://info.novymatrixmedia.sk/wp-json/nmm-telegram-bridge/v1/webhook" \
  --secret-token "<NMM_TELEGRAM_WEBHOOK_SECRET>" \
  --drop-pending-updates
```

The command prints `getWebhookInfo` so you can verify Telegram accepted it.

## 4) Optional cleanup of old posts (safe mode: move to Trash)

Run on WP host using WP-CLI:

```bash
wp post delete $(wp post list --post_type=post --post_status=publish,draft,pending,future,private --format=ids)
```

This moves posts to Trash.  
To permanently remove trashed posts:

```bash
wp post delete $(wp post list --post_status=trash --format=ids) --force
```

## 5) Expected ingest behavior

- New `channel_post` or `message` from allowed chat => new post.
- `edited_channel_post` or `edited_message` with same `chat_id + message_id` => existing post update.
- Duplicate webhook delivery => deduped (no cloned posts).
- Hashtags are converted into tags; selected hashtags map to categories (`domov`, `zahranicie`, `komentare`, `zaujimave`, `video`).
