import "server-only";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, profileLinks, user } from "@/db/schema";
import { LIMITS, normalizeTools, normalizeUrl, usernameError } from "@/lib/rules";
import type { ProfileLink } from "@/lib/types";
import { ServiceError } from "../errors";
import { deleteBlobs, isBlobUrl } from "../media";
import { newId } from "../ids";
import { parseOrThrow } from "../parse";
import { idSchema, linkInputSchema, profileInputSchema } from "../validation";

export async function updateProfile(viewerId: string, raw: unknown): Promise<void> {
  const input = parseOrThrow(profileInputSchema, raw);

  const problem = usernameError(input.username);
  if (problem) throw new ServiceError(problem);

  let website = "";
  if (input.website) {
    const normalized = normalizeUrl(input.website);
    if (!normalized) throw new ServiceError("Enter a valid website, such as example.com.");
    website = normalized;
  }

  const username = input.username.toLowerCase();
  const [taken] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(sql`lower(${user.username}) = ${username}`, ne(user.id, viewerId)))
    .limit(1);
  if (taken) throw new ServiceError("That username is taken.");

  const [current] = await db.select({ image: user.image, banner: user.banner }).from(user).where(eq(user.id, viewerId)).limit(1);
  if (!current) throw new ServiceError("Your account could not be found. Try signing in again.");

  await db
    .update(user)
    .set({
      name: input.name,
      username,
      headline: input.headline,
      bio: input.bio,
      location: input.location,
      website,
      tools: normalizeTools(input.tools),
      image: input.avatar,
      banner: input.banner,
      updatedAt: new Date(),
    })
    .where(eq(user.id, viewerId));

  // Replaced images are removed from storage so orphaned files don't pile up.
  const replaced = [current.image, current.banner].filter(
    (url): url is string => !!url && isBlobUrl(url) && url !== input.avatar && url !== input.banner,
  );
  await deleteBlobs(replaced);
}

async function orderedLinks(userId: string) {
  return db
    .select({ id: profileLinks.id, title: profileLinks.title, url: profileLinks.url, clicks: profileLinks.clicks })
    .from(profileLinks)
    .where(eq(profileLinks.userId, userId))
    .orderBy(asc(profileLinks.position), asc(profileLinks.createdAt));
}

/** Writes positions as 0..n-1 so the order stays contiguous after deletes and moves. */
async function renumber(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], userId: string) {
  const rows = await tx
    .select({ id: profileLinks.id })
    .from(profileLinks)
    .where(eq(profileLinks.userId, userId))
    .orderBy(asc(profileLinks.position), asc(profileLinks.createdAt));
  for (const [index, row] of rows.entries()) {
    await tx.update(profileLinks).set({ position: index }).where(eq(profileLinks.id, row.id));
  }
}

export async function listLinks(userId: string): Promise<ProfileLink[]> {
  return orderedLinks(userId);
}

export async function addLink(viewerId: string, raw: unknown): Promise<ProfileLink[]> {
  const input = parseOrThrow(linkInputSchema, raw);
  const url = normalizeUrl(input.url);
  if (!url) throw new ServiceError("Enter a valid link, such as https://example.com.");

  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: profileLinks.id }).from(profileLinks).where(eq(profileLinks.userId, viewerId));
    if (existing.length >= LIMITS.links) throw new ServiceError(`You can add up to ${LIMITS.links} links.`);
    await tx.insert(profileLinks).values({ id: newId(), userId: viewerId, title: input.title, url, position: existing.length });
  });
  return orderedLinks(viewerId);
}

export async function updateLink(viewerId: string, rawId: string, raw: unknown): Promise<ProfileLink[]> {
  const id = parseOrThrow(idSchema, rawId);
  const input = parseOrThrow(linkInputSchema, raw);
  const url = normalizeUrl(input.url);
  if (!url) throw new ServiceError("Enter a valid link, such as https://example.com.");
  const updated = await db
    .update(profileLinks)
    .set({ title: input.title, url })
    .where(and(eq(profileLinks.id, id), eq(profileLinks.userId, viewerId)))
    .returning({ id: profileLinks.id });
  if (!updated.length) throw new ServiceError("That link could not be found.");
  return orderedLinks(viewerId);
}

export async function deleteLink(viewerId: string, rawId: string): Promise<ProfileLink[]> {
  const id = parseOrThrow(idSchema, rawId);
  await db.transaction(async (tx) => {
    await tx.delete(profileLinks).where(and(eq(profileLinks.id, id), eq(profileLinks.userId, viewerId)));
    await renumber(tx, viewerId);
  });
  return orderedLinks(viewerId);
}

export async function moveLink(viewerId: string, rawId: string, direction: "up" | "down"): Promise<ProfileLink[]> {
  const id = parseOrThrow(idSchema, rawId);
  await db.transaction(async (tx) => {
    await renumber(tx, viewerId);
    const rows = await tx
      .select({ id: profileLinks.id, position: profileLinks.position })
      .from(profileLinks)
      .where(eq(profileLinks.userId, viewerId))
      .orderBy(asc(profileLinks.position));
    const index = rows.findIndex((r) => r.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= rows.length) return;
    const [a, b] = [rows[index], rows[target]];
    await tx.update(profileLinks).set({ position: b.position }).where(eq(profileLinks.id, a.id));
    await tx.update(profileLinks).set({ position: a.position }).where(eq(profileLinks.id, b.id));
  });
  return orderedLinks(viewerId);
}

/** Counts a click and returns the destination. Null if the link doesn't exist. */
export async function recordLinkClick(rawId: string): Promise<string | null> {
  const parsed = idSchema.safeParse(rawId);
  if (!parsed.success) return null;
  const [row] = await db
    .update(profileLinks)
    .set({ clicks: sql`${profileLinks.clicks} + 1` })
    .where(eq(profileLinks.id, parsed.data))
    .returning({ url: profileLinks.url });
  return row?.url ?? null;
}

/** Every uploaded file a user owns, so account deletion can remove them from storage. */
export async function collectAccountBlobs(userId: string): Promise<string[]> {
  const [account] = await db.select({ image: user.image, banner: user.banner }).from(user).where(eq(user.id, userId)).limit(1);
  const mine = await db.select({ media: posts.media }).from(posts).where(eq(posts.authorId, userId));
  return [account?.image, account?.banner, ...mine.flatMap((p) => p.media.map((m) => m.url))].filter(
    (url): url is string => !!url && isBlobUrl(url),
  );
}
