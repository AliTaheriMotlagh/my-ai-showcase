import "server-only";
import { and, arrayContains, arrayOverlaps, count, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { follows, postLikes, postSaves, posts, user } from "@/db/schema";
import type { FeedKind, FeedPage, FeedPost, Post, PostKind } from "@/lib/types";
import { toUserSummary } from "./people";

type PostRow = typeof posts.$inferSelect & {
  author: typeof user.$inferSelect;
  remixOf: (typeof posts.$inferSelect & { author: typeof user.$inferSelect }) | null;
};

const withRelations = {
  author: true,
  remixOf: { with: { author: true } },
} as const;

/** Only public posts. Hidden posts are removed by staff after reports. */
const visible = eq(posts.hidden, false);

export function toPost(row: PostRow): Post {
  const spec = row.spec ?? {};
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    caption: row.caption,
    prompt: row.prompt,
    model: row.model,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    aspect: row.aspect,
    media: row.media ?? [],
    stats: {
      likes: row.likeCount,
      comments: row.commentCount,
      views: row.viewCount,
      saves: row.saveCount,
      remixes: row.remixCount,
    },
    ...(spec.text ? { text: spec.text } : {}),
    ...(spec.code ? { code: spec.code } : {}),
    ...(spec.chat ? { chat: spec.chat } : {}),
    ...(spec.chart ? { chart: spec.chart } : {}),
    remixOf:
      row.remixOf && !row.remixOf.hidden
        ? { id: row.remixOf.id, title: row.remixOf.title, username: row.remixOf.author.username }
        : null,
  };
}

/** Adds the author and the viewer's own flags (liked, saved, following, owner) to a batch of posts, in two queries. */
async function hydrate(rows: PostRow[], viewerId: string | null): Promise<FeedPost[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.authorId))];

  const [likes, saves, following] = viewerId
    ? await Promise.all([
        db
          .select({ postId: postLikes.postId })
          .from(postLikes)
          .where(and(eq(postLikes.userId, viewerId), inArray(postLikes.postId, ids))),
        db
          .select({ postId: postSaves.postId })
          .from(postSaves)
          .where(and(eq(postSaves.userId, viewerId), inArray(postSaves.postId, ids))),
        db
          .select({ id: follows.followingId })
          .from(follows)
          .where(and(eq(follows.followerId, viewerId), inArray(follows.followingId, authorIds))),
      ])
    : [[], [], []];

  const liked = new Set(likes.map((r) => r.postId));
  const saved = new Set(saves.map((r) => r.postId));
  const follow = new Set(following.map((r) => r.id));

  return rows.map((row) => ({
    ...toPost(row),
    author: toUserSummary(row.author),
    viewer: {
      liked: liked.has(row.id),
      saved: saved.has(row.id),
      following: follow.has(row.authorId),
      owner: viewerId === row.authorId,
    },
  }));
}

/** Keeps the order of `ids` when fetching by id, since `IN (...)` does not preserve it. */
export async function getPostsByIds(ids: string[], viewerId: string | null): Promise<FeedPost[]> {
  if (!ids.length) return [];
  const rows = await db.query.posts.findMany({ where: and(visible, inArray(posts.id, ids)), with: withRelations });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const ordered = ids.map((id) => byId.get(id)).filter((r): r is PostRow => !!r);
  return hydrate(ordered, viewerId);
}

export async function getPost(id: string, viewerId: string | null): Promise<FeedPost | null> {
  const row = await db.query.posts.findFirst({ where: and(visible, eq(posts.id, id)), with: withRelations });
  if (!row) return null;
  const [item] = await hydrate([row], viewerId);
  return item ?? null;
}

export async function getRelatedPosts(post: Pick<Post, "id" | "tags" | "kind">, viewerId: string | null, n = 9): Promise<FeedPost[]> {
  const relation = post.tags.length
    ? or(arrayOverlaps(posts.tags, post.tags), eq(posts.kind, post.kind))
    : eq(posts.kind, post.kind);
  const rows = await db.query.posts.findMany({
    where: and(visible, ne(posts.id, post.id), relation),
    orderBy: [desc(posts.likeCount), desc(posts.createdAt)],
    limit: n,
    with: withRelations,
  });
  return hydrate(rows, viewerId);
}

export interface FeedQuery {
  feed: FeedKind;
  viewerId: string | null;
  cursor?: number;
  limit?: number;
  /** Explore only: changes the random order. */
  seed?: number;
  kind?: PostKind | null;
  /** Username, for the `user` feed. */
  user?: string;
  tag?: string;
}

export async function getFeedPage(q: FeedQuery): Promise<FeedPage> {
  const cursor = Math.max(0, q.cursor ?? 0);
  const limit = Math.min(Math.max(1, q.limit ?? 12), 30);
  const kindFilter = q.kind ? eq(posts.kind, q.kind) : undefined;
  const base = and(visible, kindFilter);
  const offsetPage = (rows: FeedPost[]): FeedPage => ({
    items: rows,
    nextCursor: rows.length === limit ? cursor + limit : null,
  });

  switch (q.feed) {
    case "foryou": {
      // Popularity, decayed by age (half-life of about 8 days), so new work can rise.
      const score = sql`ln(${posts.likeCount}::float8 + 10) * exp(-extract(epoch from (now() - ${posts.createdAt})) / 1036800)`;
      const rows = await db.query.posts.findMany({
        where: base,
        orderBy: [desc(score), desc(posts.createdAt), desc(posts.id)],
        limit,
        offset: cursor,
        with: withRelations,
      });
      return offsetPage(await hydrate(rows, q.viewerId));
    }

    case "latest": {
      const rows = await db.query.posts.findMany({
        where: base,
        orderBy: [desc(posts.createdAt), desc(posts.id)],
        limit,
        offset: cursor,
        with: withRelations,
      });
      return offsetPage(await hydrate(rows, q.viewerId));
    }

    case "explore": {
      // Endless random order. A seed gives a stable order for one visit. When the cursor passes the end of
      // the catalogue, each pass gets its own seed, so the stream never runs out and never repeats in order.
      const [{ total }] = await db.select({ total: count() }).from(posts).where(base);
      if (!total) return { items: [], nextCursor: null };

      const passRows = (pass: number, offset: number, take: number) =>
        db.query.posts.findMany({
          where: base,
          orderBy: [sql`md5(${posts.id} || ${`${q.seed ?? 1}:${pass}`})`],
          limit: take,
          offset,
          with: withRelations,
        });

      // A page never holds the same post twice, so it is capped at the size of the catalogue.
      const want = Math.min(limit, total);
      const cycle = Math.floor(cursor / total);
      const offset = cursor - cycle * total;
      let rows = await passRows(cycle, offset, Math.min(want, total - offset));
      // A page that reaches the end of a pass continues into the next one, so pages stay full.
      if (rows.length < want) rows = [...rows, ...(await passRows(cycle + 1, 0, want - rows.length))];
      if (!rows.length) return { items: [], nextCursor: null };
      return { items: await hydrate(rows, q.viewerId), nextCursor: cursor + rows.length };
    }

    case "following": {
      if (!q.viewerId) return { items: [], nextCursor: null };
      const followed = db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, q.viewerId));
      const rows = await db.query.posts.findMany({
        where: and(base, inArray(posts.authorId, followed)),
        orderBy: [desc(posts.createdAt), desc(posts.id)],
        limit,
        offset: cursor,
        with: withRelations,
      });
      return offsetPage(await hydrate(rows, q.viewerId));
    }

    case "user": {
      const authorId = q.user ? await userIdForUsername(q.user) : null;
      if (!authorId) return { items: [], nextCursor: null };
      const rows = await db.query.posts.findMany({
        where: and(base, eq(posts.authorId, authorId)),
        orderBy: [desc(posts.createdAt), desc(posts.id)],
        limit,
        offset: cursor,
        with: withRelations,
      });
      return offsetPage(await hydrate(rows, q.viewerId));
    }

    case "tag": {
      const tag = (q.tag ?? "").toLowerCase();
      if (!tag) return { items: [], nextCursor: null };
      const rows = await db.query.posts.findMany({
        where: and(base, arrayContains(posts.tags, [tag])),
        orderBy: [desc(posts.likeCount), desc(posts.createdAt), desc(posts.id)],
        limit,
        offset: cursor,
        with: withRelations,
      });
      return offsetPage(await hydrate(rows, q.viewerId));
    }

    case "saved":
    case "liked": {
      if (!q.viewerId) return { items: [], nextCursor: null };
      const table = q.feed === "saved" ? postSaves : postLikes;
      const rows = await db
        .select({ postId: table.postId })
        .from(table)
        .where(eq(table.userId, q.viewerId))
        .orderBy(desc(table.createdAt))
        .limit(limit)
        .offset(cursor);
      const items = await getPostsByIds(
        rows.map((r) => r.postId),
        q.viewerId,
      );
      return { items, nextCursor: rows.length === limit ? cursor + limit : null };
    }
  }
}

export async function getAuthorPosts(authorId: string, viewerId: string | null, excludeId: string, n: number): Promise<FeedPost[]> {
  const rows = await db.query.posts.findMany({
    where: and(visible, eq(posts.authorId, authorId), ne(posts.id, excludeId)),
    orderBy: [desc(posts.createdAt)],
    limit: n,
    with: withRelations,
  });
  return hydrate(rows, viewerId);
}

export async function userIdForUsername(username: string): Promise<string | null> {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.username}) = ${username.toLowerCase()}`)
    .limit(1);
  return row?.id ?? null;
}

/** Used by the `user` feed page and the profile page. */
export async function postsForAuthor(authorId: string, viewerId: string | null, limit: number): Promise<FeedPost[]> {
  const rows = await db.query.posts.findMany({
    where: and(visible, eq(posts.authorId, authorId)),
    orderBy: [desc(posts.createdAt), desc(posts.id)],
    limit,
    with: withRelations,
  });
  return hydrate(rows, viewerId);
}

/** Post counts per format for one author. Drives the highlight bubbles and format chips on a profile. */
export async function getKindCounts(authorId: string): Promise<Partial<Record<PostKind, number>>> {
  const rows = await db
    .select({ kind: posts.kind, n: count() })
    .from(posts)
    .where(and(visible, eq(posts.authorId, authorId)))
    .groupBy(posts.kind);
  return Object.fromEntries(rows.map((r) => [r.kind, r.n])) as Partial<Record<PostKind, number>>;
}
