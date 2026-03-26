# PROJECT HANDOFF

## Purpose

This is the primary handoff document for the current Novy Matrix Media stack.
Read this first when you need to understand what is live, where the source of truth is, and which files control the critical flows.

## Current State

- CMS and API run on `https://info.novymatrixmedia.sk`.
- Public frontend runs from `nmm-pwa` on `https://novymatrixmedia.sk` through Vercel.
- Content source of truth is WordPress.
- Rendering source of truth is Next.js in `nmm-pwa`.
- Comments are stored and moderated in WordPress.
- Publish and update propagation uses on-demand revalidation.
- Production branch is expected to be `master`.

## System Boundary

- WordPress admin, REST, GraphQL, media, comments:
  - `wp-content/mu-plugins/nmm-editorial-fields.php`
  - `wp-content/mu-plugins/nmm-comments-moderation.php`
  - `wp-content/mu-plugins/nmm-headless-routing.php`
  - `wp-content/mu-plugins/nmm-revalidate.php`
- Next.js frontend and API layer:
  - `nmm-pwa/src/app/page.tsx`
  - `nmm-pwa/src/app/[slug]/page.tsx`
  - `nmm-pwa/src/components/MatrixHero.tsx`
  - `nmm-pwa/src/components/ArticleComments.tsx`
  - `nmm-pwa/src/app/api/comments/route.ts`
  - `nmm-pwa/src/app/api/revalidate/route.ts`
  - `nmm-pwa/src/app/api/env-check/route.ts`
  - `nmm-pwa/src/lib/wp-client.ts`
  - `nmm-pwa/src/lib/wp-rest.ts`
  - `nmm-pwa/src/lib/wp-graphql.ts`
  - `nmm-pwa/src/lib/wp-queries.ts`

## Source Of Truth

- Posts, categories, featured media, editorial fields, comment status:
  - WordPress
- Homepage composition, article rendering, category rendering, cache tags:
  - Next.js
- Revalidation secret pair:
  - `REVALIDATE_SECRET` in Vercel
  - `NMM_REVALIDATE_SECRET` in WordPress config

If frontend output conflicts with WordPress data, debug WordPress and API payload first.

## Main Flows

### Publish Flow

1. Editor publishes or updates a post in WordPress.
2. `wp-content/mu-plugins/nmm-revalidate.php` sends POST to Next route `/api/revalidate`.
3. `nmm-pwa/src/app/api/revalidate/route.ts` revalidates `wp-*` tags.
4. Next request rebuilds affected article, homepage blocks, and category blocks.

### Homepage Flow

1. `nmm-pwa/src/app/page.tsx` calls `getHomePageData()`.
2. `nmm-pwa/src/lib/wp-queries.ts` loads latest posts, categories, menu, comments.
3. `nmm-pwa/src/components/MatrixHero.tsx` renders featured, latest, section columns, video, and reactions.

### Article Flow

1. `nmm-pwa/src/app/[slug]/page.tsx` resolves whether slug is a category page or article page.
2. Article data is normalized in `nmm-pwa/src/lib/wp-queries.ts`.
3. Video, gallery, metadata, and comments are rendered from normalized data.

### Comments Flow

1. Visitor submits through frontend form.
2. `nmm-pwa/src/app/api/comments/route.ts` validates request and forwards to WordPress comments endpoint.
3. `wp-content/mu-plugins/nmm-comments-moderation.php` forces moderation for visitor comments.
4. Only approved comments are visible under the article and on `/reakcie`.

## Environment

Expected frontend environment:

- `NEXT_PUBLIC_WP_URL=https://info.novymatrixmedia.sk`
- `NEXT_PUBLIC_API_URL=https://info.novymatrixmedia.sk/wp-json/wp/v2`
- `NEXT_PUBLIC_GRAPHQL_URL=https://info.novymatrixmedia.sk/graphql`
- `NEXT_PUBLIC_SITE_URL=https://novymatrixmedia.sk`
- `REVALIDATE_SECRET=<same value as WordPress NMM_REVALIDATE_SECRET>`

Template file:

- `nmm-pwa/.env.example`

Ignored sensitive files:

- `.env`
- `.env.local`
- `.env.production`
- `.env.vercel`
- `wp-config.php`
- `wp-config-production.php`

## Google Search Console

Web verification is present in source in both places:

- `nmm-pwa/src/app/layout.tsx`
- `nmm-pwa/public/google2e037b48f21a0d2d.html`

Important:

- DNS verification is independent from Vercel deploy.
- Meta tag and static HTML verification require the active production deployment to contain the changes.

## Debug Flow

### Article Not Showing

1. Confirm post is `publish` in WordPress.
2. Confirm slug exists in `https://info.novymatrixmedia.sk/wp-json/wp/v2/posts?slug=<slug>&_embed`.
3. Confirm `nmm-pwa/src/app/[slug]/page.tsx` resolves the slug as article and not category mismatch.
4. Trigger or inspect revalidation path in `wp-content/mu-plugins/nmm-revalidate.php` and `nmm-pwa/src/app/api/revalidate/route.ts`.
5. If API is correct but output is stale, check active production deploy and cache mismatch.

### Image Fallback Showing

1. Confirm featured image is set in WordPress post editor.
2. Confirm public REST fields from `wp-content/mu-plugins/nmm-editorial-fields.php` exist in API response.
3. Confirm `normalizePost()` in `nmm-pwa/src/lib/wp-queries.ts` is receiving image data.
4. If API is correct but frontend still shows fallback, check deploy mismatch before changing code.

### Video Not Showing

1. Confirm `nmm_video_embed` has a supported value in WordPress.
2. Confirm post category and video metadata match the intended listing rule.
3. Check parsing logic in `nmm-pwa/src/app/[slug]/page.tsx`.
4. Check category or homepage filtering in `nmm-pwa/src/lib/wp-queries.ts`.

### Comment Submission Failure

1. Confirm request reaches `nmm-pwa/src/app/api/comments/route.ts`.
2. Check validation failure: name, email, content, honeypot, minimum fill time.
3. Confirm WordPress comments endpoint is reachable from configured REST URL.
4. Confirm optional app password env is valid if proxy auth is used.
5. Confirm comment landed in WordPress as pending or approved.

## Operational Rules

- Do not commit secrets, pulled Vercel exports, or WordPress config secrets.
- Do not treat preview deploys as production verification.
- Do not change WordPress editorial field names without updating frontend normalization.
- Do not change comment moderation policy casually; current behavior is intentional.

## Canonical Docs

- `docs/SYSTEM-MAP.md`
- `docs/EDITOR-GUIDE.md`
- `docs/OPS-CHECKLIST.md`
- `docs/SECURITY-NOTES.md`
- `docs/CHANGELOG-CURRENT.md`

Use these as the current documentation set. Older overlapping docs below now serve only as redirect notes.
