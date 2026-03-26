export interface WordPressRenderedField {
  rendered: string;
}

export interface WordPressCategoryRaw {
  id: number;
  slug: string;
  name: string;
  link: string;
  description?: string;
  taxonomy?: string;
}

export interface WordPressEditorialMetaRaw {
  nmm_subtitle?: string;
  nmm_author_name?: string;
  nmm_source_name?: string;
  nmm_source_url?: string;
  nmm_sources?: string;
  nmm_featured_image_alt?: string;
  nmm_featured_image_caption?: string;
  nmm_gallery?: string;
  nmm_video_embed?: string;
  nmm_article_type?: string;
  nmm_highlight_badge?: string;
  nmm_estimated_reading_time?: string;
  nmm_fact_box?: string;
  nmm_related_posts?: string;
  nmm_quote_block?: string;
  nmm_seo_title?: string;
  nmm_seo_description?: string;
  nmm_og_title?: string;
  nmm_og_description?: string;
  nmm_og_image?: string;
  nmm_editorial_readiness?: string;
  nmm_telegram_message_id?: string;
  nmm_telegram_chat_id?: string;
  nmm_telegram_chat_title?: string;
  nmm_telegram_author?: string;
  nmm_telegram_permalink?: string;
  nmm_ingest_source?: string;
}

export interface WordPressMediaRaw {
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url: string; width?: number; height?: number }>;
  };
}

export interface WordPressPostRaw {
  id: number;
  slug: string;
  link: string;
  date: string;
  modified: string;
  title: WordPressRenderedField;
  excerpt: WordPressRenderedField;
  content?: WordPressRenderedField;
  yoast_head_json?: {
    title?: string;
    description?: string;
  };
  meta?: WordPressEditorialMetaRaw;
  nmm_featured_image_url?: string;
  nmm_featured_image_alt_public?: string;
  nmm_featured_image_caption_public?: string;
  _embedded?: {
    "wp:featuredmedia"?: WordPressMediaRaw[];
    "wp:term"?: WordPressCategoryRaw[][];
  };
}

export interface WordPressCommentRaw {
  id: number;
  post: number;
  parent: number;
  date: string;
  date_gmt: string;
  status?: string;
  author_name: string;
  author_url?: string;
  content: WordPressRenderedField;
}

export interface SiteNavigationItem {
  label: string;
  href: string;
  slug: string;
  active?: boolean;
  isExternal?: boolean;
  target?: string | null;
}

export interface SitePostSource {
  name: string;
  url?: string;
}

export interface SitePost {
  id: number;
  slug: string;
  href: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  sourceName?: string;
  sourceUrl?: string;
  sources?: SitePostSource[];
  imageUrl: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  imageCaption?: string;
  categoryLabel: string;
  categorySlug: string;
  articleType?: string;
  highlightBadge?: string;
  estimatedReadingTime?: string;
  factBox?: string[];
  quoteBlock?: string;
  tagLabels?: string[];
  relatedPostIds?: number[];
  videoEmbed?: string;
  gallery?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  editorialReadiness?: string;
  ingestSource?: string;
  telegramMessageId?: string;
  telegramChatId?: string;
  telegramChatTitle?: string;
  telegramAuthor?: string;
  telegramPermalink?: string;
}

export interface SiteCategory {
  id: number;
  slug: string;
  name: string;
  href: string;
  description: string;
}

export interface SiteComment {
  id: number;
  postId: number;
  parentId: number;
  authorName: string;
  authorUrl?: string;
  contentHtml: string;
  excerpt: string;
  dateIso: string;
  dateLabel: string;
  postTitle?: string;
  postHref?: string;
}

export interface SiteCommentsPageData {
  comments: SiteComment[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface HomePageData {
  featuredPost: SitePost | null;
  latestPosts: SitePost[];
  domovPosts: SitePost[];
  zahraniciePosts: SitePost[];
  mostReadPosts: SitePost[];
  videoPosts: SitePost[];
  recentComments: SiteComment[];
  navigationItems: SiteNavigationItem[];
}

export interface CategoryPageData {
  category: SiteCategory;
  posts: SitePost[];
  navigationItems: SiteNavigationItem[];
}
