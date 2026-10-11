import { NextResponse, type NextRequest } from "next/server";
import { getFeedPage } from "@/lib/data";
import { isKind } from "@/lib/kinds";
import type { FeedKind } from "@/lib/types";

const FEEDS: FeedKind[] = ["foryou", "following", "explore", "latest", "user", "tag", "ids"];

const num = (v: string | null, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const list = (v: string | null, max: number) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, max) : [];

/** GET /api/posts?feed=foryou|following|explore|latest|user|tag|ids&cursor=&limit=&seed=&kind=&authors=&user=&tag=&ids= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const feed = sp.get("feed") ?? "foryou";
  if (!FEEDS.includes(feed as FeedKind)) return NextResponse.json({ error: "Unknown feed" }, { status: 400 });
  const kind = sp.get("kind");

  const page = getFeedPage({
    feed: feed as FeedKind,
    cursor: num(sp.get("cursor"), 0, 0, 100_000),
    limit: num(sp.get("limit"), 12, 1, 30),
    seed: num(sp.get("seed"), 1, 0, 2 ** 31 - 1),
    kind: isKind(kind) ? kind : null,
    authors: list(sp.get("authors"), 500),
    user: sp.get("user") ?? undefined,
    tag: sp.get("tag") ?? undefined,
    ids: list(sp.get("ids"), 100),
  });

  return NextResponse.json(page, { headers: { "Cache-Control": "private, max-age=30" } });
}
