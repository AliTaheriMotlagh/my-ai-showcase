import type { MetadataRoute } from "next";
import { getAllTags, posts, users } from "@/lib/data";
import { KINDS } from "@/lib/kinds";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/explore"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/flow"), lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/search"), lastModified: now, changeFrequency: "daily", priority: 0.5 },
    ...KINDS.map((k) => ({ url: absoluteUrl(`/explore?kind=${k.id}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...users.map((u) => ({ url: absoluteUrl(`/u/${u.username}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/p/${p.id}`), lastModified: new Date(p.createdAt), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...getAllTags()
      .filter((t) => t.count > 1)
      .map((t) => ({ url: absoluteUrl(`/tags/${encodeURIComponent(t.tag)}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.5 })),
  ];
}
