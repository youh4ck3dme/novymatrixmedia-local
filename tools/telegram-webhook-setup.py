#!/usr/bin/env python3
"""Configure Telegram Bot webhook for NMM Telegram Bridge."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


def telegram_api_request(bot_token: str, method: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    url = f"https://api.telegram.org/bot{bot_token}/{method}"
    body = None
    headers = {"Content-Type": "application/json"}

    if payload is not None:
        body = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(url=url, data=body, method="POST" if body is not None else "GET", headers=headers)

    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read().decode("utf-8")
        data = json.loads(raw)

    if not isinstance(data, dict) or not data.get("ok", False):
        raise RuntimeError(f"Telegram API error for {method}: {data}")

    return data


def set_webhook(bot_token: str, webhook_url: str, secret_token: str, drop_pending_updates: bool) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "url": webhook_url,
        "allowed_updates": ["channel_post", "edited_channel_post", "message", "edited_message"],
        "secret_token": secret_token,
        "drop_pending_updates": drop_pending_updates,
    }
    return telegram_api_request(bot_token, "setWebhook", payload)


def delete_webhook(bot_token: str, drop_pending_updates: bool) -> dict[str, Any]:
    payload: dict[str, Any] = {"drop_pending_updates": drop_pending_updates}
    return telegram_api_request(bot_token, "deleteWebhook", payload)


def get_webhook_info(bot_token: str) -> dict[str, Any]:
    return telegram_api_request(bot_token, "getWebhookInfo")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Set or delete Telegram webhook for NMM WordPress bridge.")
    parser.add_argument("--bot-token", required=True, help="Telegram bot token from @BotFather")
    parser.add_argument(
        "--webhook-url",
        default="https://info.novymatrixmedia.sk/wp-json/nmm-telegram-bridge/v1/webhook",
        help="Target webhook URL on WordPress",
    )
    parser.add_argument(
        "--secret-token",
        default="",
        help="Value that must match NMM_TELEGRAM_WEBHOOK_SECRET in wp-config.php",
    )
    parser.add_argument(
        "--drop-pending-updates",
        action="store_true",
        help="Drop queued Telegram updates when (re)setting webhook.",
    )
    parser.add_argument(
        "--delete",
        action="store_true",
        help="Delete webhook instead of setting it.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        if args.delete:
            result = delete_webhook(args.bot_token, args.drop_pending_updates)
            info = get_webhook_info(args.bot_token)
            output = {"action": "deleteWebhook", "result": result, "webhookInfo": info}
            json.dump(output, sys.stdout, ensure_ascii=False, indent=2)
            sys.stdout.write("\n")
            return 0

        if args.secret_token.strip() == "":
            raise ValueError("--secret-token is required when setting webhook.")

        result = set_webhook(
            bot_token=args.bot_token,
            webhook_url=args.webhook_url,
            secret_token=args.secret_token,
            drop_pending_updates=args.drop_pending_updates,
        )
        info = get_webhook_info(args.bot_token)
        output = {"action": "setWebhook", "result": result, "webhookInfo": info}
        json.dump(output, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
        return 0
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        sys.stderr.write(f"Request failed: {exc}\n")
        return 1
    except (ValueError, RuntimeError) as exc:
        sys.stderr.write(f"{exc}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
