export interface WordPressRenderedField {
  rendered: string;
}

export interface WordPressCategoryRaw {
  id: number;
  slug: string;
  name: string;
  link: string;
}

export interface WordPressMediaRaw {
  source_url: string;
  alt_text: string;
}

export interface WordPressPostRaw {
  id: number;
  slug: string;
  link: string;
  date: string;
  modified: string;
  title: WordPressRenderedField;
  excerpt: WordPressRenderedField;
  yoast_head_json?: {
    title?: string;
    description?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: WordPressMediaRaw[];
    "wp:term"?: WordPressCategoryRaw[][];
  };
}

export interface SiteNavigationItem {
  label: string;
  href: string;
  slug: string;
  active?: boolean;
}

export interface SitePost {
  id: number;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  imageUrl: string;
  imageAlt: string;
  categoryLabel: string;
  categorySlug: string;
}

export interface HomePageData {
  featuredPost: SitePost;
  secondaryPosts: SitePost[];
  sidebarPosts: SitePost[];
  navigationItems: SiteNavigationItem[];
}