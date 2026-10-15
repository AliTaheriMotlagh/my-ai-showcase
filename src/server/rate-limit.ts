import "server-only";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { ServiceError } from "./errors";

/**
 * Database-backed limits, so they hold across serverless instances. Checked against rows we already store,
 * which means there is no separate counter table to keep in sync.
 */
export async function assertPostRate(authorId: string): Promise<void> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(posts)
    .where(and(eq(posts.authorId, authorId), gt(posts.createdAt, since)));
  if ((row?.n ?? 0) >= 30) throw new ServiceError("You're posting quickly. Try again in a little while.");
}

export async function assertCommentRate(authorId: string): Promise<void> {
  const since = new Date(Date.now() - 60 * 1000);
  const [row] = await db
    .select({ n: count() })
    .from(comments)
    .where(and(eq(comments.authorId, authorId), gt(comments.createdAt, since)));
  if ((row?.n ?? 0) >= 15) throw new ServiceError("Slow down a little — try again in a minute.");
}
