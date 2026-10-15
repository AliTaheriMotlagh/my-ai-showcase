import "server-only";
import { and, arrayContains, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, user } from "@/db/schema";
import type { FeedPost, UserSummary } from "@/lib/types";
import { toUserSummary } from "./people";
import { getPostsByIds } from "./posts";

export interface TagCount {
  tag: string;
  count: number;
}

/** Tags used most in the last 30 days. Empty on a fresh site, which is the honest answer. */
export async function getTrendingTags(n = 8): Promise<TagCount[]> {
  const rows = await db.execute<{ tag: string; count: number }>(sql`
    select t.tag as tag, count(*)::int as count
    from ${posts}, unnest(${posts.tags}) as t(tag)
    where ${posts.hidden} = false and ${posts.createdAt} > now() - interval '30 days'
    group by t.tag
    order by count(*) desc, t.tag
    limit ${n}
  `);
  return [...rows].map((r) => ({ tag: String(r.tag), count: Number(r.count) }));
}

/** Every tag used at least twice. Used for the sitemap. */
export async function getTagsForSitemap(limit = 2000): Promise<string[]> {
  const rows = await db.execute<{ tag: string }>(sql`
    select t.tag as tag
    from ${posts}, unnest(${posts.tags}) as t(tag)
    where ${posts.hidden} = false
    group by t.tag
    having count(*) >= 2
    order by count(*) desc
    limit ${limit}
  `);
  return [...rows].map((r) => String(r.tag));
}

/** Escapes LIKE wildcards so a search for "100%" or "a_b" matches literally. */
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export interface SearchResults {
  people: UserSummary[];
  tags: TagCount[];
  posts: FeedPost[];
}

export async function search(query: string, viewerId: string | null): Promise<SearchResults | null> {
  const q = query.trim().replace(/^[@#]/, "").slice(0, 80);
  if (!q) return null;
  const pattern = likePattern(q);

  const [peopleRows, tagRows, postRows] = await Promise.all([
    db
      .select()
      .from(user)
      .where(or(ilike(user.username, pattern), ilike(user.name, pattern), ilike(user.headline, pattern)))
      .orderBy(desc(user.createdAt))
      .limit(12),
    db.execute<{ tag: string; count: number }>(sql`
      select t.tag as tag, count(*)::int as count
      from ${posts}, unnest(${posts.tags}) as t(tag)
      where ${posts.hidden} = false and t.tag ilike ${pattern}
      group by t.tag
      order by count(*) desc
      limit 12
    `),
    db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.hidden, false),
          or(
            ilike(posts.title, pattern),
            ilike(posts.prompt, pattern),
            ilike(posts.model, pattern),
            ilike(posts.caption, pattern),
            sql`exists (select 1 from unnest(${posts.tags}) as t(tag) where t.tag ilike ${pattern})`,
          ),
        ),
      )
      .orderBy(desc(posts.likeCount), desc(posts.createdAt))
      .limit(60),
  ]);

  return {
    people: peopleRows.map(toUserSummary),
    tags: [...tagRows].map((r) => ({ tag: String(r.tag), count: Number(r.count) })),
    posts: await getPostsByIds(
      postRows.map((r) => r.id),
      viewerId,
    ),
  };
}

/** Total showcases and likes for one tag. Null-safe: an unused tag returns zeros. */
export async function getTagStats(tag: string): Promise<{ total: number; likes: number }> {
  const [row] = await db
    .select({ n: count(), likes: sql<number>`coalesce(sum(${posts.likeCount}), 0)::int` })
    .from(posts)
    .where(and(eq(posts.hidden, false), arrayContains(posts.tags, [tag])));
  return { total: row?.n ?? 0, likes: Number(row?.likes ?? 0) };
}
