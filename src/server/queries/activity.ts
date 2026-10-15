import "server-only";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { comments, notifications, posts, user } from "@/db/schema";
import type { AppNotification, Comment } from "@/lib/types";
import { toUserSummary } from "./people";

/** Oldest first, like most feeds show conversations. Capped so one busy post can't stall the page. */
export async function getComments(postId: string, viewerId: string | null, limit = 200): Promise<Comment[]> {
  const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, postId)).limit(1);
  const rows = await db
    .select({ comment: comments, author: user })
    .from(comments)
    .innerJoin(user, eq(comments.authorId, user.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt))
    .limit(limit);
  return rows.map(({ comment, author }) => ({
    id: comment.id,
    author: toUserSummary(author),
    text: comment.body,
    createdAt: comment.createdAt.toISOString(),
    canDelete: !!viewerId && (viewerId === comment.authorId || viewerId === post?.authorId),
  }));
}

export async function getNotifications(userId: string, limit = 60): Promise<AppNotification[]> {
  // The day/week grouping is computed in SQL, so it uses the database clock and the page itself stays pure.
  const group = sql<"today" | "week" | "earlier">`case
    when ${notifications.createdAt} > now() - interval '1 day' then 'today'
    when ${notifications.createdAt} > now() - interval '7 days' then 'week'
    else 'earlier' end`;
  const rows = await db
    .select({ n: notifications, actor: user, group, post: { id: posts.id, title: posts.title, media: posts.media, hidden: posts.hidden } })
    .from(notifications)
    .innerJoin(user, eq(notifications.actorId, user.id))
    .leftJoin(posts, eq(notifications.postId, posts.id))
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map(({ n, actor, group: when, post }) => ({
    id: n.id,
    type: n.type,
    group: when,
    createdAt: n.createdAt.toISOString(),
    read: !!n.readAt,
    actor: toUserSummary(actor),
    post: post && !post.hidden ? { id: post.id, title: post.title, thumb: post.media.find((m) => m.type === "image")?.url ?? null } : null,
    text: n.text,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.recipientId, userId), isNull(notifications.readAt)));
  return row?.n ?? 0;
}
