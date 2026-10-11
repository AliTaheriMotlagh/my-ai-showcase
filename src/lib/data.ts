/**
 * Server-side data layer. Every page and API route reads through these functions,
 * so swapping the generated demo data for a real database only touches this file.
 * Do not import from client components.
 */
import { KIND_MODELS } from "./kinds";
import { ART_STYLES, PALETTES } from "./palettes";
import { hashString, int, mulberry32, pick, sample, type Rng } from "./random";
import {
  AUTHOR_REPLIES, CAMERA_MOVES, CAPTIONS, CHARTS, CHATS, CODES, COMMENTS, INSTRUMENTS,
  KEYS, MODIFIERS, OBJECTS_3D, SEED_USERS, STYLES, SUBJECTS, TEXTS, TRACKS,
} from "./seed-content";
import type { Aspect, Comment, FeedKind, FeedPage, FeedPost, Post, PostKind, User, Visual } from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Anchored to the current hour so demo posts always look recent. */
const NOW = Math.floor(Date.now() / HOUR) * HOUR;
const POST_COUNT = 240;

// ---------------------------------------------------------------- users

export const users: User[] = SEED_USERS.map((u, i) => ({
  id: `u${i + 1}`,
  username: u.username,
  name: u.name,
  headline: u.headline,
  bio: u.bio,
  location: u.location,
  website: u.website,
  tools: u.tools,
  verified: u.verified,
  followers: u.followers,
  following: u.following,
  avatarSeed: hashString(u.username),
  palette: PALETTES[u.palette].colors,
  joinedAt: new Date(NOW - (420 + i * 37) * DAY).toISOString(),
}));

const userById = new Map(users.map((u) => [u.id, u]));
const userByName = new Map(users.map((u) => [u.username.toLowerCase(), u]));

export const getUser = (username: string) => userByName.get(username.toLowerCase().replace(/^@/, ""));
export const getUserById = (id: string) => userById.get(id);

// ---------------------------------------------------------------- posts

const KIND_WEIGHTS: [PostKind, number][] = [
  ["image", 30], ["gallery", 8], ["video", 14], ["audio", 8], ["text", 8],
  ["code", 9], ["chat", 7], ["chart", 7], ["3d", 9],
];

function weighted<T>(r: Rng, items: [T, number][]): T {
  let x = r() * items.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of items) {
    x -= w;
    if (x <= 0) return v;
  }
  return items[items.length - 1][0];
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const tagify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const unique = <T>(list: T[]) => [...new Set(list)];
const newSeed = (r: Rng) => int(r, 1, 2 ** 30);

function buildPost(i: number): Post {
  const r = mulberry32(hashString(`post:${i}`));
  // Bias towards earlier (more popular) creators.
  const authorIdx = Math.floor(Math.pow(r(), 1.25) * users.length);
  const author = users[authorIdx];
  const kind: PostKind = r() < 0.72 ? pick(r, SEED_USERS[authorIdx].focus) : weighted(r, KIND_WEIGHTS);
  const ageMinutes = Math.floor(Math.pow(r(), 1.7) * 60 * 24 * 50) + 5;
  const model = pick(r, KIND_MODELS[kind]);
  const palette = r() < 0.45 ? author.palette : pick(r, PALETTES).colors;
  let visuals: Visual[] = [{ seed: newSeed(r), style: pick(r, ART_STYLES), palette }];

  let title = "";
  let prompt = "";
  let tags: string[] = [];
  let aspect: Aspect = "square";
  const extra: Partial<Post> = {};

  switch (kind) {
    case "image":
    case "gallery":
    case "video": {
      const s = pick(r, SUBJECTS);
      const st = pick(r, STYLES);
      const mods = sample(r, MODIFIERS, 2).join(", ");
      title = s.t;
      if (kind === "video") {
        prompt = `${pick(r, CAMERA_MOVES)} of ${s.p}, ${st.s}, ${mods}`;
        aspect = "portrait";
        tags = [...s.tags, st.tag, "aivideo"];
        extra.video = { duration: int(r, 6, 24) };
      } else {
        prompt = `${s.p}, ${st.s}, ${mods}`;
        aspect = pick(r, ["portrait", "portrait", "square", "landscape"] as Aspect[]);
        tags = [...s.tags, st.tag, kind === "gallery" ? "series" : "aiart"];
      }
      if (kind === "gallery") {
        const base = visuals[0];
        visuals = Array.from({ length: int(r, 3, 5) }, () => ({ ...base, seed: newSeed(r) }));
        title = `${s.t} — a series`;
      }
      break;
    }
    case "audio": {
      const t = pick(r, TRACKS);
      const bpm = int(r, 72, 140);
      title = t.t;
      prompt = `${t.genre.toLowerCase()} track, ${t.mood}, ${bpm} bpm, ${sample(r, INSTRUMENTS, 2).join(" and ")}`;
      tags = [tagify(t.genre), "aimusic", t.mood.split(" ")[0]];
      extra.audio = { duration: int(r, 95, 240), bpm, key: pick(r, KEYS), genre: t.genre };
      break;
    }
    case "text": {
      const t = pick(r, TEXTS);
      title = t.title;
      prompt = t.prompt;
      tags = [...t.tags, "aiwriting"];
      aspect = "portrait";
      extra.text = { form: t.form, body: t.body };
      break;
    }
    case "code": {
      const c = pick(r, CODES);
      title = c.title;
      prompt = c.prompt;
      tags = [...c.tags, "aicode"];
      extra.code = { language: c.language, filename: c.filename, source: c.source };
      break;
    }
    case "chat": {
      const c = pick(r, CHATS);
      title = c.title;
      prompt = c.messages[0].text;
      tags = [...c.tags, "aichat"];
      extra.chat = c.messages;
      break;
    }
    case "chart": {
      const c = pick(r, CHARTS);
      let values = c.labels.map(() => Math.round(c.base * (0.35 + r() * 1.3)));
      if (c.cumulative) {
        let acc = 0;
        values = values.map((v) => (acc += v));
      }
      title = c.title;
      prompt = c.prompt;
      tags = [...c.tags, "dataviz"];
      aspect = "landscape";
      extra.chart = { type: c.type, labels: c.labels, values, unit: c.unit };
      break;
    }
    case "3d": {
      const o = pick(r, OBJECTS_3D);
      title = o.t;
      prompt = `${o.p}, ${pick(r, STYLES).s}`;
      tags = [...o.tags, "ai3d"];
      extra.object3d = { shape: o.shape };
      break;
    }
  }

  const caption = pick(r, CAPTIONS)
    .replace("{model}", model)
    .replace("{seed}", String(visuals[0].seed % 100_000))
    .replace("{n}", String(int(r, 2, 9)));
  const popularity = Math.pow(r(), 3.2) * (author.verified ? 1 : 0.55);
  const likes = Math.round(40 + popularity * 90_000);

  return {
    id: `${slugify(title)}-${hashString(`id:${i}`).toString(36).slice(0, 6)}`,
    authorId: author.id,
    kind,
    title,
    caption,
    prompt,
    model,
    tags: unique(tags),
    createdAt: new Date(NOW - ageMinutes * 60_000).toISOString(),
    aspect,
    visuals,
    stats: {
      likes,
      comments: Math.round(likes * (0.012 + r() * 0.04)),
      views: Math.round(likes * (9 + r() * 18)),
      saves: Math.round(likes * (0.04 + r() * 0.16)),
      remixes: Math.round(likes * (0.004 + r() * 0.02)),
    },
    ...extra,
  };
}

export const posts: Post[] = Array.from({ length: POST_COUNT }, (_, i) => buildPost(i)).sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

const postById = new Map(posts.map((p) => [p.id, p]));

export function withAuthor(p: Post): FeedPost {
  return { ...p, author: userById.get(p.authorId)! };
}

export function getPost(id: string): FeedPost | undefined {
  const p = postById.get(id);
  return p && withAuthor(p);
}

const byAuthor = new Map<string, Post[]>();
for (const p of posts) byAuthor.set(p.authorId, [...(byAuthor.get(p.authorId) ?? []), p]);

export const postsByAuthor = (userId: string): FeedPost[] => (byAuthor.get(userId) ?? []).map(withAuthor);

export const postsByTag = (tag: string): FeedPost[] =>
  posts.filter((p) => p.tags.includes(tag.toLowerCase())).sort((a, b) => b.stats.likes - a.stats.likes).map(withAuthor);

export function getUserStats(userId: string) {
  const list = byAuthor.get(userId) ?? [];
  const kinds: Partial<Record<PostKind, number>> = {};
  for (const p of list) kinds[p.kind] = (kinds[p.kind] ?? 0) + 1;
  return { posts: list.length, likes: list.reduce((s, p) => s + p.stats.likes, 0), kinds };
}

/** Fresh shuffle seed per request, so Explore and Flow feel different on every visit. */
export const newFeedSeed = () => Math.floor(Math.random() * 1_000_000);

// ---------------------------------------------------------------- feeds

const ageDays = (p: Post) => (NOW - Date.parse(p.createdAt)) / DAY;

/** "For you": popularity decayed by age, plus a little jitter so it doesn't feel static. */
const ranked: Post[] = (() => {
  const r = mulberry32(42);
  return posts
    .map((p) => ({ p, score: Math.log10(p.stats.likes + 10) * Math.exp(-ageDays(p) / 12) + r() * 0.8 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
})();

/** Weighted random order (Efraimidis–Spirakis): popular posts surface more often, but anything can appear. */
function weightedShuffle(list: Post[], r: Rng): Post[] {
  return list
    .map((p) => ({ p, k: Math.pow(r(), 1 / Math.log10(p.stats.likes + 10)) }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.p);
}

const orderCache = new Map<string, Post[]>();

/**
 * Infinite feeds: the cursor keeps counting past the end of the list and each
 * pass through the catalogue ("cycle") gets a fresh random order.
 */
function endless(key: string, base: Post[], seed: number, cursor: number, limit: number, firstCycle?: Post[]): FeedPage {
  if (!base.length) return { items: [], nextCursor: null };
  const items: FeedPost[] = [];
  for (let i = cursor; i < cursor + limit; i++) {
    const cycle = Math.floor(i / base.length);
    let order = cycle === 0 && firstCycle ? firstCycle : orderCache.get(`${key}:${seed}:${cycle}`);
    if (!order) {
      order = weightedShuffle(base, mulberry32(seed * 31 + cycle * 7919));
      if (orderCache.size > 300) orderCache.clear();
      orderCache.set(`${key}:${seed}:${cycle}`, order);
    }
    items.push(withAuthor(order[i % base.length]));
  }
  return { items, nextCursor: cursor + limit };
}

function slice(list: Post[], cursor: number, limit: number): FeedPage {
  return {
    items: list.slice(cursor, cursor + limit).map(withAuthor),
    nextCursor: cursor + limit < list.length ? cursor + limit : null,
  };
}

export interface FeedQuery {
  feed: FeedKind;
  cursor?: number;
  limit?: number;
  seed?: number;
  kind?: PostKind | null;
  authors?: string[];
  user?: string;
  tag?: string;
  ids?: string[];
}

export function getFeedPage(q: FeedQuery): FeedPage {
  const cursor = q.cursor ?? 0;
  const limit = q.limit ?? 12;
  const seed = q.seed ?? 1;
  const byKind = <T extends Post>(list: T[]) => (q.kind ? list.filter((p) => p.kind === q.kind) : list);

  switch (q.feed) {
    case "foryou": {
      const base = byKind(ranked);
      return endless(`fy:${q.kind}`, base, seed, cursor, limit, base);
    }
    case "explore":
      return endless(`ex:${q.kind}`, byKind(posts), seed, cursor, limit);
    case "following": {
      const set = new Set(q.authors ?? []);
      return slice(byKind(posts.filter((p) => set.has(p.authorId))), cursor, limit);
    }
    case "user": {
      const u = q.user ? getUser(q.user) : undefined;
      return slice(u ? byKind(byAuthor.get(u.id) ?? []) : [], cursor, limit);
    }
    case "tag":
      return slice(byKind(postsByTag(q.tag ?? "")), cursor, limit);
    case "ids":
      return {
        items: (q.ids ?? []).map((id) => postById.get(id)).filter((p): p is Post => !!p).map(withAuthor),
        nextCursor: null,
      };
    default:
      return slice(byKind(posts), cursor, limit);
  }
}

// ---------------------------------------------------------------- discovery

const tagCounts = (() => {
  const m = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
})();

export const getAllTags = () => tagCounts;

export function getTrendingTags(n = 8) {
  const score = new Map<string, number>();
  for (const p of posts) {
    const w = p.stats.likes * Math.exp(-ageDays(p) / 7);
    for (const t of p.tags) score.set(t, (score.get(t) ?? 0) + w);
  }
  const counts = new Map(tagCounts.map((t) => [t.tag, t.count]));
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag]) => ({ tag, count: counts.get(tag) ?? 0 }));
}

export const topCreators = (n = 12) => [...users].sort((a, b) => b.followers - a.followers).slice(0, n);

export function getSuggestedUsers(n = 5, exclude: string[] = []) {
  const r = mulberry32(Math.floor(NOW / DAY));
  return sample(r, users.filter((u) => !exclude.includes(u.id)), n);
}

export function getRelated(post: Post, n = 9): FeedPost[] {
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score:
        p.tags.filter((t) => post.tags.includes(t)).length * 3 +
        (p.kind === post.kind ? 2 : 0) +
        (p.authorId === post.authorId ? -1 : 0) +
        Math.log10(p.stats.likes + 1) * 0.3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => withAuthor(x.p));
}

export function search(query: string) {
  const q = query.trim().toLowerCase().replace(/^[@#]/, "");
  if (!q) return null;
  const people = users
    .filter(
      (u) =>
        u.username.includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.headline.toLowerCase().includes(q) ||
        u.tools.some((t) => t.toLowerCase().includes(q)),
    )
    .slice(0, 12);
  const tags = tagCounts.filter((t) => t.tag.includes(q.replace(/\s+/g, ""))).slice(0, 12);
  const found = posts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.kind === q ||
        p.tags.some((t) => t.includes(q)),
    )
    .sort((a, b) => b.stats.likes - a.stats.likes)
    .slice(0, 60)
    .map(withAuthor);
  return { people, tags, posts: found };
}

// ---------------------------------------------------------------- social

export function getComments(post: Post): Comment[] {
  const r = mulberry32(hashString(`comments:${post.id}`));
  const n = Math.min(post.stats.comments, int(r, 3, 8));
  const start = Date.parse(post.createdAt);
  const at = () => new Date(start + r() * Math.max(HOUR, NOW - start)).toISOString();
  const out: Comment[] = Array.from({ length: n }, (_, i) => {
    let author = pick(r, users);
    if (author.id === post.authorId) author = users[(users.indexOf(author) + 1) % users.length];
    return {
      id: `${post.id}-c${i}`,
      author,
      text: pick(r, COMMENTS),
      createdAt: at(),
      likes: Math.floor(Math.pow(r(), 2) * Math.max(5, post.stats.likes / 200)),
    };
  }).sort((a, b) => b.likes - a.likes);
  if (out.length > 2 && r() < 0.7) {
    out.splice(1, 0, { id: `${post.id}-reply`, author: userById.get(post.authorId)!, text: pick(r, AUTHOR_REPLIES), createdAt: at(), likes: int(r, 3, 120) });
  }
  return out;
}

export interface Notification {
  id: string;
  type: "like" | "follow" | "comment" | "remix" | "mention";
  user: User;
  post?: FeedPost;
  text?: string;
  count?: number;
  createdAt: string;
}

export function getNotifications(): Notification[] {
  const r = mulberry32(hashString("notifications"));
  const pool = posts.slice(0, 60);
  return Array.from({ length: 28 }, (_, i): Notification => {
    const type = weighted<Notification["type"]>(r, [["like", 5], ["follow", 3], ["comment", 3], ["remix", 2], ["mention", 1]]);
    const user = pick(r, users);
    const post = withAuthor(pick(r, pool));
    const age = Math.floor(Math.pow(r(), 1.8) * 21 * DAY) + i * 60_000;
    return {
      id: `n${i}`,
      type,
      user,
      post: type === "follow" ? undefined : post,
      text: type === "comment" || type === "mention" ? pick(r, COMMENTS) : undefined,
      count: type === "like" && r() < 0.5 ? int(r, 2, 240) : undefined,
      createdAt: new Date(NOW - age).toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getNotificationGroups() {
  const now = Date.now();
  const age = (n: Notification) => now - Date.parse(n.createdAt);
  const all = getNotifications();
  return [
    { label: "Today", items: all.filter((n) => age(n) < DAY) },
    { label: "This week", items: all.filter((n) => age(n) >= DAY && age(n) < 7 * DAY) },
    { label: "Earlier", items: all.filter((n) => age(n) >= 7 * DAY) },
  ].filter((g) => g.items.length);
}
