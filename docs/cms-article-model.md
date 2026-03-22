# CMS Article Model

## Built-in WordPress fields

- `title`
- `excerpt`
- `content`
- `category`
- `tags`
- `publish_date`
- `updated_date`
- `featured_image`

## Custom editorial fields

These are available in the `Novy Matrix Media Editorial Fields` box on post edit screens.

- `nmm_subtitle`
- `nmm_author_name`
- `nmm_source_name`
- `nmm_source_url`
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
- `nmm_seo_title`
- `nmm_seo_description`
- `nmm_og_title`
- `nmm_og_description`
- `nmm_og_image`

## Frontend usage

- `subtitle`: context line under headline
- `highlight_badge`: top badge above the article title
- `estimated_reading_time`: shown in the article meta row
- `fact_box`: rendered as the `Co je dolezite vediet` block
- `quote_block`: rendered as a large editorial quote block
- `related_posts`: comma-separated WordPress post IDs for explicit related content
- `source_name` and `source_url`: used in the image/source caption area
- `seo_*` and `og_*`: used for page metadata overrides in Next.js

## Media field format

- `nmm_gallery`: one image per line, format `image-url | optional caption | optional alt`
- `nmm_video_embed`: accepts YouTube/Vimeo URL, iframe embed code, or direct `.mp4/.webm/.ogg` file URL