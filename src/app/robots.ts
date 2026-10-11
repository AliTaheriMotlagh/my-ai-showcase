import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/me", "/create", "/notifications"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
