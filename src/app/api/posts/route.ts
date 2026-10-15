import { NextResponse, type NextRequest } from "next/server";
import { getFeedPage } from "@/server/queries/posts";
import { isKind } from "@/lib/kinds";
import type { FeedKind } from "@/lib/types";
import { getViewer } from "@/server/session";

const FEEDS: FeedKind[] = ["foryou", "following", "explore", "latest", "user", "tag", "saved", "liked"];

const int = (v: string | null, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/**
 * GET /api/posts?feed=foryou|following|explore|latest|user|tag|saved|liked&cursor=&limit=&seed=&kind=&user=&tag=
 * Public feeds work without a session. `following`, `saved` and `liked` need one and return empty otherwise.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const feed = sp.get("feed") ?? "foryou";
  if (!FEEDS.includes(feed as FeedKind)) return NextResponse.json({ error: "Unknown feed" }, { status: 400 });

  const kind = sp.get("kind");
  const username = sp.get("user")?.slice(0, 40) ?? undefined;
  const tag = sp.get("tag")?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30) ?? undefined;
  const viewer = await getViewer();

  const page = await getFeedPage({
    feed: feed as FeedKind,
    viewerId: viewer?.id ?? null,
    cursor: int(sp.get("cursor"), 0, 0, 1_000_000),
    limit: int(sp.get("limit"), 12, 1, 30),
    seed: int(sp.get("seed"), 1, 0, 2 ** 31 - 1),
    kind: isKind(kind) ? kind : null,
    user: username,
    tag,
  });

  // Viewer-specific flags are in the body, so responses must never be cached publicly.
  return NextResponse.json(page, { headers: { "Cache-Control": "private, no-store" } });
}
