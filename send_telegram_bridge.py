import argparse
import json
import sys
import urllib.error
import urllib.request
from html import escape


def build_html_from_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    paragraphs = [line for line in lines if line]
    return "\n".join(f"<p>{escape(line)}</p>" for line in paragraphs)


def normalize_payload(payload: dict) -> dict:
    if "title" in payload and "content" in payload:
        return payload

    message = payload.get("channel_post") or payload.get("message") or payload
    text = message.get("text") or message.get("caption") or ""
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    title = payload.get("title") or (lines[0] if lines else "Telegram import")
    body_lines = lines[1:] if len(lines) > 1 else lines
    content = payload.get("content") or build_html_from_text("\n".join(body_lines)) or "<p>Imported from Telegram.</p>"

    category = payload.get("category") or payload.get("category_slug")
    categories = []
    if isinstance(category, str) and category.strip():
        categories.append({"slug": category.strip(), "name": category.strip().replace("-", " ").title()})

    tags = payload.get("tags") if isinstance(payload.get("tags"), list) else []

    normalized = {
        "title": title,
        "excerpt": payload.get("excerpt") or (body_lines[0] if body_lines else title),
        "content": content,
        "status": payload.get("status", "draft"),
        "categories": payload.get("categories") or categories,
        "tags": tags,
        "subtitle": payload.get("subtitle"),
        "author_name": payload.get("author_name") or "Telegram bridge",
        "source_name": payload.get("source_name") or (message.get("chat", {}) or {}).get("title") or "Telegram",
        "source_url": payload.get("source_url"),
        "highlight_badge": payload.get("highlight_badge") or "Telegram",
        "telegram": {
            "message_id": str(message.get("message_id", "")) if message.get("message_id") is not None else "",
            "chat_id": str((message.get("chat", {}) or {}).get("id", "")) if (message.get("chat", {}) or {}).get("id") is not None else "",
            "chat_title": (message.get("chat", {}) or {}).get("title") or payload.get("telegram_chat_title") or "",
            "author": payload.get("telegram_author") or (message.get("from", {}) or {}).get("username") or "",
            "permalink": payload.get("telegram_permalink") or "",
        },
    }

    if payload.get("featured_image_url"):
        normalized["featured_image_url"] = payload["featured_image_url"]

    return {key: value for key, value in normalized.items() if value not in (None, "", [], {})}


def send_payload(site_url: str, token: str, payload: dict) -> dict:
    endpoint = site_url.rstrip("/") + "/wp-json/nmm-telegram-bridge/v1/ingest"
    body = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-NMM-Bridge-Token": token,
        },
        method="POST",
    )

    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize Telegram payload and send it to the NMM WordPress bridge.")
    parser.add_argument("input", help="Path to a JSON file with either normalized or Telegram-like payload.")
    parser.add_argument("--site-url", default="http://localhost:8080", help="WordPress site URL.")
    parser.add_argument("--token", default="local-telegram-bridge-token", help="Bridge token.")
    parser.add_argument("--dry-run", action="store_true", help="Only print normalized payload without sending.")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as file_handle:
        payload = json.load(file_handle)

    normalized = normalize_payload(payload)

    if args.dry_run:
        json.dump(normalized, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
        return 0

    try:
        response = send_payload(args.site_url, args.token, normalized)
    except urllib.error.HTTPError as error:
        sys.stderr.write(error.read().decode("utf-8", errors="ignore") + "\n")
        return 1
    except urllib.error.URLError as error:
        sys.stderr.write(f"Request failed: {error}\n")
        return 1

    json.dump(response, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())