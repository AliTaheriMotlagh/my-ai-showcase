import type { FeedPage } from "./types";

type Params = Record<string, string | number | null | undefined>;

export async function fetchFeed(params: Params): Promise<FeedPage> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const res = await fetch(`/api/posts?${sp}`);
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
  return res.json();
}
