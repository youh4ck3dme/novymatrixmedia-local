import { getWordPressConfig, shouldUseWordPressFallback } from "@/lib/wp-client";
import { wpRestFetch } from "@/lib/wp-rest";
import type { HomePageData, SiteNavigationItem, SitePost, WordPressCategoryRaw, WordPressPostRaw } from "@/types/wordpress";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop";

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

function normalizePost(post: WordPressPostRaw): SitePost {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const category = post._embedded?.["wp:term"]?.flat().find((term) => typeof term.slug === "string");

  return {
    id: post.id,
    slug: post.slug,
    href: post.link,
    title: stripHtml(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    publishedAt: formatDate(post.date),
    imageUrl: featuredMedia?.source_url ?? FALLBACK_IMAGE,
    imageAlt: featuredMedia?.alt_text || stripHtml(post.title.rendered),
    categoryLabel: category?.name ?? "Novy Matrix Media",
    categorySlug: category?.slug ?? "novy-matrix-media",
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
        href: category.link,
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

async function getNavigationCategories(): Promise<SiteNavigationItem[]> {
  const categories = await wpRestFetch<WordPressCategoryRaw[]>("categories", {
    query: {
      per_page: 100,
      hide_empty: false,
    },
    revalidate: 300,
    tags: ["wp-categories"],
  });

  return buildNavigation(categories);
}

export async function getHomePageData(): Promise<HomePageData> {
  const config = getWordPressConfig();

  if (shouldUseWordPressFallback(config)) {
    return FALLBACK_HOME_PAGE_DATA;
  }

  try {
    const [posts, navigationItems] = await Promise.all([
      getLatestPosts(6),
      getNavigationCategories(),
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