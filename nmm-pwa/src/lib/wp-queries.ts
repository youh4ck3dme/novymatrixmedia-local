import { getWordPressConfig, shouldUseWordPressFallback } from "@/lib/wp-client";
import { wpGraphQLFetch } from "@/lib/wp-graphql";
import { wpRestFetch } from "@/lib/wp-rest";
import type { CategoryPageData, HomePageData, SiteCategory, SiteNavigationItem, SitePost, WordPressCategoryRaw, WordPressEditorialMetaRaw, WordPressPostRaw } from "@/types/wordpress";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop";
const KNOWN_CATEGORY_SLUGS = new Set(["politika", "zahranicie", "komentare", "diskusia", "domov"]);
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://novymatrixmedia.sk").replace(/\/$/, "");

const FALLBACK_HOME_PAGE_DATA: HomePageData = {
  featuredPost: {
    id: 1,
    slug: "novy-matrix-media-featured",
    href: "/",
    title: "Kritické udalosti bez šumu. Novy Matrix Media sleduje domov, geopolitiku aj energetickú bezpečnosť v jednom prúde.",
    excerpt: "Výber najdôležitejších tém, komentárov a rýchlych správ v modernej matrix vizualite. Menej balastu, viac podstatných informácií a okamžitý prehľad o tom, čo hýbe Slovenskom aj zahraničím.",
    publishedAt: "22. MAR 2026",
    imageUrl: FALLBACK_IMAGE,
    imageAlt: "Novy Matrix Media featured story",
    categoryLabel: "Diskusia",
    categorySlug: "diskusia",
  },
  secondaryPosts: [
    {
      id: 2,
      slug: "dasko-toporce",
      href: "/",
      title: "Daško: V Toporci pomáhajú ľuďom zvládať dlhy, výsledkom sú desiatky stabilizovaných domácností.",
      excerpt: "Z domova",
      publishedAt: "20. MAR 2026",
      imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&auto=format&fit=crop",
      imageAlt: "Z domova",
      categoryLabel: "Z Domova",
      categorySlug: "domov",
    },
    {
      id: 3,
      slug: "iran-energia",
      href: "/",
      title: "Vojna USA a Izraela proti Iránu by znamenala tlak na ceny energií, dopravu aj stabilitu regiónu.",
      excerpt: "Zahraničie",
      publishedAt: "2. MAR 2026",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
      imageAlt: "Zahraničie",
      categoryLabel: "Zahraničie",
      categorySlug: "zahranicie",
    },
  ],
  sidebarPosts: [
    {
      id: 4,
      slug: "lokalne-iniciativy",
      href: "/",
      title: "Regióny, sociálne témy a lokálne iniciatívy, ktoré menia reálny život ľudí.",
      excerpt: "Diskusia :: Z Domova",
      publishedAt: "22. MAR 2026",
      imageUrl: FALLBACK_IMAGE,
      imageAlt: "Lokálne iniciatívy",
      categoryLabel: "Diskusia :: Z Domova",
      categorySlug: "diskusia",
    },
    {
      id: 5,
      slug: "hormuzsky-prieliv",
      href: "/",
      title: "Uzavretie Hormuzského prielivu by priamo ohrozilo energetickú bezpečnosť SR.",
      excerpt: "Featured :: Komentár",
      publishedAt: "22. MAR 2026",
      imageUrl: FALLBACK_IMAGE,
      imageAlt: "Hormuzsky prieliv",
      categoryLabel: "Featured :: Komentár",
      categorySlug: "komentare",
    },
    {
      id: 6,
      slug: "geopoliticky-vyber",
      href: "/",
      title: "Rýchly prehľad vybraných vyjadrení, reakcií a sporov, ktoré formujú verejný priestor.",
      excerpt: "Geopolitika :: Výber",
      publishedAt: "22. MAR 2026",
      imageUrl: FALLBACK_IMAGE,
      imageAlt: "Geopolitika",
      categoryLabel: "Geopolitika :: Výber",
      categorySlug: "zahranicie",
    },
  ],
  navigationItems: [
    { label: "Domov", href: "/", slug: "domov", active: true },
    { label: "Politika", href: "/politika", slug: "politika" },
    { label: "Zahraničie", href: "/zahranicie", slug: "zahranicie" },
    { label: "Komentáre", href: "/komentare", slug: "komentare" },
  ],
};

const MENU_CATEGORY_SLUGS = ["politika", "zahranicie", "komentare", "diskusia"];

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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).toUpperCase();
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

function getTagLabels(post: WordPressPostRaw): string[] {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];

  return terms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => term.name)
    .filter(Boolean);
}

function normalizeEditorialMeta(meta?: WordPressEditorialMetaRaw) {
  return {
    subtitle: meta?.nmm_subtitle ? stripHtml(meta.nmm_subtitle) : undefined,
    authorName: meta?.nmm_author_name ? stripHtml(meta.nmm_author_name) : undefined,
    sourceName: meta?.nmm_source_name ? stripHtml(meta.nmm_source_name) : undefined,
    sourceUrl: meta?.nmm_source_url?.trim() || undefined,
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
    sourceName: editorialMeta.sourceName,
    sourceUrl: editorialMeta.sourceUrl,
    imageUrl: featuredMedia?.source_url ?? FALLBACK_IMAGE,
    imageAlt: editorialMeta.imageAlt || featuredMedia?.alt_text || stripHtml(post.title.rendered),
    imageCaption: editorialMeta.imageCaption,
    categoryLabel: category?.name ?? "Novy Matrix Media",
    categorySlug: category?.slug ?? "novy-matrix-media",
    articleType: editorialMeta.articleType,
    highlightBadge: editorialMeta.highlightBadge,
    estimatedReadingTime: editorialMeta.estimatedReadingTime,
    factBox: editorialMeta.factBox,
    quoteBlock: editorialMeta.quoteBlock,
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
    return "domov";
  }

  const [firstSegment] = path.replace(/^\/+/, "").split("/");
  return firstSegment || "domov";
}

function normalizeNavigationItems(items: SiteNavigationItem[], activeSlug = "domov"): SiteNavigationItem[] {
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

function buildNavigation(categories: WordPressCategoryRaw[]): SiteNavigationItem[] {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return [
    { label: "Domov", href: "/", slug: "domov", active: true },
    ...MENU_CATEGORY_SLUGS.flatMap((slug) => {
      const category = categoryMap.get(slug);
      if (!category) {
        return [];
      }

      return [{
        label: category.name,
        href: `/${category.slug}`,
        slug: category.slug,
      }];
    }),
  ];
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

async function getNavigationCategories(): Promise<SiteNavigationItem[]> {
  const categories = await getCategories();

  return buildNavigation(categories);
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

export async function getNavigationItems(activeSlug = "domov"): Promise<SiteNavigationItem[]> {
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return normalizeNavigationItems(FALLBACK_HOME_PAGE_DATA.navigationItems, activeSlug);
  }

  try {
    const menuItems = await getPrimaryMenuNavigation();
    const navigationItems = menuItems.length > 0 ? menuItems : await getNavigationCategories();
    return normalizeNavigationItems(navigationItems, activeSlug);
  } catch {
    try {
      return normalizeNavigationItems(await getNavigationCategories(), activeSlug);
    } catch {
      return normalizeNavigationItems(FALLBACK_HOME_PAGE_DATA.navigationItems, activeSlug);
    }
  }
}

function getFallbackPostBySlug(slug: string): SitePost | null {
  const fallbackPosts = [
    FALLBACK_HOME_PAGE_DATA.featuredPost,
    ...FALLBACK_HOME_PAGE_DATA.secondaryPosts,
    ...FALLBACK_HOME_PAGE_DATA.sidebarPosts,
  ];

  return fallbackPosts.find((post) => post.slug === slug) ?? null;
}

function getFallbackCategoryBySlug(slug: string): SiteCategory | null {
  if (!KNOWN_CATEGORY_SLUGS.has(slug)) {
    return null;
  }

  return {
    id: 0,
    slug,
    name: slug === "domov" ? "Domov" : slug.charAt(0).toUpperCase() + slug.slice(1),
    href: `/${slug}`,
    description: "Výber článkov a komentárov z kategórie Novy Matrix Media.",
  };
}

function getFallbackCategoryPageData(slug: string): CategoryPageData | null {
  const category = getFallbackCategoryBySlug(slug);
  if (!category) {
    return null;
  }

  const posts = [
    FALLBACK_HOME_PAGE_DATA.featuredPost,
    ...FALLBACK_HOME_PAGE_DATA.secondaryPosts,
    ...FALLBACK_HOME_PAGE_DATA.sidebarPosts,
  ].filter((post) => slug === "domov" || post.categorySlug === slug);

  return {
    category,
    posts: posts.length > 0 ? posts : [FALLBACK_HOME_PAGE_DATA.featuredPost],
    navigationItems: normalizeNavigationItems(FALLBACK_HOME_PAGE_DATA.navigationItems, slug),
  };
}

export async function getPostBySlug(slug: string): Promise<SitePost | null> {
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return getFallbackPostBySlug(slug);
  }

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
    return getFallbackPostBySlug(slug);
  }
}

export async function getPostsByIds(ids: number[]): Promise<SitePost[]> {
  if (ids.length === 0) {
    return [];
  }

  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    const fallbackPosts = [
      FALLBACK_HOME_PAGE_DATA.featuredPost,
      ...FALLBACK_HOME_PAGE_DATA.secondaryPosts,
      ...FALLBACK_HOME_PAGE_DATA.sidebarPosts,
    ];

    return ids
      .map((id) => fallbackPosts.find((post) => post.id === id))
      .filter((post): post is SitePost => Boolean(post));
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
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return getFallbackCategoryPageData(slug);
  }

  try {
    const [categories, posts, navigationItems] = await Promise.all([
      wpRestFetch<WordPressCategoryRaw[]>("categories", {
        query: {
          slug,
          hide_empty: false,
        },
        revalidate: 300,
        tags: ["wp-categories", `wp-category-${slug}`],
      }),
      wpRestFetch<WordPressPostRaw[]>("posts", {
        query: {
          _embed: 1,
          per_page: 12,
          categories: slug,
        },
        revalidate: 300,
        tags: ["wp-posts", `wp-category-posts-${slug}`],
      }).catch(async () => {
        const categoryMatch = await wpRestFetch<WordPressCategoryRaw[]>("categories", {
          query: { slug, hide_empty: false },
          revalidate: 300,
          tags: ["wp-categories", `wp-category-${slug}`],
        });
        const categoryId = categoryMatch[0]?.id;

        if (!categoryId) {
          return [];
        }

        return wpRestFetch<WordPressPostRaw[]>("posts", {
          query: {
            _embed: 1,
            per_page: 12,
            categories: categoryId,
          },
          revalidate: 300,
          tags: ["wp-posts", `wp-category-posts-${slug}`],
        });
      }),
      getNavigationItems(slug),
    ]);

    const category = categories[0];
    if (!category) {
      return getFallbackCategoryPageData(slug);
    }

    return {
      category: normalizeCategory(category),
      posts: posts.map(normalizePost),
      navigationItems,
    };
  } catch {
    return getFallbackCategoryPageData(slug);
  }
}

export async function getAllPublicSlugs(): Promise<string[]> {
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return Array.from(
      new Set([
        ...FALLBACK_HOME_PAGE_DATA.navigationItems.map((item) => item.slug).filter((slug) => slug !== "domov"),
        FALLBACK_HOME_PAGE_DATA.featuredPost.slug,
        ...FALLBACK_HOME_PAGE_DATA.secondaryPosts.map((post) => post.slug),
        ...FALLBACK_HOME_PAGE_DATA.sidebarPosts.map((post) => post.slug),
      ]),
    );
  }

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
      ...categories.filter((category) => MENU_CATEGORY_SLUGS.includes(category.slug)).map((category) => category.slug),
    ]));
  } catch {
    return [];
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return FALLBACK_HOME_PAGE_DATA;
  }

  try {
    const [posts, navigationItems] = await Promise.all([
      getLatestPosts(6),
      getNavigationItems("domov"),
    ]);

    if (posts.length < 3) {
      return FALLBACK_HOME_PAGE_DATA;
    }

    return {
      featuredPost: posts[0],
      secondaryPosts: posts.slice(1, 3),
      sidebarPosts: posts.slice(3, 6),
      navigationItems: navigationItems.length > 1 ? navigationItems : FALLBACK_HOME_PAGE_DATA.navigationItems,
    };
  } catch {
    return FALLBACK_HOME_PAGE_DATA;
  }
}