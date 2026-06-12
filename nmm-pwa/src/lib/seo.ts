import type { Metadata } from "next";

import type { HomePageData, SiteCategory, SitePost } from "@/types/wordpress";

const DEFAULT_TITLE = "Nový Matrix Media";
const DEFAULT_DESCRIPTION = "Informačno-publicistický portál v novom rozmere.";
const META_TITLE_MAX_LENGTH = 90;
const META_DESCRIPTION_MAX_LENGTH = 220;

export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://novymatrixmedia.sk").replace(/\/$/, "");
}

function buildAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalizedPath}`;
}

function normalizeMetadataText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isWordChar(value: string): boolean {
  return /[\p{L}\p{N}]/u.test(value);
}

function isLikelyClippedPrefix(candidate: string, fallback: string): boolean {
  if (!candidate || !fallback || candidate.length >= fallback.length) {
    return false;
  }

  const candidateLower = candidate.toLocaleLowerCase("sk-SK");
  const fallbackLower = fallback.toLocaleLowerCase("sk-SK");
  if (!fallbackLower.startsWith(candidateLower)) {
    return false;
  }

  const candidateLast = candidate.at(-1) ?? "";
  const nextChar = fallback.slice(candidate.length, candidate.length + 1);
  return Boolean(nextChar) && isWordChar(candidateLast) && isWordChar(nextChar);
}

function preferNonClippedValue(primary: string | undefined, fallback: string): string {
  const normalizedPrimary = normalizeMetadataText(primary ?? "");
  const normalizedFallback = normalizeMetadataText(fallback);

  if (!normalizedPrimary) {
    return normalizedFallback;
  }

  if (!normalizedFallback) {
    return normalizedPrimary;
  }

  if (isLikelyClippedPrefix(normalizedPrimary, normalizedFallback)) {
    return normalizedFallback;
  }

  return normalizedPrimary;
}

function truncateByWordBoundary(value: string, maxLength: number): string {
  const normalized = normalizeMetadataText(value);

  if (!normalized) {
    return normalized;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const candidate = normalized.slice(0, maxLength + 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const hardCut = normalized.slice(0, maxLength).trimEnd();

  if (lastSpace > Math.floor(maxLength * 0.6)) {
    return `${candidate.slice(0, lastSpace).trimEnd()}…`;
  }

  return `${hardCut}…`;
}

export function buildDefaultMetadata(): Metadata {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: getPublicSiteUrl(),
    },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: getPublicSiteUrl(),
      siteName: DEFAULT_TITLE,
      locale: "sk_SK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
  };
}

export function buildHomeMetadata(data: HomePageData): Metadata {
  const featured = data.featuredPost;
  if (!featured) {
    return buildDefaultMetadata();
  }

  const title = DEFAULT_TITLE;
  const description = DEFAULT_DESCRIPTION;
  const ogImage = featured.ogImage || featured.imageUrl;

  return {
    ...buildDefaultMetadata(),
    openGraph: {
      title,
      description,
      url: getPublicSiteUrl(),
      siteName: DEFAULT_TITLE,
      locale: "sk_SK",
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: featured.imageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function buildPostMetadata(post: SitePost): Metadata {
  const baseDescription = post.excerpt || DEFAULT_DESCRIPTION;

  const titleSource = preferNonClippedValue(post.seoTitle, post.title);
  const descriptionSource = preferNonClippedValue(post.seoDescription, baseDescription);
  const ogTitleSource = preferNonClippedValue(post.ogTitle, titleSource);
  const ogDescriptionSource = preferNonClippedValue(post.ogDescription, descriptionSource);

  const title = truncateByWordBoundary(titleSource, META_TITLE_MAX_LENGTH);
  const description = truncateByWordBoundary(descriptionSource, META_DESCRIPTION_MAX_LENGTH);
  const canonical = buildAbsoluteUrl(post.href);
  const ogTitle = truncateByWordBoundary(ogTitleSource, META_TITLE_MAX_LENGTH);
  const ogDescription = truncateByWordBoundary(ogDescriptionSource, META_DESCRIPTION_MAX_LENGTH);
  const ogImage = post.ogImage || post.imageUrl;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: DEFAULT_TITLE,
      locale: "sk_SK",
      type: "article",
      publishedTime: post.modifiedAt,
      images: ogImage ? [{ url: ogImage, alt: post.imageAlt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function buildCategoryMetadata(category: SiteCategory): Metadata {
  const title = `${category.name} | ${DEFAULT_TITLE}`;
  const description = category.description || `Články a komentáre z kategórie ${category.name}.`;
  const canonical = buildAbsoluteUrl(category.href);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: DEFAULT_TITLE,
      locale: "sk_SK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
