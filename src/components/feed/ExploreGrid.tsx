"use client";

import { useCallback, useMemo } from "react";
import { ExploreTile } from "@/components/post/ExploreTile";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { fetchFeed } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { FeedPost, PostKind } from "@/lib/types";
import { FeedFooter } from "./FeedFooter";

const BLOCK = 5;

/**
 * Endless, randomly ordered mosaic. Posts are laid out in self-contained blocks of
 * five (one tall tile + four squares, alternating sides), so appending a page never
 * reshuffles tiles that are already on screen.
 */
export function ExploreGrid({
  initial,
  initialCursor,
  seed,
  kind,
}: {
  initial: FeedPost[];
  initialCursor: number | null;
  seed: number;
  kind: PostKind | null;
}) {
  const fetchPage = useCallback((cursor: number) => fetchFeed({ feed: "explore", seed, kind, cursor, limit: 15 }), [seed, kind]);
  const feed = useInfiniteFeed({ key: `${seed}:${kind}`, fetchPage, initial: { items: initial, nextCursor: initialCursor } });
  const blocks = useMemo(() => {
    const out: FeedPost[][] = [];
    for (let i = 0; i < feed.items.length; i += BLOCK) out.push(feed.items.slice(i, i + BLOCK));
    return out;
  }, [feed.items]);

  return (
    <>
      <div className="flex flex-col gap-0.5 sm:gap-1.5">
        {blocks.map((block, bi) => {
          const full = block.length === BLOCK;
          const tall = full ? Math.max(0, block.findIndex((p) => p.kind === "video" || p.kind === "3d" || p.aspect === "portrait")) : -1;
          return (
            <div key={bi} className="grid grid-flow-dense grid-cols-3 gap-0.5 sm:gap-1.5">
              {block.map((p, i) => (
                <div
                  key={`${p.id}:${i}`}
                  className={cn(
                    "relative overflow-hidden sm:rounded-lg",
                    i === tall ? cn("row-span-2 row-start-1", bi % 2 ? "col-start-1" : "col-start-3") : "aspect-square",
                  )}
                >
                  <ExploreTile post={p} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <FeedFooter {...feed} />
    </>
  );
}
