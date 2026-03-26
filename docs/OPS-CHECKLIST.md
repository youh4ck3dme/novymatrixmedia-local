# OPS CHECKLIST

## Purpose

This is the operational checklist for deploy, smoke test, and incident-first debugging.

## Environment Baseline

Expected frontend env:

- `NEXT_PUBLIC_WP_URL=https://info.novymatrixmedia.sk`
- `NEXT_PUBLIC_API_URL=https://info.novymatrixmedia.sk/wp-json/wp/v2`
- `NEXT_PUBLIC_GRAPHQL_URL=https://info.novymatrixmedia.sk/graphql`
- `NEXT_PUBLIC_SITE_URL=https://novymatrixmedia.sk`
- `REVALIDATE_SECRET=<must match WordPress>`

Reference file:

- `nmm-pwa/.env.example`

## Before Deploy

1. Confirm changes intended for production are on the production branch.
2. Confirm no secrets or pulled Vercel exports are staged.
3. Confirm environment variables still match the CMS and frontend domain split.
4. Confirm WordPress config still points revalidation to the correct production frontend URL.

## Production Deploy Checks

1. Vercel project root must be `nmm-pwa`.
2. Production must deploy from the branch intended to serve `novymatrixmedia.sk`.
3. If Google web verification is being tested, ensure the active production deploy contains:
   - `nmm-pwa/src/app/layout.tsx`
   - `nmm-pwa/public/google2e037b48f21a0d2d.html`
4. Run automated smoke test before and after release:
   - `cd nmm-pwa`
   - `npm run test:smoke -- --base https://novymatrixmedia.sk`

## Smoke Test

### Publish And Revalidate

1. Publish or update a test post in WordPress.
2. Confirm the post exists in WordPress REST.
3. Confirm the public article updates on frontend after normal revalidation delay.

### Homepage

1. Open the homepage.
2. Confirm featured block renders.
3. Confirm latest posts section renders.
4. Confirm Domov, Zahranicie, Najcitanejsie blocks render.
5. Confirm Video block renders expected content.
6. Confirm Reakcie block renders approved comments.

### Article

1. Open a fresh article.
2. Confirm title, content, image, metadata, and related content.
3. If article has `nmm_video_embed`, confirm media renders.

### Comments

1. Submit a visitor comment through frontend.
2. Confirm it lands in WordPress moderation.
3. Approve the comment.
4. Confirm it appears under the article and on `/reakcie`.

## Fast Incident Checks

### Article Not Showing

1. Check WordPress status and slug.
2. Check REST response on the CMS domain.
3. Check revalidation secret match.
4. Check active production deploy.

### Image Fallback Problem

1. Check featured image in WordPress.
2. Check public image fields in API.
3. Check frontend deploy freshness.

### Video Problem

1. Check `nmm_video_embed` value.
2. Check article route parsing in `nmm-pwa/src/app/[slug]/page.tsx`.
3. Check filtering in `nmm-pwa/src/lib/wp-queries.ts`.

### Comment Submit Problem

1. Check request validation in `nmm-pwa/src/app/api/comments/route.ts`.
2. Check WordPress comments endpoint availability.
3. Check app password env only if proxy auth is configured.
4. Check moderation status in WordPress.

## Rollback Playbook (Low Risk)

1. Before release, keep previous successful Vercel deployment ID ready.
2. If production smoke test fails, rollback immediately to previous deployment.
3. Re-run `npm run test:smoke -- --base https://novymatrixmedia.sk` after rollback.
4. Freeze further production deploys until preview smoke test is green again.

## Useful Technical Endpoints

- WordPress REST posts:
  - `https://info.novymatrixmedia.sk/wp-json/wp/v2/posts?per_page=3&_embed`
- WordPress GraphQL:
  - `https://info.novymatrixmedia.sk/graphql`
- Frontend env diagnostics:
  - `/api/env-check?secret=<secret>`

## Operational Warnings

- Do not debug production with localhost assumptions.
- Do not change both WordPress and frontend logic at once during incident handling.
- Do not treat preview Vercel deployments as proof of production state.

## Related Docs

- `docs/PROJECT-HANDOFF.md`
- `docs/SYSTEM-MAP.md`
- `docs/SECURITY-NOTES.md`
