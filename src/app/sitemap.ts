import type { MetadataRoute } from "next";
import { KINDS } from "@/lib/kinds";
import { absoluteUrl } from "@/lib/site";
import { getTagsForSitemap } from "@/server/queries/discover";
import { getSitemapPosts, getSitemapUsernames } from "@/server/queries/sitemap";

/** Built per request from the database, so new posts and creators appear without a redeploy. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [posts, usernames, tags] = await Promise.all([getSitemapPosts(5000), getSitemapUsernames(5000), getTagsForSitemap(1000)]);
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/explore"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/flow"), lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/search"), lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: absoluteUrl("/signup"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...KINDS.map((k) => ({ url: absoluteUrl(`/explore?kind=${k.id}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...usernames.map((u) => ({ url: absoluteUrl(`/u/${u.username}`), lastModified: u.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/p/${p.id}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...tags.map((t) => ({ url: absoluteUrl(`/tags/${encodeURIComponent(t)}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.5 })),
  ];
}
