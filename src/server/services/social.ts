import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { comments, follows, notifications, posts, reports, user } from "@/db/schema";
import { ServiceError } from "../errors";
import { newId } from "../ids";
import { assertCommentRate } from "../rate-limit";
import { parseOrThrow } from "../parse";
import { commentInputSchema, idSchema, reportInputSchema } from "../validation";
import { toUserSummary } from "../queries/people";
import type { Comment } from "@/lib/types";

export async function createComment(viewerId: string, raw: unknown): Promise<Comment> {
  const input = parseOrThrow(commentInputSchema, raw);
  await assertCommentRate(viewerId);
  const id = newId();

  const [author] = await db.select().from(user).where(eq(user.id, viewerId)).limit(1);
  if (!author) throw new ServiceError("Your account could not be found. Try signing in again.");

  const row = await db.transaction(async (tx) => {
    const [post] = await tx.select({ authorId: posts.authorId, hidden: posts.hidden }).from(posts).where(eq(posts.id, input.postId)).limit(1);
    if (!post || post.hidden) throw new ServiceError("That post is no longer available.");

    const [inserted] = await tx
      .insert(comments)
      .values({ id, postId: input.postId, authorId: viewerId, body: input.body })
      .returning({ createdAt: comments.createdAt });
    await tx
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, input.postId));
    if (post.authorId !== viewerId) {
      await tx.insert(notifications).values({
        id: newId(),
        recipientId: post.authorId,
        actorId: viewerId,
        type: "comment",
        postId: input.postId,
        text: input.body.slice(0, 200),
      });
    }
    return inserted;
  });

  return {
    id,
    author: toUserSummary(author),
    text: input.body,
    createdAt: row.createdAt.toISOString(),
    canDelete: true,
  };
}

/** The comment's author, or the author of the post it's on, can delete a comment. */
export async function deleteComment(viewerId: string, rawId: string): Promise<void> {
  const id = parseOrThrow(idSchema, rawId);
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ commentId: comments.id, postId: comments.postId, authorId: comments.authorId, postAuthorId: posts.authorId })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(eq(comments.id, id))
      .limit(1);
    if (!row) throw new ServiceError("That comment no longer exists.");
    if (row.authorId !== viewerId && row.postAuthorId !== viewerId) throw new ServiceError("You can't delete that comment.");
    await tx.delete(comments).where(eq(comments.id, id));
    await tx
      .update(posts)
      .set({ commentCount: sql`greatest(${posts.commentCount} - 1, 0)` })
      .where(eq(posts.id, row.postId));
  });
}

export async function toggleFollow(viewerId: string, targetId: string): Promise<{ following: boolean }> {
  if (!targetId || targetId.length > 64) throw new ServiceError("That account could not be found.");
  if (targetId === viewerId) throw new ServiceError("You can't follow yourself.");

  return db.transaction(async (tx) => {
    const [target] = await tx.select({ id: user.id }).from(user).where(eq(user.id, targetId)).limit(1);
    if (!target) throw new ServiceError("That account could not be found.");

    const inserted = await tx
      .insert(follows)
      .values({ followerId: viewerId, followingId: targetId })
      .onConflictDoNothing()
      .returning({ followerId: follows.followerId });

    if (inserted.length) {
      await tx.insert(notifications).values({ id: newId(), recipientId: targetId, actorId: viewerId, type: "follow" });
      return { following: true };
    }

    await tx.delete(follows).where(and(eq(follows.followerId, viewerId), eq(follows.followingId, targetId)));
    await tx.delete(notifications).where(and(eq(notifications.actorId, viewerId), eq(notifications.recipientId, targetId), eq(notifications.type, "follow")));
    return { following: false };
  });
}

/** Reports go to a review queue (the `reports` table). One report per person per post. */
export async function reportPost(viewerId: string, raw: unknown): Promise<void> {
  const input = parseOrThrow(reportInputSchema, raw);
  const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, input.postId)).limit(1);
  if (!post) throw new ServiceError("That post is no longer available.");
  if (post.authorId === viewerId) throw new ServiceError("You can't report your own post.");
  await db
    .insert(reports)
    .values({ id: newId(), reporterId: viewerId, postId: input.postId, reason: input.reason, details: input.details })
    .onConflictDoNothing();
}

export async function markNotificationsRead(viewerId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.recipientId, viewerId), sql`${notifications.readAt} is null`));
}
