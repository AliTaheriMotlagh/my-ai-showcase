import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, user } from "@/db/schema";

/** Public posts for the sitemap, newest first. */
export async function getSitemapPosts(limit: number) {
  const rows = await db
    .select({ id: posts.id, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.hidden, false))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  return rows;
}

/** Creators with at least one public post. Profiles without content are not indexable. */
export async function getSitemapUsernames(limit: number) {
  const rows = await db
    .select({ username: user.username, updatedAt: user.updatedAt })
    .from(user)
    .where(sql`exists (select 1 from ${posts} where ${posts.authorId} = ${user.id} and ${posts.hidden} = false)`)
    .orderBy(desc(user.updatedAt))
    .limit(limit);
  return rows;
}
