# Latent — a social network for AI work

A responsive web app where people showcase anything they made with AI (images, image series, video, music, writing, code, chats, data viz and 3D) in a feed that feels like Instagram × X × TikTok.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your real domain before deploying. Canonical URLs, the sitemap and share cards all use it.

## What's inside

| Route | What it is |
| --- | --- |
| `/` | Home feed with **For you / Following** tabs, creator "stories" row, infinite scroll |
| `/explore` | Endless, randomly ordered mosaic (new order every visit), filterable by format |
| `/flow` | Full-screen vertical feed with snap scrolling: swipe or ↑/↓ (J/K), L to like |
| `/p/[id]` | Post page: media, prompt (copy / remix), stats, comments, related work |
| `/u/[username]` | Creator profile: cover, stats, "made with" tools, format highlights, grid |
| `/tags/[tag]` | Tag page with top creators and related tags |
| `/search` | Live search across creators, tags, prompts and models; "browse by format" |
| `/create` | Composer for every format, with image upload, generated covers and a live preview |
| `/me` | Your profile with posts, saved and liked tabs, and profile editing |
| `/notifications` | Activity, grouped by Today / This week / Earlier |
| `/about` | Marketing landing page (hero, formats, features, testimonials, FAQ, CTA) |

**Social UX:** double-tap to like (with heart burst), save, follow, share (Web Share API, falling back to copying the link), comments, remix with credit back to the original post, toasts, empty states, skeletons, dark/light theme.

**Responsive layout:**
- **Phone (< 768px):** top bar, bottom tab bar with a center Create button, iOS safe-area aware.
- **Tablet (768–1279px):** icon-only side rail.
- **Desktop (≥ 1280px):** full sidebar plus a "Suggested / Trending" column.

**SEO & marketing:**
- Per-page titles, descriptions and canonical URLs.
- Open Graph and Twitter cards, with generated share images for every post and profile.
- JSON-LD: `WebSite` + `SearchAction`, `ProfilePage`, `SocialMediaPosting`, `BreadcrumbList`, `FAQPage`.
- `sitemap.xml`, `robots.txt`, PWA manifest and app icons.
- Server-rendered pages; private pages are set to `noindex`.

**Accessibility & performance:**
- Semantic landmarks, a skip link, ARIA labels and states, and visible focus rings.
- Honors `prefers-reduced-motion`.
- Feed cards use `content-visibility`, and Flow only renders the items near the screen.

## How the demo data works

There is no database yet. `src/lib/data.ts` generates 24 creators and 240 posts deterministically from seeds, and every page and the `/api/posts` endpoint read through it. Visuals are **generative SVG/CSS art** (`src/components/art/Artwork.tsx`), so nothing needs hosting:
- "Video" is animated artwork.
- "Music" plays a seed-generated melody through the Web Audio API.
- "3D" is pure CSS 3D.

Your own likes, saves, follows, comments and posts are kept in `localStorage` (`src/lib/store.ts`). Uploaded images are resized in the browser first.

## Going to production

1. **Database + API:** replace the functions in `src/lib/data.ts` (e.g. Postgres + Prisma/Drizzle). `getFeedPage` already uses cursor pagination.
2. **Auth:** e.g. Auth.js or Clerk. Then replace `useAppStore` actions with API calls (keep the optimistic UI).
3. **Media storage:** S3 or R2 + a CDN for real images, video (`<video>`/HLS), audio and 3D (`<model-viewer>`). The media components in `src/components/media/` are the only place to change.
4. **Ranking:** move "For you" scoring server-side with real engagement signals.
5. **Moderation & safety:** reporting is wired in the UI (`PostMenu`), but there is no backend for it yet.
6. Set `NEXT_PUBLIC_SITE_URL`, deploy (e.g. Vercel), and submit the sitemap to Google Search Console.
