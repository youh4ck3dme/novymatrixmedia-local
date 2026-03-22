import argparse
import json
import sys
import urllib.error
import urllib.request
from html import escape
from typing import Any, TypeAlias, cast


JsonObject: TypeAlias = dict[str, Any]


def as_string(value: Any, default: str = "") -> str:
    if isinstance(value, str):
        return value
    return default


def as_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in cast(list[Any], value):
        if isinstance(item, str):
            result.append(item)
    return result


def as_object(value: Any) -> JsonObject:
    if isinstance(value, dict):
        return cast(JsonObject, value)
    return {}


def as_object_list(value: Any) -> list[JsonObject]:
    if not isinstance(value, list):
        return []

    result: list[JsonObject] = []
    for item in cast(list[Any], value):
        if isinstance(item, dict):
            result.append(cast(JsonObject, item))
    return result


def build_html_from_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    paragraphs = [line for line in lines if line]
    return "\n".join(f"<p>{escape(line)}</p>" for line in paragraphs)


def flatten_telegram_text(value: Any) -> str:
    if isinstance(value, str):
        return value

    if isinstance(value, list):
        fragments: list[str] = []
        for item in cast(list[Any], value):
            if isinstance(item, str):
                fragments.append(item)
                continue

            if isinstance(item, dict):
                text = as_string(item.get("text"))
                if text:
                    fragments.append(text)

        return "".join(fragments)

    return ""


def get_export_message_text(message: JsonObject) -> str:
    return flatten_telegram_text(message.get("text")) or flatten_telegram_text(
        message.get("caption")
    )


def get_telegram_export_message(
    payload: JsonObject, selected_message_id: str | None
) -> JsonObject | None:
    messages = as_object_list(payload.get("messages"))
    if not messages:
        return None

    if selected_message_id:
        for message in messages:
            if str(message.get("id", "")).strip() == selected_message_id:
                return message

        raise ValueError(
            f"Telegram export does not contain message id {selected_message_id}."
        )

    for message in reversed(messages):
        message_type = as_string(message.get("type"), "message")
        if message_type != "message":
            continue

        if get_export_message_text(message).strip():
            return message

    raise ValueError("Telegram export does not contain any text message to import.")


def normalize_payload(
    payload: JsonObject, selected_message_id: str | None = None
) -> JsonObject:
    if "title" in payload and "content" in payload:
        return payload

    export_message = get_telegram_export_message(payload, selected_message_id)
    message = (
        export_message
        or as_object(payload.get("channel_post"))
        or as_object(payload.get("message"))
        or payload
    )
    text = get_export_message_text(message)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    title = as_string(payload.get("title")) or (
        lines[0] if lines else "Telegram import"
    )
    body_lines = lines[1:] if len(lines) > 1 else lines
    content = (
        as_string(payload.get("content"))
        or build_html_from_text("\n".join(body_lines))
        or "<p>Imported from Telegram.</p>"
    )

    category = as_string(payload.get("category")) or as_string(
        payload.get("category_slug")
    )
    categories: list[JsonObject] = []
    if category.strip():
        categories.append(
            {
                "slug": category.strip(),
                "name": category.strip().replace("-", " ").title(),
            }
        )

    tags = as_string_list(payload.get("tags"))

    chat = as_object(message.get("chat"))
    sender = as_object(message.get("from"))
    export_chat_title = as_string(payload.get("name")) or as_string(
        payload.get("telegram_chat_title")
    )
    export_chat_id = payload.get("id")
    export_author = as_string(message.get("from"))
    published_at = as_string(payload.get("published_at")) or as_string(
        message.get("date")
    )

    normalized: JsonObject = {
        "title": title,
        "excerpt": as_string(payload.get("excerpt"))
        or (body_lines[0] if body_lines else title),
        "content": content,
        "status": as_string(payload.get("status"), "draft"),
        "published_at": published_at,
        "categories": (
            payload.get("categories")
            if isinstance(payload.get("categories"), list)
            else categories
        ),
        "tags": tags,
        "subtitle": as_string(payload.get("subtitle")),
        "author_name": as_string(payload.get("author_name")) or "Telegram bridge",
        "source_name": as_string(payload.get("source_name"))
        or as_string(chat.get("title"))
        or export_chat_title
        or "Telegram",
        "source_url": as_string(payload.get("source_url")),
        "highlight_badge": as_string(payload.get("highlight_badge")) or "Telegram",
        "editorial_readiness": as_string(payload.get("editorial_readiness")),
        "telegram": {
            "message_id": (
                str(message_id)
                if (message_id := message.get("message_id") or message.get("id"))
                is not None
                else ""
            ),
            "chat_id": (
                str(chat_id)
                if (chat_id := chat.get("id") or export_chat_id) is not None
                else ""
            ),
            "chat_title": as_string(chat.get("title")) or export_chat_title,
            "author": as_string(payload.get("telegram_author"))
            or as_string(sender.get("username"))
            or export_author,
            "permalink": as_string(payload.get("telegram_permalink"))
            or as_string(message.get("link")),
        },
    }

    if payload.get("featured_image_url"):
        normalized["featured_image_url"] = payload["featured_image_url"]

    return {
        key: value
        for key, value in normalized.items()
        if value not in (None, "", [], {})
    }


def send_payload(site_url: str, token: str, payload: JsonObject) -> JsonObject:
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
        return cast(JsonObject, json.loads(response.read().decode("utf-8")))


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Normalize Telegram payload and send it to the NMM WordPress bridge."
    )
    parser.add_argument(
        "input",
        help="Path to a JSON file with either normalized or Telegram-like payload.",
    )
    parser.add_argument(
        "--site-url", default="http://localhost:8080", help="WordPress site URL."
    )
    parser.add_argument(
        "--token", default="local-telegram-bridge-token", help="Bridge token."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only print normalized payload without sending.",
    )
    parser.add_argument(
        "--message-id",
        help="Specific Telegram export message id to import. Defaults to the latest text message in export JSON.",
    )
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as file_handle:
        payload = as_object(json.load(file_handle))

    try:
        normalized = normalize_payload(payload, args.message_id)
    except ValueError as error:
        sys.stderr.write(f"{error}\n")
        return 1

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
