import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getWordPressConfig } from "@/lib/wp-client";
import { getApprovedCommentsPage } from "@/lib/wp-queries";

const COMMENT_CONTENT_MIN_LENGTH = 5;
const COMMENT_CONTENT_MAX_LENGTH = 4000;
const AUTHOR_NAME_MAX_LENGTH = 120;
const AUTHOR_EMAIL_MAX_LENGTH = 190;
const AUTHOR_URL_MAX_LENGTH = 255;
const MIN_FORM_FILL_MS = 2500;

interface CreateCommentPayload {
  postId?: number;
  authorName?: string;
  authorEmail?: string;
  authorUrl?: string;
  content?: string;
  company?: string;
  formStartedAt?: number;
}

function normalizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPublicUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getWordPressCommentAuthHeader(): string | null {
  const username = process.env.WP_COMMENT_APP_USER
    || process.env.WP_APP_USER
    || process.env.WORDPRESS_APP_USER
    || "";
  const password = process.env.WP_COMMENT_APP_PASSWORD
    || process.env.WP_APP_PASSWORD
    || process.env.WORDPRESS_APP_PASSWORD
    || "";

  if (!username || !password) {
    return null;
  }

  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = Number.parseInt(searchParams.get("perPage") ?? "20", 10);
  const postIdParam = searchParams.get("postId");
  const parsedPostId = postIdParam ? Number.parseInt(postIdParam, 10) : Number.NaN;
  const postId = Number.isInteger(parsedPostId) && parsedPostId > 0 ? parsedPostId : undefined;

  const data = await getApprovedCommentsPage({
    page: Number.isInteger(page) && page > 0 ? page : 1,
    perPage: Number.isInteger(perPage) && perPage > 0 ? perPage : 20,
    postId,
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let payload: CreateCommentPayload;

  try {
    payload = await request.json() as CreateCommentPayload;
  } catch {
    return NextResponse.json({
      error: "Neplatné dáta formulára.",
    }, { status: 400 });
  }

  const postId = Number(payload.postId);
  const authorName = normalizeString(payload.authorName);
  const authorEmail = normalizeString(payload.authorEmail);
  const authorUrl = normalizeString(payload.authorUrl);
  const content = normalizeString(payload.content);
  const company = normalizeString(payload.company);
  const formStartedAt = Number(payload.formStartedAt ?? 0);

  if (company) {
    return NextResponse.json({
      success: true,
      pendingModeration: true,
    }, { status: 202 });
  }

  if (Number.isFinite(formStartedAt) && formStartedAt > 0) {
    const elapsed = Date.now() - formStartedAt;
    if (elapsed >= 0 && elapsed < MIN_FORM_FILL_MS) {
      return NextResponse.json({
        error: "Formulár bol odoslaný príliš rýchlo. Skúste to znova.",
      }, { status: 429 });
    }
  }

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({
      error: "Chýba identifikátor článku.",
    }, { status: 400 });
  }

  if (!authorName || authorName.length > AUTHOR_NAME_MAX_LENGTH) {
    return NextResponse.json({
      error: "Meno je povinné a musí mať primeranú dĺžku.",
    }, { status: 400 });
  }

  if (!authorEmail || authorEmail.length > AUTHOR_EMAIL_MAX_LENGTH || !isValidEmail(authorEmail)) {
    return NextResponse.json({
      error: "Zadajte platný e-mail.",
    }, { status: 400 });
  }

  if (authorUrl.length > AUTHOR_URL_MAX_LENGTH || !isValidPublicUrl(authorUrl)) {
    return NextResponse.json({
      error: "URL webu má neplatný formát.",
    }, { status: 400 });
  }

  if (content.length < COMMENT_CONTENT_MIN_LENGTH || content.length > COMMENT_CONTENT_MAX_LENGTH) {
    return NextResponse.json({
      error: "Komentár musí mať primeranú dĺžku.",
    }, { status: 400 });
  }

  const { restUrl } = getWordPressConfig();
  const authHeader = getWordPressCommentAuthHeader();
  const wpHeaders: HeadersInit = {
    "Content-Type": "application/json; charset=utf-8",
  };

  if (authHeader) {
    wpHeaders.Authorization = authHeader;
  }

  const wpResponse = await fetch(`${restUrl}/comments`, {
    method: "POST",
    headers: wpHeaders,
    body: JSON.stringify({
      post: postId,
      author_name: authorName,
      author_email: authorEmail,
      author_url: authorUrl || undefined,
      content,
    }),
    cache: "no-store",
  });

  const wpResult = await wpResponse.json().catch(() => null) as { code?: string; message?: string } | null;

  if (!wpResponse.ok) {
    const code = wpResult?.code ?? "rest_comment_submit_failed";

    if (code === "rest_comment_closed") {
      return NextResponse.json({ error: "Komentáre sú pre tento článok zatvorené." }, { status: 400 });
    }

    if (code === "rest_comment_login_required") {
      return NextResponse.json({
        error: "Komentovanie je momentálne dostupné iba po prihlásení. Skontrolujte nastavenia moderácie vo WordPresse.",
      }, { status: 503 });
    }

    if (code === "rest_comment_flood") {
      return NextResponse.json({ error: "Komentár bol odoslaný príliš rýchlo. Skúste to o chvíľu." }, { status: 429 });
    }

    return NextResponse.json({
      error: wpResult?.message || "Komentár sa nepodarilo odoslať.",
    }, { status: 400 });
  }

  revalidateTag("wp-comments", { expire: 0 });
  revalidateTag(`wp-post-comments-${postId}`, { expire: 0 });

  return NextResponse.json({
    success: true,
    pendingModeration: true,
    message: "Komentár bol odoslaný na schválenie.",
  }, { status: 202 });
}
