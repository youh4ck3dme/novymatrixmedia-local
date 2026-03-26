# EDITOR GUIDE

## Purpose

This document is for day-to-day editorial work and first-line troubleshooting.
It describes what the editor fills manually, what is generated automatically, and what to check when content does not appear correctly on the frontend.

## Where Editing Happens

- Main editing surface:
  - WordPress post editor on `https://info.novymatrixmedia.sk/wp-admin`
- Editorial field registration and fallback logic:
  - `wp-content/mu-plugins/nmm-editorial-fields.php`

## Manual Inputs The Editor Should Care About

Required or normal fields:

- Title
- Content
- Category
- Featured image

Optional but important fields:

- Excerpt
- `nmm_subtitle`
- `nmm_author_name`
- `nmm_source_name`
- `nmm_source_url`
- `nmm_video_embed`
- `nmm_highlight_badge`
- `nmm_fact_box`
- `nmm_quote_block`
- `nmm_related_posts`

## Fields Usually Safe To Leave Empty

These are designed to be auto-filled or derived when missing:

- `nmm_seo_title`
- `nmm_seo_description`
- `nmm_og_title`
- `nmm_og_description`
- `nmm_estimated_reading_time`
- `nmm_article_type`

Rule:

- manual values should not be overwritten by fallback generation

## Featured Image Rules

Preferred editorial behavior:

1. Always set a featured image in WordPress.
2. Add alt and caption data when relevant.
3. Treat fallback imagery as a last resort, not normal publishing.

Image data is exposed through:

- `wp-content/mu-plugins/nmm-editorial-fields.php`

Frontend reads it through:

- `nmm-pwa/src/lib/wp-queries.ts`

## Video Rules

If an article should behave as video content, fill:

- `nmm_video_embed`

Supported input formats are handled in:

- `nmm-pwa/src/app/[slug]/page.tsx`

Accepted practical inputs:

- YouTube URL
- Vimeo URL
- iframe snippet
- direct video file URL

## Comments Rules

Current public behavior:

- visitors can submit comments without login
- new visitor comments go to moderation
- only approved comments appear publicly

Implementation files:

- `nmm-pwa/src/app/api/comments/route.ts`
- `wp-content/mu-plugins/nmm-comments-moderation.php`
- `nmm-pwa/src/components/ArticleComments.tsx`

## Publish Checklist

Before pressing publish:

1. Confirm title is final.
2. Confirm category is correct.
3. Confirm featured image exists.
4. Confirm excerpt or perex is acceptable.
5. If it is a video article, fill `nmm_video_embed`.
6. If source attribution matters, fill `nmm_source_name` and `nmm_source_url`.

After publish:

1. Open the public article URL.
2. Confirm image, title, excerpt, and body look correct.
3. Confirm article appears in the right homepage or category block after revalidation delay.

## Debug Flow

### Article Not Showing On Frontend

1. Check the post status is `publish`.
2. Check slug and category in WordPress.
3. Check the REST response for the post at the CMS domain.
4. If the post exists in API but not on frontend, treat it as revalidation or deploy issue.

### Wrong Or Missing Image

1. Confirm featured image is attached in WordPress.
2. Confirm alt and caption if needed.
3. Check the REST response for public featured image fields.
4. If API is correct but frontend still shows fallback, escalate to frontend deploy check.

### Video Not Showing

1. Confirm `nmm_video_embed` is filled.
2. Confirm the pasted value is a supported video source.
3. If the detail page shows the article but no video, frontend parsing needs inspection.

### Comment Not Visible

1. Check whether the comment is still pending in WordPress.
2. Only approved comments appear publicly.
3. If approved comment still does not appear, check frontend comments route and cache.

## What Not To Change Casually

- editorial field names starting with `nmm_`
- category slugs relied on by homepage and routing
- comment moderation defaults
- revalidation secret mapping

## Related Docs

- `docs/PROJECT-HANDOFF.md`
- `docs/SYSTEM-MAP.md`
- `docs/OPS-CHECKLIST.md`
