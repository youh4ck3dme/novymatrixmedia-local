# SECURITY NOTES

## Purpose

This document records the current security-sensitive parts of the project and the rules for handling them.

## Never Commit

- `.env`
- `.env.local`
- `.env.production`
- `.env.vercel`
- `wp-config.php`
- `wp-config-production.php`
- WordPress application passwords
- Vercel tokens or pulled environment exports with secrets
- ad hoc reset scripts containing credentials

Ignore rules are enforced in:

- `.gitignore`

## Current Sensitive Config Areas

### Frontend Secrets

- `REVALIDATE_SECRET`
- optional comment proxy credentials:
  - `WP_COMMENT_APP_USER`
  - `WP_COMMENT_APP_PASSWORD`
  - `WP_APP_USER`
  - `WP_APP_PASSWORD`
  - `WORDPRESS_APP_USER`
  - `WORDPRESS_APP_PASSWORD`

### WordPress Secrets

- `NMM_REVALIDATE_SECRET`
- any application password used by integrations
- admin credentials
- database credentials in WordPress config

## Storage Rule

Secrets belong in:

- Vercel environment variables
- server-side WordPress config
- password manager

Secrets do not belong in:

- repository files
- docs
- screenshots
- temporary helper scripts committed to git

## Current Risk Notes

- A pulled `.env.vercel` file existed during this work and is now ignored. Do not reintroduce tokens into git.
- Google Search Console verification files are safe to commit. Secrets are not.
- Public comment submission is intentionally enabled, so moderation and abuse monitoring matter.

## Comments Surface

Relevant implementation:

- `nmm-pwa/src/app/api/comments/route.ts`
- `wp-content/mu-plugins/nmm-comments-moderation.php`

Security posture:

- anonymous comment submit allowed
- basic spam friction present through validation, honeypot, and minimum fill time
- moderation enforced before public visibility

## Revalidation Surface

Relevant implementation:

- `wp-content/mu-plugins/nmm-revalidate.php`
- `nmm-pwa/src/app/api/revalidate/route.ts`

Rule:

- the secret must match exactly on both sides
- any mismatch creates failed invalidation and stale content

## Rotation Guidance

Rotate immediately if any of these happened:

1. a token or app password was committed
2. a screenshot or message exposed a secret value
3. unknown systems are posting to revalidation or comment surfaces

After rotation:

1. update Vercel env
2. update WordPress config or app password holder
3. redeploy frontend if needed
4. re-test publish and comments flow

## Minimal Audit Checklist

1. inspect `.gitignore`
2. inspect staged files for secrets
3. confirm production env matches intended domain split
4. confirm no reset helper scripts remain on the server after use

## Related Docs

- `docs/PROJECT-HANDOFF.md`
- `docs/OPS-CHECKLIST.md`
