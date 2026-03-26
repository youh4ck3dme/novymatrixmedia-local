import { NextResponse } from "next/server";

import { getWordPressConfig } from "@/lib/wp-client";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop";
const MAX_RESULTS = 20;
const MIN_QUERY_LENGTH = 2;

type SearchMode = "all" | "articles" | "photos";
type SearchResultType = "article" | "photo";

interface SearchResult {
  id: number;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  categoryLabel: string;
  resultType: SearchResultType;
  imageUrl?: string;
}

interface WordPressRenderedField {
  rendered: string;
}

interface WordPressTermRaw {
  taxonomy?: string;
  name?: string;
}

interface WordPressPostRaw {
  id: number;
  slug: string;
  date: string;
  title: WordPressRenderedField;
  excerpt: WordPressRenderedField;
  content?: WordPressRenderedField;
  nmm_featured_image_url?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      media_details?: {
        sizes?: Record<string, { source_url?: string }>;
      };
    }>;
    "wp:term"?: WordPressTermRaw[][];
  };
}

interface RankedResult {
  result: SearchResult;
  score: number;
  timestamp: number;
}

function normalizeString(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

function resolveSearchMode(rawMode: string | null): SearchMode {
  if (rawMode === "articles" || rawMode === "photos" || rawMode === "all") {
    return rawMode;
  }

  return "all";
}

function getTagLabels(post: WordPressPostRaw): string[] {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];

  return terms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => stripHtml(term.name ?? ""))
    .filter(Boolean);
}

function getCategoryLabel(post: WordPressPostRaw): string {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const category = terms.find((term) => term.taxonomy === "category");
  return stripHtml(category?.name ?? "Článok");
}

function getPreferredImageUrl(post: WordPressPostRaw): string | undefined {
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  const large = featured?.media_details?.sizes?.large?.source_url;
  const mediumLarge = featured?.media_details?.sizes?.medium_large?.source_url;
  const full = featured?.source_url;
  const fromMeta = typeof post.nmm_featured_image_url === "string" ? post.nmm_featured_image_url.trim() : "";
  const resolved = fromMeta || full || large || mediumLarge || "";

  if (!resolved || resolved === FALLBACK_IMAGE) {
    return undefined;
  }

  return resolved;
}

function buildScoredResult(post: WordPressPostRaw, normalizedQuery: string): RankedResult | null {
  const title = stripHtml(post.title?.rendered ?? "");
  const excerpt = stripHtml(post.excerpt?.rendered ?? "");
  const content = stripHtml(post.content?.rendered ?? "");
  const tags = getTagLabels(post);
  const categoryLabel = getCategoryLabel(post);
  const imageUrl = getPreferredImageUrl(post);

  const normalizedTitle = normalizeString(title);
  const normalizedExcerpt = normalizeString(excerpt);
  const normalizedContent = normalizeString(content);
  const normalizedTags = tags.map(normalizeString);

  let score = 0;

  if (normalizedTitle.includes(normalizedQuery)) {
    score += 120;
    if (normalizedTitle.startsWith(normalizedQuery)) {
      score += 35;
    }
  }

  if (normalizedTags.some((tag) => tag.includes(normalizedQuery))) {
    score += 70;
  }

  if (normalizedExcerpt.includes(normalizedQuery)) {
    score += 45;
  }

  if (normalizedContent.includes(normalizedQuery)) {
    score += 25;
  }

  if (score === 0) {
    return null;
  }

  const resultType: SearchResultType = imageUrl ? "photo" : "article";

  return {
    score,
    timestamp: new Date(post.date).getTime() || 0,
    result: {
      id: post.id,
      slug: post.slug,
      href: `/${post.slug}`,
      title,
      excerpt,
      dateLabel: formatDate(post.date),
      categoryLabel,
      resultType,
      imageUrl,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").trim();
  const mode = resolveSearchMode(searchParams.get("mode"));
  const normalizedQuery = normalizeString(rawQuery);

  if (normalizedQuery.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({
      query: rawQuery,
      mode,
      results: [] as SearchResult[],
      total: 0,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const { restUrl } = getWordPressConfig();

  try {
    const response = await fetch(`${restUrl}/posts?_embed=1&per_page=100&search=${encodeURIComponent(rawQuery)}&orderby=date&order=desc`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`WordPress search request failed: ${response.status}`);
    }

    const posts = await response.json() as WordPressPostRaw[];
    const ranked = posts
      .map((post) => buildScoredResult(post, normalizedQuery))
      .filter((item): item is RankedResult => Boolean(item))
      .filter((item) => {
        if (mode === "photos") {
          return item.result.resultType === "photo";
        }

        return true;
      })
      .map((item) => {
        if (mode === "articles") {
          return {
            ...item,
            result: {
              ...item.result,
              resultType: "article" as const,
            },
          };
        }

        return item;
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return b.timestamp - a.timestamp;
      })
      .slice(0, MAX_RESULTS)
      .map((item) => item.result);

    return NextResponse.json({
      query: rawQuery,
      mode,
      results: ranked,
      total: ranked.length,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({
      query: rawQuery,
      mode,
      results: [] as SearchResult[],
      total: 0,
    }, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
