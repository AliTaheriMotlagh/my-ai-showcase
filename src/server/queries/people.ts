import "server-only";
import { and, count, desc, eq, exists, inArray, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { follows, posts, profileLinks, user } from "@/db/schema";
import type { ProfileLink, UserProfile, UserSummary } from "@/lib/types";

type UserRow = typeof user.$inferSelect;

export function toUserSummary(row: Pick<UserRow, "id" | "username" | "name" | "headline" | "image" | "verified">): UserSummary {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    headline: row.headline,
    avatar: row.image ?? null,
    verified: row.verified,
  };
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const [row] = await db
    .select()
    .from(user)
    .where(sql`lower(${user.username}) = ${username.toLowerCase()}`)
    .limit(1);
  if (!row) return null;

  const [[followers], [following], [postTotals]] = await Promise.all([
    db.select({ n: count() }).from(follows).where(eq(follows.followingId, row.id)),
    db.select({ n: count() }).from(follows).where(eq(follows.followerId, row.id)),
    db
      .select({
        posts: count(),
        likes: sql<number>`coalesce(sum(${posts.likeCount}), 0)::int`,
      })
      .from(posts)
      .where(and(eq(posts.authorId, row.id), eq(posts.hidden, false))),
  ]);

  return {
    ...toUserSummary(row),
    bio: row.bio,
    location: row.location,
    website: row.website,
    tools: row.tools,
    banner: row.banner ?? null,
    followers: followers.n,
    following: following.n,
    posts: postTotals.posts,
    likes: Number(postTotals.likes),
    joinedAt: row.createdAt.toISOString(),
  };
}

export async function getProfileLinks(userId: string): Promise<ProfileLink[]> {
  const rows = await db
    .select({ id: profileLinks.id, title: profileLinks.title, url: profileLinks.url, clicks: profileLinks.clicks })
    .from(profileLinks)
    .where(eq(profileLinks.userId, userId))
    .orderBy(profileLinks.position);
  return rows;
}

export async function isFollowing(viewerId: string | null, targetId: string): Promise<boolean> {
  if (!viewerId) return false;
  const [row] = await db
    .select({ id: follows.followerId })
    .from(follows)
    .where(and(eq(follows.followerId, viewerId), eq(follows.followingId, targetId)))
    .limit(1);
  return !!row;
}

/** Creators with at least one public post, most-followed first. Used for "Suggested" and the stories row. */
export async function getTopCreators(opts: { limit: number; viewerId?: string | null; excludeFollowedBy?: string | null }): Promise<UserSummary[]> {
  const conditions = [
    exists(db.select({ one: sql`1` }).from(posts).where(and(eq(posts.authorId, user.id), eq(posts.hidden, false)))),
  ];
  if (opts.viewerId) conditions.push(ne(user.id, opts.viewerId));
  if (opts.excludeFollowedBy) {
    const followed = db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, opts.excludeFollowedBy));
    conditions.push(notInArray(user.id, followed));
  }
  const followerCount = sql<number>`(select count(*) from ${follows} where ${follows.followingId} = ${user.id})`;
  const rows = await db
    .select()
    .from(user)
    .where(and(...conditions))
    .orderBy(desc(followerCount), desc(user.createdAt))
    .limit(opts.limit);
  return rows.map(toUserSummary);
}

/** Summary rows for a set of ids, keyed by id. */
export async function summariesById(ids: string[]): Promise<Map<string, UserSummary>> {
  if (!ids.length) return new Map();
  const rows = await db.select().from(user).where(inArray(user.id, ids));
  return new Map(rows.map((r) => [r.id, toUserSummary(r)]));
}

/** Full row for the signed-in user's settings page. Includes email, so never send this to another user. */
export async function getOwnAccount(userId: string) {
  const [row] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return row ?? null;
}
