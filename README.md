# Latent — a social network for AI work

A responsive web app where people showcase anything they made with AI (images, image series, video, music, writing, code, chats, data viz and 3D) in a feed that feels like Instagram × X × TikTok.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4**.

## Run it

You need Node 22.9 or newer (the migration script uses `--env-file-if-exists`) and a Postgres database.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run db:migrate           # creates the tables
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`, `npm run db:generate` (after changing `src/db/schema.ts`), `npm run db:studio`.

### Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. Use the pooled URL. |
| `DATABASE_URL_UNPOOLED` | no | Direct connection, used by `db:migrate` when set. |
| `BETTER_AUTH_SECRET` | yes | Session signing secret. `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | no | Auth base URL. Defaults to `NEXT_PUBLIC_SITE_URL`. |
| `BLOB_READ_WRITE_TOKEN` | yes, for uploads | Vercel Blob token. Uploads go straight to Blob storage. |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Canonical URL, sitemap and share cards. |

## What's inside

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
| `/create` | Composer for every format: uploads, live preview, remix credit (sign-in required) |
| `/u/[username]` | Your profile is also your link page: banner, bio, links, posts, saved and liked (own profile) |
| `/settings` | Edit profile and images, manage your link page, log out, delete account |
| `/login`, `/signup` | Email and password accounts |
| `/notifications` | Likes, comments, follows and remixes, grouped by Today / This week / Earlier |
| `/about` | Marketing landing page (hero, formats, features, FAQ, CTA) |
| `/go/[id]` | Link-in-bio redirect that counts each click |

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

## Architecture

- **Data:** Postgres through Drizzle ORM (`src/db/schema.ts`). Migrations live in `drizzle/`.
- **Queries:** `src/server/queries/*` (feeds, profiles, search, activity). Every query returns DTOs, never raw rows, so private fields such as email never reach the browser.
- **Writes:** `src/server/services/*` hold the rules (counters, notifications, ownership, rate limits). `src/app/actions.ts` is the only write entry point the browser calls.
- **Accounts:** Better Auth with email and password (`src/lib/auth.ts`). Usernames are checked in a create hook, and `src/proxy.ts` sends logged-out visitors away from account pages.
- **Uploads:** `/api/upload` issues a short-lived token scoped to the uploader and the file type. Files then go directly to Vercel Blob. Size and type limits are enforced server-side and mirrored in the browser.
- **Media:** images, galleries, video, audio (with optional cover), and `.glb`/`.gltf` 3D models (rendered with `@google/model-viewer`, pinned to 4.3.1). Only URLs from our own blob store can be saved on a post.
- **Optimistic UI:** likes, saves and follows update immediately and reconcile with the server (`src/lib/overrides.ts`).

## Going to production

1. Create a Postgres database and set `DATABASE_URL`. Run `npm run db:migrate` against it.
2. Set `BETTER_AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN` and `NEXT_PUBLIC_SITE_URL` in the hosting environment.
3. Deploy (e.g. Vercel), then submit `/sitemap.xml` to Google Search Console.
4. Health check: `GET /api/health` returns 200 when the database is reachable.

### Not included yet

- **Email verification and password reset** need an email provider. Accounts currently work with any email address.
- **Terms of service and privacy policy pages** need your legal text before launch.
- **Moderation tools:** reports are saved to the `reports` table, and hidden posts are excluded everywhere. There is no admin screen yet.
