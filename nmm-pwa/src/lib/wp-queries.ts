import { getWordPressConfig } from "@/lib/wp-client";
import { wpGraphQLFetch } from "@/lib/wp-graphql";
import { wpRestFetch } from "@/lib/wp-rest";
import type {
  CategoryPageData,
  HomePageData,
  SiteCategory,
  SiteComment,
  SiteCommentsPageData,
  SiteNavigationItem,
  SitePost,
  SitePostSource,
  WordPressCategoryRaw,
  WordPressCommentRaw,
  WordPressEditorialMetaRaw,
  WordPressPostRaw,
  WordPressPublicAuthorRaw,
} from "@/types/wordpress";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop";
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://novymatrixmedia.sk").replace(/\/$/, "");

const CATEGORY_SLUGS_FOR_SITEMAP = ["politika", "zahranicie", "komentare", "diskusia", "domov", "zaujimave", "video"];

interface PrimaryMenuBlueprintItem {
  slug: string;
  label: string;
  categorySlug: string | null;
  aliases: string[];
}

const PRIMARY_MENU_BLUEPRINT = [
  { slug: "home", label: "Domov", categorySlug: null, aliases: ["domov", "home"] },
  { slug: "domov", label: "Z domova", categorySlug: "domov", aliases: ["z domova", "z-domova", "domov"] },
  { slug: "zahranicie", label: "Zahraničie", categorySlug: "zahranicie", aliases: ["zahranicie", "zahraničie"] },
  { slug: "komentare", label: "Komentáre", categorySlug: "komentare", aliases: ["komentare", "komentáre"] },
  { slug: "zaujimave", label: "Zaujímavé", categorySlug: "zaujimave", aliases: ["zaujimave", "zaujímavé"] },
  { slug: "video", label: "Video", categorySlug: "video", aliases: ["video"] },
] satisfies PrimaryMenuBlueprintItem[];

interface WordPressMenuItemNode {
  id: string;
  label: string;
  path?: string | null;
  uri?: string | null;
  parentId?: string | null;
  target?: string | null;
  connectedNode?: {
    node?: {
      slug?: string | null;
      uri?: string | null;
    } | null;
  } | null;
}

interface WordPressPrimaryMenuQueryResult {
  menuItems?: {
    nodes?: WordPressMenuItemNode[];
  };
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toMatchKey(value: string): string {
  return stripHtml(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

function formatCommentDate(value: string): string {
  return new Date(value).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCommentExcerpt(contentHtml: string, maxLength = 220): string {
  const plainText = stripHtml(contentHtml);
  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

function parseLines(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => stripHtml(line))
    .filter(Boolean);
}

function parseIdList(value?: string): number[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((chunk) => Number.parseInt(chunk.trim(), 10))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function isValidSourceUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseSourceItems(rawSources?: string, fallbackSourceName?: string, fallbackSourceUrl?: string): SitePostSource[] {
  const items: SitePostSource[] = [];
  const dedupe = new Set<string>();

  const pushItem = (nameRaw?: string, urlRaw?: string) => {
    const name = nameRaw ? stripHtml(nameRaw) : "";
    const urlCandidate = (urlRaw ?? "").trim();
    const url = isValidSourceUrl(urlCandidate) ? urlCandidate : undefined;

    if (!name) {
      return;
    }

    const key = `${name.toLowerCase()}|${(url ?? "").toLowerCase()}`;
    if (dedupe.has(key)) {
      return;
    }

    dedupe.add(key);
    items.push({ name, url });
  };

  if (rawSources) {
    rawSources
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [namePart, ...restParts] = line.split("|");
        const urlPart = restParts.join("|").trim();
        pushItem(namePart, urlPart || undefined);
      });
  }

  if (items.length === 0 && fallbackSourceName) {
    pushItem(fallbackSourceName, fallbackSourceUrl);
  }

  return items;
}

function normalizePublicAuthor(rawAuthor?: WordPressPublicAuthorRaw, fallbackId?: string) {
  const normalizedFallbackId = fallbackId ? stripHtml(fallbackId) : "";
  const authorId = typeof rawAuthor?.id === "string" && rawAuthor.id.trim() !== ""
    ? rawAuthor.id.trim()
    : normalizedFallbackId || undefined;
  const authorName = typeof rawAuthor?.name === "string" ? stripHtml(rawAuthor.name) : "";

  if (!authorId || !authorName) {
    return undefined;
  }

  const authorType = typeof rawAuthor?.type === "string" ? stripHtml(rawAuthor.type) : "";
  const wpUserId = Number.isInteger(rawAuthor?.wpUserId) && Number(rawAuthor?.wpUserId) > 0
    ? Number(rawAuthor?.wpUserId)
    : undefined;

  return {
    id: authorId,
    name: authorName,
    type: authorType || undefined,
    wpUserId,
  };
}

function getTagLabels(post: WordPressPostRaw): string[] {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];

  return terms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => term.name)
    .filter(Boolean);
}

function normalizeEditorialMeta(meta?: WordPressEditorialMetaRaw) {
  const normalizedSourceName = meta?.nmm_source_name ? stripHtml(meta.nmm_source_name) : undefined;
  const normalizedSourceUrl = meta?.nmm_source_url?.trim() || undefined;
  const normalizedSources = parseSourceItems(meta?.nmm_sources, normalizedSourceName, normalizedSourceUrl);

  return {
    subtitle: meta?.nmm_subtitle ? stripHtml(meta.nmm_subtitle) : undefined,
    authorName: meta?.nmm_author_name ? stripHtml(meta.nmm_author_name) : undefined,
    publicAuthorId: meta?.nmm_public_author_id ? stripHtml(meta.nmm_public_author_id) : undefined,
    sourceName: normalizedSources[0]?.name ?? normalizedSourceName,
    sourceUrl: normalizedSources[0]?.url ?? normalizedSourceUrl,
    sources: normalizedSources,
    imageAlt: meta?.nmm_featured_image_alt ? stripHtml(meta.nmm_featured_image_alt) : undefined,
    imageCaption: meta?.nmm_featured_image_caption ? stripHtml(meta.nmm_featured_image_caption) : undefined,
    gallery: parseLines(meta?.nmm_gallery),
    videoEmbed: meta?.nmm_video_embed?.trim() || undefined,
    articleType: meta?.nmm_article_type ? stripHtml(meta.nmm_article_type) : undefined,
    highlightBadge: meta?.nmm_highlight_badge ? stripHtml(meta.nmm_highlight_badge) : undefined,
    estimatedReadingTime: meta?.nmm_estimated_reading_time ? stripHtml(meta.nmm_estimated_reading_time) : undefined,
    factBox: parseLines(meta?.nmm_fact_box),
    relatedPostIds: parseIdList(meta?.nmm_related_posts),
    quoteBlock: meta?.nmm_quote_block ? stripHtml(meta.nmm_quote_block) : undefined,
    conclusionNumber: meta?.nmm_conclusion_number ? stripHtml(meta.nmm_conclusion_number) : undefined,
    conclusionText: meta?.nmm_conclusion_text ? stripHtml(meta.nmm_conclusion_text) : undefined,
    seoTitle: meta?.nmm_seo_title ? stripHtml(meta.nmm_seo_title) : undefined,
    seoDescription: meta?.nmm_seo_description ? stripHtml(meta.nmm_seo_description) : undefined,
    ogTitle: meta?.nmm_og_title ? stripHtml(meta.nmm_og_title) : undefined,
    ogDescription: meta?.nmm_og_description ? stripHtml(meta.nmm_og_description) : undefined,
    ogImage: meta?.nmm_og_image?.trim() || undefined,
    editorialReadiness: meta?.nmm_editorial_readiness ? stripHtml(meta.nmm_editorial_readiness) : undefined,
    ingestSource: meta?.nmm_ingest_source ? stripHtml(meta.nmm_ingest_source) : undefined,
    telegramMessageId: meta?.nmm_telegram_message_id ? stripHtml(meta.nmm_telegram_message_id) : undefined,
    telegramChatId: meta?.nmm_telegram_chat_id ? stripHtml(meta.nmm_telegram_chat_id) : undefined,
    telegramChatTitle: meta?.nmm_telegram_chat_title ? stripHtml(meta.nmm_telegram_chat_title) : undefined,
    telegramAuthor: meta?.nmm_telegram_author ? stripHtml(meta.nmm_telegram_author) : undefined,
    telegramPermalink: meta?.nmm_telegram_permalink?.trim() || undefined,
  };
}

function normalizePost(post: WordPressPostRaw): SitePost {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const category = post._embedded?.["wp:term"]?.flat().find((term) => term.taxonomy === "category" && typeof term.slug === "string");
  const editorialMeta = normalizeEditorialMeta(post.meta);
  const normalizedPublicAuthor = normalizePublicAuthor(post.nmm_public_author, editorialMeta.publicAuthorId);
  const postFeaturedImageUrl = typeof post.nmm_featured_image_url === "string" && post.nmm_featured_image_url.trim() !== ""
    ? post.nmm_featured_image_url.trim()
    : undefined;
  const postFeaturedImageAlt = typeof post.nmm_featured_image_alt_public === "string" && post.nmm_featured_image_alt_public.trim() !== ""
    ? post.nmm_featured_image_alt_public.trim()
    : undefined;
  const postFeaturedImageCaption = typeof post.nmm_featured_image_caption_public === "string" && post.nmm_featured_image_caption_public.trim() !== ""
    ? post.nmm_featured_image_caption_public.trim()
    : undefined;
  const mediaDetails = featuredMedia?.media_details;
  const responsiveMediaSource = mediaDetails?.sizes?.medium_large
    ?? mediaDetails?.sizes?.large
    ?? mediaDetails?.sizes?.full
    ?? mediaDetails?.sizes?.medium
    ?? null;
  const preferredImageUrl = postFeaturedImageUrl
    ?? featuredMedia?.source_url
    ?? responsiveMediaSource?.source_url
    ?? editorialMeta.ogImage
    ?? FALLBACK_IMAGE;

  return {
    id: post.id,
    slug: post.slug,
    href: `/${post.slug}`,
    title: stripHtml(post.title.rendered),
    subtitle: editorialMeta.subtitle,
    excerpt: stripHtml(post.excerpt.rendered),
    content: post.content?.rendered,
    publishedAt: formatDate(post.date),
    modifiedAt: post.modified,
    authorName: editorialMeta.authorName,
    publicAuthor: normalizedPublicAuthor,
    sourceName: editorialMeta.sourceName,
    sourceUrl: editorialMeta.sourceUrl,
    sources: editorialMeta.sources,
    imageUrl: preferredImageUrl,
    imageAlt: editorialMeta.imageAlt || featuredMedia?.alt_text || postFeaturedImageAlt || stripHtml(post.title.rendered),
    imageWidth: responsiveMediaSource?.width ?? mediaDetails?.width,
    imageHeight: responsiveMediaSource?.height ?? mediaDetails?.height,
    imageCaption: editorialMeta.imageCaption || postFeaturedImageCaption,
    categoryLabel: category?.name ?? "Nový Matrix Media",
    categorySlug: category?.slug ?? "novy-matrix-media",
    articleType: editorialMeta.articleType,
    highlightBadge: editorialMeta.highlightBadge,
    estimatedReadingTime: editorialMeta.estimatedReadingTime,
    factBox: editorialMeta.factBox,
    quoteBlock: editorialMeta.quoteBlock,
    conclusionNumber: editorialMeta.conclusionNumber,
    conclusionText: editorialMeta.conclusionText,
    tagLabels: getTagLabels(post),
    relatedPostIds: editorialMeta.relatedPostIds,
    videoEmbed: editorialMeta.videoEmbed,
    gallery: editorialMeta.gallery,
    seoTitle: editorialMeta.seoTitle || post.yoast_head_json?.title,
    seoDescription: editorialMeta.seoDescription || post.yoast_head_json?.description,
    ogTitle: editorialMeta.ogTitle,
    ogDescription: editorialMeta.ogDescription,
    ogImage: editorialMeta.ogImage,
    editorialReadiness: editorialMeta.editorialReadiness,
    ingestSource: editorialMeta.ingestSource,
    telegramMessageId: editorialMeta.telegramMessageId,
    telegramChatId: editorialMeta.telegramChatId,
    telegramChatTitle: editorialMeta.telegramChatTitle,
    telegramAuthor: editorialMeta.telegramAuthor,
    telegramPermalink: editorialMeta.telegramPermalink,
  };
}

async function getAllPostsForArchive(maxPages = 10): Promise<WordPressPostRaw[]> {
  const allPosts: WordPressPostRaw[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    let pagePosts: WordPressPostRaw[] = [];

    try {
      pagePosts = await wpRestFetch<WordPressPostRaw[]>("posts", {
        query: {
          _embed: 1,
          per_page: 100,
          page,
          orderby: "date",
          order: "desc",
        },
        revalidate: 300,
        tags: ["wp-posts", "wp-photo-archive"],
      });
    } catch {
      break;
    }

    if (pagePosts.length === 0) {
      break;
    }

    allPosts.push(...pagePosts);

    if (pagePosts.length < 100) {
      break;
    }
  }

  return allPosts;
}

function normalizeCategory(category: WordPressCategoryRaw): SiteCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    href: `/${category.slug}`,
    description: stripHtml(category.description ?? ""),
  };
}

function getKnownInternalHosts(): Set<string> {
  const hosts = new Set<string>();
  const { siteUrl, graphqlUrl } = getWordPressConfig();

  for (const candidate of [PUBLIC_SITE_URL, siteUrl, graphqlUrl]) {
    try {
      hosts.add(new URL(candidate).host);
    } catch {
      // Ignore malformed environment values and fall back to relative-path handling.
    }
  }

  return hosts;
}

function normalizeInternalPath(value: string): string {
  const sanitizedValue = value.split("#")[0] ?? value;
  const path = sanitizedValue.replace(/\/$/, "") || "/";
  return path.startsWith("/") ? path : `/${path.replace(/^\/+/, "")}`;
}

function getSlugFromHref(href: string, fallbackSlug?: string | null): string {
  if (fallbackSlug) {
    return fallbackSlug;
  }

  const path = normalizeInternalPath(href);
  if (path === "/") {
    return "home";
  }

  const [firstSegment] = path.replace(/^\/+/, "").split("/");
  return firstSegment || "home";
}

function getHrefSlug(href: string): string {
  const path = normalizeInternalPath(href);
  if (path === "/") {
    return "home";
  }
  return path.replace(/^\/+/, "").split("/")[0] || "home";
}

function normalizeNavigationItems(items: SiteNavigationItem[], activeSlug = "home"): SiteNavigationItem[] {
  return items.map((item) => ({
    ...item,
    active: item.slug === activeSlug,
  }));
}

function normalizeMenuHref(rawHref?: string | null): { href: string; isExternal: boolean } | null {
  if (!rawHref) {
    return null;
  }

  const value = rawHref.trim();
  if (!value || value === "#") {
    return null;
  }

  const internalHosts = getKnownInternalHosts();

  try {
    const parsedUrl = new URL(value);
    if (internalHosts.has(parsedUrl.host)) {
      return {
        href: `${normalizeInternalPath(parsedUrl.pathname)}${parsedUrl.search}${parsedUrl.hash}`,
        isExternal: false,
      };
    }

    return {
      href: parsedUrl.toString(),
      isExternal: true,
    };
  } catch {
    return {
      href: normalizeInternalPath(value),
      isExternal: false,
    };
  }
}

function normalizeMenuItem(node: WordPressMenuItemNode): SiteNavigationItem | null {
  const normalizedHref = normalizeMenuHref(node.connectedNode?.node?.uri ?? node.path ?? node.uri);
  if (!normalizedHref) {
    return null;
  }

  const connectedSlug = node.connectedNode?.node?.slug ?? null;
  return {
    label: stripHtml(node.label),
    href: normalizedHref.href,
    slug: normalizedHref.isExternal ? node.id : getSlugFromHref(normalizedHref.href, connectedSlug),
    isExternal: normalizedHref.isExternal,
    target: node.target ?? null,
  };
}

function buildNavigationFromCategories(categories: WordPressCategoryRaw[]): SiteNavigationItem[] {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return PRIMARY_MENU_BLUEPRINT.flatMap((entry) => {
    if (entry.slug === "home") {
      return [{ label: entry.label, href: "/", slug: "home" }];
    }

    if (!entry.categorySlug) {
      return [];
    }

    const category = categoryMap.get(entry.categorySlug);
    if (!category) {
      return [];
    }

    return [{ label: entry.label, href: `/${category.slug}`, slug: entry.slug }];
  });
}

function buildPrimaryNavigation(menuItems: SiteNavigationItem[], categories: WordPressCategoryRaw[]): SiteNavigationItem[] {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const usedKeys = new Set<string>();
  const usedItem = (item: SiteNavigationItem) => `${item.slug}|${item.href}|${item.label}`;

  return PRIMARY_MENU_BLUEPRINT.flatMap((entry) => {
    const matchingMenuItem = menuItems.find((item) => {
      const key = usedItem(item);
      if (usedKeys.has(key) || item.isExternal) {
        return false;
      }

      const itemSlug = toMatchKey(item.slug);
      const itemLabel = toMatchKey(item.label);
      const itemHrefSlug = toMatchKey(getHrefSlug(item.href));
      const aliases = entry.aliases.map(toMatchKey);

      const slugMatches = itemSlug === toMatchKey(entry.slug) || aliases.includes(itemSlug);
      const labelMatches = aliases.includes(itemLabel);
      const hrefMatches = aliases.includes(itemHrefSlug);

      if (entry.slug !== "home" && item.href === "/") {
        return false;
      }

      return slugMatches || labelMatches || hrefMatches;
    });

    if (matchingMenuItem) {
      usedKeys.add(usedItem(matchingMenuItem));

      const canonicalHref = entry.slug === "home"
        ? "/"
        : entry.categorySlug && categoryMap.has(entry.categorySlug)
          ? `/${entry.categorySlug}`
          : matchingMenuItem.href;

      return [{
        ...matchingMenuItem,
        href: canonicalHref,
        label: entry.label,
        slug: entry.slug,
      }];
    }

    if (entry.slug === "home") {
      return [{ label: entry.label, href: "/", slug: "home" }];
    }

    if (!entry.categorySlug) {
      return [];
    }

    const category = categoryMap.get(entry.categorySlug);
    if (!category) {
      return [];
    }

    return [{
      label: entry.label,
      href: `/${category.slug}`,
      slug: entry.slug,
    }];
  });
}

function resolveNavigationItems(
  menuItems: SiteNavigationItem[],
  categories: WordPressCategoryRaw[],
  activeSlug: string,
): SiteNavigationItem[] {
  const orderedItems = menuItems.length > 0
    ? buildPrimaryNavigation(menuItems, categories)
    : buildNavigationFromCategories(categories);

  return normalizeNavigationItems(orderedItems, activeSlug);
}

function isFeaturedMarker(value?: string): boolean {
  if (!value) {
    return false;
  }

  const normalized = toMatchKey(value).replace(/[-_]+/g, " ");
  return /\b(featured|headline|top|hlavny|hlavna|hlavne)\b/.test(normalized);
}

function resolveFeaturedPost(posts: SitePost[]): SitePost | null {
  if (posts.length === 0) {
    return null;
  }

  const featuredIndex = posts.findIndex((post) => isFeaturedMarker(post.highlightBadge) || isFeaturedMarker(post.articleType));
  return featuredIndex >= 0 ? posts[featuredIndex] : posts[0];
}

function getCategoryBySlug(categories: WordPressCategoryRaw[], slug: string): WordPressCategoryRaw | undefined {
  return categories.find((category) => category.slug === slug);
}

async function getCategoryPostsBySlug(
  categories: WordPressCategoryRaw[],
  slug: string,
  limit: number,
  { requireVideo = false }: { requireVideo?: boolean } = {},
): Promise<SitePost[]> {
  const category = getCategoryBySlug(categories, slug);
  if (!category) {
    return [];
  }

  const perPage = requireVideo ? Math.max(limit * 3, 12) : limit;
  const posts = await wpRestFetch<WordPressPostRaw[]>("posts", {
    query: {
      _embed: 1,
      per_page: perPage,
      orderby: "date",
      order: "desc",
      categories: category.id,
    },
    revalidate: 300,
    tags: ["wp-posts", `wp-category-posts-${slug}`],
  });

  const normalizedPosts = posts.map(normalizePost);
  if (!requireVideo) {
    return normalizedPosts.slice(0, limit);
  }

  return normalizedPosts
    .filter((post) => typeof post.videoEmbed === "string" && post.videoEmbed.trim() !== "")
    .slice(0, limit);
}

interface ApprovedCommentsQuery {
  postId?: number;
  page: number;
  perPage: number;
}

interface ApprovedCommentsRawResponse {
  comments: WordPressCommentRaw[];
  total: number;
  totalPages: number;
}

async function requestApprovedComments(query: ApprovedCommentsQuery): Promise<ApprovedCommentsRawResponse> {
  const { restUrl } = getWordPressConfig();
  const url = new URL(`${restUrl}/comments`);

  url.searchParams.set("status", "approve");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("page", String(query.page));
  url.searchParams.set("per_page", String(query.perPage));
  url.searchParams.set("_fields", "id,post,parent,date,date_gmt,status,author_name,author_url,content");

  if (query.postId) {
    url.searchParams.set("post", String(query.postId));
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 400 && query.page > 1) {
      return requestApprovedComments({
        ...query,
        page: 1,
      });
    }

    throw new Error(`WordPress REST request failed for comments: ${response.status}`);
  }

  const comments = await response.json() as WordPressCommentRaw[];
  const total = Number.parseInt(response.headers.get("x-wp-total") ?? "0", 10) || 0;
  const totalPages = Number.parseInt(response.headers.get("x-wp-totalpages") ?? "0", 10) || 0;

  return {
    comments,
    total,
    totalPages,
  };
}

function normalizeComment(comment: WordPressCommentRaw, postMap: Map<number, SitePost>): SiteComment {
  const relatedPost = postMap.get(comment.post);

  return {
    id: comment.id,
    postId: comment.post,
    parentId: comment.parent,
    authorName: stripHtml(comment.author_name || "Anonym"),
    authorUrl: comment.author_url?.trim() || undefined,
    contentHtml: comment.content?.rendered ?? "",
    excerpt: getCommentExcerpt(comment.content?.rendered ?? ""),
    dateIso: comment.date_gmt || comment.date,
    dateLabel: formatCommentDate(comment.date_gmt || comment.date),
    postTitle: relatedPost?.title,
    postHref: relatedPost?.href,
  };
}

async function getLatestPosts(limit: number): Promise<SitePost[]> {
  const posts = await wpRestFetch<WordPressPostRaw[]>("posts", {
    query: {
      _embed: 1,
      per_page: limit,
      orderby: "date",
      order: "desc",
    },
    revalidate: 300,
    tags: ["wp-posts"],
  });

  return posts.map(normalizePost);
}

async function getCategories(): Promise<WordPressCategoryRaw[]> {
  return wpRestFetch<WordPressCategoryRaw[]>("categories", {
    query: {
      per_page: 100,
      hide_empty: false,
    },
    revalidate: 300,
    tags: ["wp-categories"],
  });
}

async function getPrimaryMenuNavigation(): Promise<SiteNavigationItem[]> {
  const data = await wpGraphQLFetch<WordPressPrimaryMenuQueryResult>(`
    query GetPrimaryMenu {
      menuItems(where: { location: PRIMARY_MENU }) {
        nodes {
          id
          label
          path
          uri
          parentId
          target
          connectedNode {
            node {
              ... on Category {
                slug
                uri
              }
              ... on Page {
                slug
                uri
              }
              ... on Post {
                slug
                uri
              }
            }
          }
        }
      }
    }
  `);

  return (data.menuItems?.nodes ?? [])
    .filter((node) => !node.parentId)
    .map(normalizeMenuItem)
    .filter((item): item is SiteNavigationItem => Boolean(item));
}

export async function getNavigationItems(activeSlug = "home"): Promise<SiteNavigationItem[]> {
  try {
    const [menuItems, categories] = await Promise.all([
      getPrimaryMenuNavigation().catch(() => []),
      getCategories().catch(() => []),
    ]);
    return resolveNavigationItems(menuItems, categories, activeSlug);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<SitePost | null> {
  try {
    const posts = await wpRestFetch<WordPressPostRaw[]>("posts", {
      query: {
        slug,
        _embed: 1,
        per_page: 1,
      },
      revalidate: 300,
      tags: ["wp-posts", `wp-post-${slug}`],
    });

    return posts[0] ? normalizePost(posts[0]) : null;
  } catch {
    return null;
  }
}

export async function getPostsByIds(ids: number[]): Promise<SitePost[]> {
  if (ids.length === 0) {
    return [];
  }

  try {
    const posts = await wpRestFetch<WordPressPostRaw[]>("posts", {
      query: {
        include: ids.join(","),
        _embed: 1,
        per_page: ids.length,
        orderby: "include",
      },
      revalidate: 300,
      tags: ["wp-posts", ...ids.map((id) => `wp-post-id-${id}`)],
    });

    return posts.map(normalizePost);
  } catch {
    return [];
  }
}

export async function getCategoryPageData(slug: string): Promise<CategoryPageData | null> {
  try {
    const [categories, menuItems] = await Promise.all([
      getCategories(),
      getPrimaryMenuNavigation().catch(() => []),
    ]);
    const navigationItems = resolveNavigationItems(menuItems, categories, slug);

    const category = categories.find((item) => item.slug === slug);
    if (!category) {
      return null;
    }

    const posts = await wpRestFetch<WordPressPostRaw[]>("posts", {
      query: {
        _embed: 1,
        per_page: 12,
        categories: category.id,
      },
      revalidate: 300,
      tags: ["wp-posts", `wp-category-posts-${slug}`],
    });

    const normalizedPosts = posts.map(normalizePost);
    const filteredPosts = slug === "video"
      ? normalizedPosts.filter((post) => typeof post.videoEmbed === "string" && post.videoEmbed.trim() !== "")
      : normalizedPosts;

    return {
      category: normalizeCategory(category),
      posts: filteredPosts,
      navigationItems,
    };
  } catch {
    return null;
  }
}

export async function getApprovedCommentsPage({
  page = 1,
  perPage = 20,
  postId,
}: {
  page?: number;
  perPage?: number;
  postId?: number;
} = {}): Promise<SiteCommentsPageData> {
  const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;
  const normalizedPerPage = Number.isInteger(perPage) ? Math.min(Math.max(perPage, 1), 100) : 20;

  try {
    const response = await requestApprovedComments({
      page: normalizedPage,
      perPage: normalizedPerPage,
      postId,
    });

    const postIds = Array.from(new Set(response.comments.map((comment) => comment.post).filter((value) => value > 0)));
    const relatedPosts = postIds.length > 0 ? await getPostsByIds(postIds) : [];
    const postMap = new Map<number, SitePost>(relatedPosts.map((item) => [item.id, item]));
    const comments = response.comments.map((comment) => normalizeComment(comment, postMap));

    const totalPages = response.totalPages > 0 ? response.totalPages : (response.total > 0 ? 1 : 0);
    const currentPage = totalPages > 0 ? Math.min(normalizedPage, totalPages) : normalizedPage;

    return {
      comments,
      page: currentPage,
      perPage: normalizedPerPage,
      total: response.total,
      totalPages,
      hasNextPage: totalPages > 0 && currentPage < totalPages,
      hasPrevPage: currentPage > 1 && totalPages > 0,
    };
  } catch {
    return {
      comments: [],
      page: normalizedPage,
      perPage: normalizedPerPage,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

export async function getAllPublicSlugs(): Promise<string[]> {
  try {
    const [posts, categories] = await Promise.all([
      wpRestFetch<WordPressPostRaw[]>("posts", {
        query: { per_page: 100, _embed: 1 },
        revalidate: 300,
        tags: ["wp-posts"],
      }),
      getCategories(),
    ]);

    return Array.from(new Set([
      ...posts.map((post) => post.slug),
      ...categories.filter((category) => CATEGORY_SLUGS_FOR_SITEMAP.includes(category.slug)).map((category) => category.slug),
    ]));
  } catch {
    return [];
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const [posts, categories, menuItems, commentsPage] = await Promise.all([
      getLatestPosts(12),
      getCategories(),
      getPrimaryMenuNavigation().catch(() => []),
      getApprovedCommentsPage({ page: 1, perPage: 5 }),
    ]);
    const navigationItems = resolveNavigationItems(menuItems, categories, "home");

    const featuredPost = resolveFeaturedPost(posts);
    const latestPosts = posts
      .filter((post) => post.id !== featuredPost?.id)
      .slice(0, 6);

    const [domovPosts, zahraniciePosts, videoPosts, mostReadCandidates] = await Promise.all([
      getCategoryPostsBySlug(categories, "domov", 3),
      getCategoryPostsBySlug(categories, "zahranicie", 3),
      getCategoryPostsBySlug(categories, "video", 4, { requireVideo: true }),
      getCategoryPostsBySlug(categories, "najcitanejsie", 5),
    ]);

    const mostReadPosts = mostReadCandidates.length > 0
      ? mostReadCandidates
      : posts
        .filter((post) => post.id !== featuredPost?.id)
        .slice(0, 5);

    return {
      featuredPost,
      latestPosts,
      domovPosts,
      zahraniciePosts,
      mostReadPosts,
      videoPosts,
      recentComments: commentsPage.comments.slice(0, 5),
      navigationItems,
    };
  } catch {
    return {
      featuredPost: null,
      latestPosts: [],
      domovPosts: [],
      zahraniciePosts: [],
      mostReadPosts: [],
      videoPosts: [],
      recentComments: [],
      navigationItems: [],
    };
  }
}

export async function getPhotoArchivePosts(): Promise<SitePost[]> {
  try {
    const posts = await getAllPostsForArchive();

    return posts
      .map(normalizePost)
      .filter((post) => post.imageUrl !== FALLBACK_IMAGE)
      .sort((a, b) => a.title.localeCompare(b.title, "sk", { sensitivity: "base" }));
  } catch {
    return [];
  }
}
