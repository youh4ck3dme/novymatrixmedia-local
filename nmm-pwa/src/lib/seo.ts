import type { Metadata } from "next";

import type { SiteCategory, SitePost } from "@/types/wordpress";

const DEFAULT_TITLE = "Novy Matrix Media";
const DEFAULT_DESCRIPTION = "Informačno-publicistický portál v novom rozmere.";

export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://novymatrixmedia.sk").replace(/\/$/, "");
}

function buildAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalizedPath}`;
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
  };
}

export function buildPostMetadata(post: SitePost): Metadata {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || DEFAULT_DESCRIPTION;
  const canonical = buildAbsoluteUrl(post.href);
  const ogTitle = post.ogTitle || title;
  const ogDescription = post.ogDescription || description;
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
  };
}