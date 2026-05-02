# UI/UX + Code Smells Audit (2026-05-02)

## Scope
- Codebase: `src/**/*.{css,ts,tsx}`
- Audit type: color system, DOM depth, visual noise, design-system proposal

## 1) Farebny Audit
- Unique HEX (background/text contexts): 4
- Unique RGB/RGBA (background/text contexts): 101
- Unique named colors/tokens (background/text contexts): 15
- Total unique color values: 120

### HEX (all unique)
- `#020617`
- `#071126`
- `#0b1222`
- `#fff`

### RGB/RGBA (all unique)
- `rgba(1,8,12,0.76)`
- `rgba(103,232,249,0.9)`
- `rgba(11,58,70,0.62)`
- `rgba(148,163,184,0.72)`
- `rgba(15,23,42,0.78)`
- `rgba(15,23,42,0.84)`
- `rgba(15,23,42,0.88)`
- `rgba(15,23,42,0.9)`
- `rgba(15,23,42,0.94)`
- `rgba(15,23,42,0.96)`
- `rgba(15,23,42,0.98)`
- `rgba(153,27,27,0.22)`
- `rgba(153,27,27,0.26)`
- `rgba(153,27,27,0.3)`
- `rgba(153,27,27,0.32)`
- `rgba(153,27,27,0.34)`
- `rgba(159,18,57,0.34)`
- `rgba(17,27,51,0.7)`
- `rgba(17,27,51,0.72)`
- `rgba(17,27,51,0.82)`
- `rgba(17,27,51,0.88)`
- `rgba(17,27,51,0.98)`
- `rgba(18,52,128,0.6)`
- `rgba(185,28,28,0.58)`
- `rgba(2,10,16,0.86)`
- `rgba(2,6,23,0.56)`
- `rgba(20,8,14,0.42)`
- `rgba(220,38,38,0.75)`
- `rgba(226,232,240,0.86)`
- `rgba(226,232,240,0.9)`
- `rgba(226,232,240,0.92)`
- `rgba(23,74,175,0.55)`
- `rgba(23,74,175,0.72)`
- `rgba(23,74,175,0.78)`
- `rgba(239,68,68,0.22)`
- `rgba(241,245,249,0.97)`
- `rgba(29,78,180,0.18)`
- `rgba(29,78,180,0.72)`
- `rgba(29,78,180,0.9)`
- `rgba(3,62,135,0.85)`
- `rgba(3,8,43,0.92)`
- `rgba(3,8,43,0.96)`
- `rgba(37,99,235,0.07)`
- `rgba(37,99,235,0.08)`
- `rgba(37,99,235,0.18)`
- `rgba(37,99,235,0.24)`
- `rgba(37,99,235,0.26)`
- `rgba(37,99,235,0.34)`
- `rgba(4,12,42,0.74)`
- `rgba(4,13,48,0.60)`
- `rgba(4,13,48,0.8)`
- `rgba(4,14,49,0.56)`
- `rgba(4,14,49,0.62)`
- `rgba(4,14,49,0.82)`
- `rgba(4,14,49,0.9)`
- `rgba(4,20,28,0.97)`
- `rgba(41,11,20,0.56)`
- `rgba(45,87,178,0.12)`
- `rgba(45,87,178,0.14)`
- `rgba(5,17,55,0.58)`
- `rgba(5,20,72,0.72)`
- `rgba(5,24,31,0.82)`
- `rgba(5,28,35,0.72)`
- `rgba(5,31,40,0.08)`
- `rgba(5,31,40,0.38)`
- `rgba(56,189,248,0.34)`
- `rgba(6,182,212,0.08)`
- `rgba(6,182,212,0.14)`
- `rgba(6,182,212,0.3)`
- `rgba(6,22,64,0.36)`
- `rgba(6,22,64,0.4)`
- `rgba(6,22,64,0.44)`
- `rgba(6,22,64,0.52)`
- `rgba(6,22,64,0.56)`
- `rgba(6,22,64,0.62)`
- `rgba(6,22,64,0.72)`
- `rgba(6,24,31,0.76)`
- `rgba(6,26,34,0.92)`
- `rgba(6,31,39,0.88)`
- `rgba(7,28,80,0.3)`
- `rgba(7,28,80,0.32)`
- `rgba(7,28,80,0.34)`
- `rgba(7,28,80,0.36)`
- `rgba(7,28,80,0.48)`
- `rgba(7,39,48,0.62)`
- `rgba(7,39,48,0.68)`
- `rgba(8,28,78,0.42)`
- `rgba(8,28,78,0.55)`
- `rgba(8,31,91,0.28)`
- `rgba(8,31,91,0.3)`
- `rgba(8,31,91,0.32)`
- `rgba(8,31,91,0.34)`
- `rgba(8,31,91,0.35)`
- `rgba(8,31,91,0.38)`
- `rgba(8,31,91,0.52)`
- `rgba(8,31,91,0.62)`
- `rgba(8,31,91,0.72)`
- `rgba(8,31,91,0.85)`
- `rgba(8,31,91,0.9)`
- `rgba(8,35,42,0.72)`
- `rgba(8,39,47,0.84)`

### Named/Tailwind color tokens (all unique)
- `blue-100`
- `blue-200`
- `cyan-500`
- `orange-100`
- `red-100`
- `red-200`
- `red-50`
- `rose-200`
- `sky-100`
- `slate-100`
- `slate-200`
- `slate-300`
- `slate-950`
- `transparent`
- `white`

### Similar shades to merge (dirty near-duplicates)
- `8,31,91` appears across many alpha variants (0.28-0.90): unify to one surface + one hover variant
- `6,22,64` appears across many alpha variants (0.36-0.72): unify to one card surface token
- `4,13,48` and `4,14,49` are visually near-identical: merge into one base-dark
- Accent blues split between `23,74,175`, `29,78,180`, `37,99,235`: keep only 1 accent + 1 accent-hover
- Reds in video (`153,27,27`, `185,28,28`, `220,38,38`) are fine semantically, but cap to 2 steps

### Most frequent RGB triplets (by occurrences in bg/text contexts)
- `8,31,91` -> 19x
- `6,22,64` -> 14x
- `15,23,42` -> 8x
- `29,78,180` -> 7x
- `23,74,175` -> 7x
- `153,27,27` -> 7x
- `4,13,48` -> 7x
- `37,99,235` -> 6x
- `7,28,80` -> 5x
- `17,27,51` -> 5x
- `226,232,240` -> 5x
- `4,14,49` -> 5x
- `5,20,72` -> 4x
- `6,182,212` -> 4x
- `7,39,48` -> 3x
- `3,8,43` -> 2x
- `8,28,78` -> 2x
- `45,87,178` -> 2x
- `8,39,47` -> 2x
- `4,12,42` -> 2x

## 2) Audit Vrstiev (DOM Bloat)
### Max nesting depth (heuristic JSX tag parser)
- depth 17: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\ArticleComments.tsx`
- depth 15: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\app\[slug]\page.tsx`
- depth 13: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\SmartSearchOverlay.tsx`
- depth 9: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\SiteHeader.tsx`
- depth 8: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\app\archiv-fotiek\page.tsx`
- depth 7: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\MatrixHero.tsx`
- depth 7: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\SidebarFeed.tsx`
- depth 7: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\SiteFooter.tsx`
- depth 6: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\app\reakcie\page.tsx`
- depth 4: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\FeaturedPost.tsx`
- depth 4: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\FrontendVariantSwitcher.tsx`
- depth 4: `C:\Users\42195\Desktop\Files\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa\src\components\MatrixBackground.tsx`

### Key hotspots
- `src/components/ArticleComments.tsx` (depth 17): form + comments feed has high wrapper density
- `src/components/SmartSearchOverlay.tsx` (depth 13): overlay > sections > result cards > media wrappers
- `src/components/SiteHeader.tsx` (depth 9): desktop + mobile + overlays + social grid in one component

### Flattening recommendations
- Split header into `HeaderTop`, `HeaderNav`, `HeaderSocial`, `MobileMenuSheet` and render conditionally
- Replace nested social wrappers with one reusable `SocialLinksRow` component and map-based config
- In comments/search, merge adjacent wrappers where they only carry spacing/border; move styles to parent via grid/flex gaps
- Use CSS Grid for mobile menu content blocks instead of wrapper stacks

## 3) Audit Vizualneho Sumu (duplicate UI)
- Social links are duplicated in at least 4 places:
  - Header mobile sheet (`SiteHeader.tsx`)
  - Header desktop row (`SiteHeader.tsx`)
  - Quick access strip under header (`MatrixHero.tsx`)
  - Footer social cluster (`SiteFooter.tsx`)
- `YouTube` CTA appears in both `VideoNewsroomPanel` and quick access strip; this is acceptable only if hierarchy is explicit
- Multiple panel gradients and border opacities produce visual noise; normalize to 2 surface levels max

## 4) Strict Design System Proposal
Use max 3 background colors + 1 accent:
- `Base`: `#020617` (page background)
- `Surface`: `#0f172a` (cards, panels)
- `Border`: `#1e293b` (all separators and borders)
- `Accent`: `#06b6d4` (interactive focus/CTA/category only)

Optional accent-hover: `#2563eb` (only hover/active states).

## 5) Tailwind v4 token mapping
```css
@theme {
  --color-matrix-bg: #020617;
  --color-matrix-surface: #0f172a;
  --color-matrix-border: #1e293b;
  --color-matrix-accent: #06b6d4;
  --color-matrix-accent-hover: #2563eb;
  --color-matrix-text: #e2e8f0;
}
```

Then enforce classes: `bg-matrix-bg`, `bg-matrix-surface`, `border-matrix-border`, `text-matrix-text`, `text-matrix-accent`, `hover:text-matrix-accent-hover`.
