# SYSTEM MAP

## Runtime Topology

- WordPress CMS/API: `https://info.novymatrixmedia.sk`
- Next.js frontend: `https://novymatrixmedia.sk`
- Frontend project root: `nmm-pwa`
- WordPress MU plugins:
  - `wp-content/mu-plugins/nmm-editorial-fields.php`
  - `wp-content/mu-plugins/nmm-comments-moderation.php`
  - `wp-content/mu-plugins/nmm-headless-routing.php`
  - `wp-content/mu-plugins/nmm-revalidate.php`

## API Endpoints Used By Frontend

- WordPress REST base:
  - `https://info.novymatrixmedia.sk/wp-json/wp/v2`
- WordPress GraphQL:
  - `https://info.novymatrixmedia.sk/graphql`
- Frontend server routes:
  - `/api/comments`
  - `/api/revalidate`
  - `/api/search`
  - `/api/env-check`

## Data Flow

### Posts

1. Editor stores content in WordPress.
2. Frontend reads via `src/lib/wp-queries.ts`.
3. `normalizePost()` maps REST payload to `SitePost` model.
4. UI renders via `FeaturedPost`, `PostCard`, detail page and section blocks.

### Comments

1. Visitor submits via `ArticleComments` form.
2. Frontend posts to `/api/comments`.
3. API validates input, anti-spam checks, then forwards to WordPress comments endpoint.
4. MU moderation guard keeps visitor comment pending until manual approve.
5. Approved comments are shown under article and on `/reakcie`.

## NMM Editorial Meta Fields

Primary fields used in UI/query mapping:

- `nmm_subtitle`
- `nmm_author_name`
- `nmm_source_name`
- `nmm_source_url`
- `nmm_sources`
- `nmm_featured_image_alt`
- `nmm_featured_image_caption`
- `nmm_gallery`
- `nmm_video_embed`
- `nmm_article_type`
- `nmm_highlight_badge`
- `nmm_estimated_reading_time`
- `nmm_fact_box`
- `nmm_related_posts`
- `nmm_quote_block`
- `nmm_conclusion_number`
- `nmm_conclusion_text`
- `nmm_editorial_readiness`
- `nmm_seo_title`
- `nmm_seo_description`
- `nmm_og_title`
- `nmm_og_description`
- `nmm_og_image`

Public featured image REST fields:

- `nmm_featured_image_url`
- `nmm_featured_image_alt_public`
- `nmm_featured_image_caption_public`

## Fallback Rules (Current)

- Excerpt: generated from first text if excerpt is empty.
- SEO title/description: filled from title and excerpt if empty.
- OG title/description: fallback to SEO values if empty.
- Reading time: computed from content word count if empty.
- Article type: auto-detected from category/video URL if empty.
- Featured image: uses `nmm_featured_image_url` or WP media; fallback image only if nothing exists.
- `/video` listing: only posts with non-empty `nmm_video_embed`.

## Source Of Truth

- Content, categories, media, comments and editorial meta: WordPress.
- Routing, rendering and listing composition: Next.js frontend.
- If data conflicts, debug WordPress payload first, then frontend mapper.
