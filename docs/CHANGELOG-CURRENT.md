# CHANGELOG CURRENT

## Purpose

This is the current-state changelog for the handoff period. It is not a full git history. It records the important functional and operational facts that matter right now.

## Current Phase Summary

- Environment documentation was aligned to the real architecture.
- Google Search Console verification was added to the frontend source.
- Documentation was consolidated into a canonical set under `docs/`.
- Duplicate operational explanations from older docs were reduced to pointers.

## Functional State Notes

### Environment Alignment

- `nmm-pwa/.env.example` now reflects the real split:
  - CMS and API on `info.novymatrixmedia.sk`
  - public site on `novymatrixmedia.sk`
- `.gitignore` includes `.env.vercel`.
- committed or pulled secret exports should not live in the repository.

### Google Search Console

- meta verification is present in:
  - `nmm-pwa/src/app/layout.tsx`
- static HTML verification file is present in:
  - `nmm-pwa/public/google2e037b48f21a0d2d.html`

Operational note:

- production verification by file or meta still depends on the active production deploy containing these changes

### Homepage And Navigation

- homepage composition remains driven by `getHomePageData()` in `nmm-pwa/src/lib/wp-queries.ts`
- navigation resolution now has a shared helper path in the same file for menu and category fallback behavior

### Comments

- public submit through frontend proxy remains enabled
- moderation remains enforced in WordPress
- approved comments remain visible under article and on `/reakcie`

### Editorial Fields And Fallbacks

- WordPress remains source of truth for editorial metadata
- image fallback and public featured image field exposure remain part of the WordPress to Next flow

## Documentation Consolidation

Canonical docs now are:

- `docs/PROJECT-HANDOFF.md`
- `docs/SYSTEM-MAP.md`
- `docs/EDITOR-GUIDE.md`
- `docs/OPS-CHECKLIST.md`
- `docs/SECURITY-NOTES.md`
- `docs/CHANGELOG-CURRENT.md`

Legacy overlap docs were reduced to redirect notes:

- `docs/editorprepojenienextjs.md`
- `docs/SYSTEM-MAP.md`
- `docs/produkcia-checklist.md`
- `docs/workflow-headless-content-comments.md`
- `docs/cms-article-model.md`

## Known Remaining Operational Risks

- production deploy mismatch can still make correct source changes look broken
- DNS verification state for Google should be checked against public propagation when needed
- manual comment moderation remains necessary because public comments are open

## Next Useful Checks

1. verify the live production deploy serves the Google HTML verification file
2. verify Search Console DNS TXT has propagated publicly
3. run one full publish -> revalidate -> article smoke test on production
