import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, postLikes, postSaves, posts } from "@/db/schema";
import { normalizeTags } from "@/lib/rules";
import { ServiceError } from "../errors";
import { deleteBlobs } from "../media";
import { assertPostRate } from "../rate-limit";
import { newId } from "../ids";
import { parseOrThrow } from "../parse";
import { idSchema, postInputSchema, type PostInput } from "../validation";

/** Only the spec that matches the kind is stored, so the payload stays small and unambiguous. */
function specFor(input: PostInput) {
  switch (input.kind) {
    case "text":
      return { text: input.text };
    case "code":
      return { code: input.code };
    case "chat":
      return { chat: input.chat };
    case "chart":
      return { chart: input.chart };
    default:
      return {};
  }
}

export async function createPost(viewerId: string, raw: unknown): Promise<{ id: string }> {
  const input = parseOrThrow(postInputSchema, raw);
  await assertPostRate(viewerId);

  const id = newId();
  await db.transaction(async (tx) => {
    if (input.remixOfId) {
      const [parent] = await tx
        .select({ id: posts.id, authorId: posts.authorId, hidden: posts.hidden })
        .from(posts)
        .where(eq(posts.id, input.remixOfId))
        .limit(1);
      if (!parent || parent.hidden) throw new ServiceError("The post you're remixing is no longer available.");
      await tx
        .update(posts)
        .set({ remixCount: sql`${posts.remixCount} + 1` })
        .where(eq(posts.id, parent.id));
      if (parent.authorId !== viewerId) {
        await tx.insert(notifications).values({ id: newId(), recipientId: parent.authorId, actorId: viewerId, type: "remix", postId: parent.id });
      }
    }

    await tx.insert(posts).values({
      id,
      authorId: viewerId,
      kind: input.kind,
      title: input.title,
      caption: input.caption,
      prompt: input.prompt,
      model: input.model,
      tags: normalizeTags(input.tags),
      aspect: input.aspect,
      media: input.media.map((m) => ({ ...m, width: m.width ?? null, height: m.height ?? null, duration: m.duration ?? null })),
      spec: specFor(input),
      remixOfId: input.remixOfId ?? null,
    });
  });
  return { id };
}

/** Only the author can delete. Removes the row first, then the uploaded files (best effort). */
export async function deletePost(viewerId: string, rawId: string): Promise<void> {
  const id = parseOrThrow(idSchema, rawId);
  const [post] = await db.select({ authorId: posts.authorId, media: posts.media }).from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) throw new ServiceError("That post no longer exists.");
  if (post.authorId !== viewerId) throw new ServiceError("You can only delete your own posts.");
  await db.delete(posts).where(eq(posts.id, id));
  await deleteBlobs(post.media.map((m) => m.url));
}

export async function toggleLike(viewerId: string, rawId: string): Promise<{ liked: boolean; likeCount: number }> {
  const postId = parseOrThrow(idSchema, rawId);
  return db.transaction(async (tx) => {
    const [post] = await tx.select({ authorId: posts.authorId, hidden: posts.hidden }).from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post || post.hidden) throw new ServiceError("That post is no longer available.");

    const inserted = await tx
      .insert(postLikes)
      .values({ userId: viewerId, postId })
      .onConflictDoNothing()
      .returning({ postId: postLikes.postId });

    if (inserted.length) {
      const [row] = await tx
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} + 1` })
        .where(eq(posts.id, postId))
        .returning({ likeCount: posts.likeCount });
      if (post.authorId !== viewerId) {
        await tx.insert(notifications).values({ id: newId(), recipientId: post.authorId, actorId: viewerId, type: "like", postId });
      }
      return { liked: true, likeCount: row.likeCount };
    }

    await tx.delete(postLikes).where(and(eq(postLikes.userId, viewerId), eq(postLikes.postId, postId)));
    // Removing the like also removes its notification, so liking and unliking doesn't spam the author.
    await tx
      .delete(notifications)
      .where(and(eq(notifications.actorId, viewerId), eq(notifications.postId, postId), eq(notifications.type, "like")));
    const [row] = await tx
      .update(posts)
      .set({ likeCount: sql`greatest(${posts.likeCount} - 1, 0)` })
      .where(eq(posts.id, postId))
      .returning({ likeCount: posts.likeCount });
    return { liked: false, likeCount: row.likeCount };
  });
}

export async function toggleSave(viewerId: string, rawId: string): Promise<{ saved: boolean; saveCount: number }> {
  const postId = parseOrThrow(idSchema, rawId);
  return db.transaction(async (tx) => {
    const [post] = await tx.select({ hidden: posts.hidden }).from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post || post.hidden) throw new ServiceError("That post is no longer available.");

    const inserted = await tx
      .insert(postSaves)
      .values({ userId: viewerId, postId })
      .onConflictDoNothing()
      .returning({ postId: postSaves.postId });

    if (inserted.length) {
      const [row] = await tx
        .update(posts)
        .set({ saveCount: sql`${posts.saveCount} + 1` })
        .where(eq(posts.id, postId))
        .returning({ saveCount: posts.saveCount });
      return { saved: true, saveCount: row.saveCount };
    }

    await tx.delete(postSaves).where(and(eq(postSaves.userId, viewerId), eq(postSaves.postId, postId)));
    const [row] = await tx
      .update(posts)
      .set({ saveCount: sql`greatest(${posts.saveCount} - 1, 0)` })
      .where(eq(posts.id, postId))
      .returning({ saveCount: posts.saveCount });
    return { saved: false, saveCount: row.saveCount };
  });
}

/** Counts a view once per page load. Good enough for ranking; not a precise analytics figure. */
export async function recordView(rawId: string): Promise<void> {
  const postId = parseOrThrow(idSchema, rawId);
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, postId));
}
