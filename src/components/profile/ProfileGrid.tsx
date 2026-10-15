"use client";

import { useCallback } from "react";
import { FeedFooter } from "@/components/feed/FeedFooter";
import { TileGrid } from "@/components/post/ExploreTile";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { fetchFeed } from "@/lib/api-client";
import type { FeedKind, FeedPage, PostKind } from "@/lib/types";

/**
 * Infinite grid for a profile tab. The first page comes from the server, so it renders without waiting,
 * and later pages come from /api/posts with the same filters.
 */
export function ProfileGrid({
  feed,
  username,
  kind,
  initial,
  emptyText,
}: {
  feed: Extract<FeedKind, "user" | "saved" | "liked">;
  username?: string;
  kind: PostKind | null;
  initial: FeedPage;
  emptyText: string;
}) {
  const key = `${feed}:${username ?? ""}:${kind ?? ""}`;
  const fetchPage = useCallback(
    (cursor: number) => fetchFeed({ feed, user: username, kind, cursor, limit: 24 }),
    [feed, username, kind],
  );
  const grid = useInfiniteFeed({ key, fetchPage, initial });

  return (
    <>
      {grid.items.length > 0 && <TileGrid posts={grid.items} />}
      <FeedFooter
        {...grid}
        endLabel=""
        empty={<p className="py-16 text-center text-sm text-muted">{emptyText}</p>}
      />
    </>
  );
}
