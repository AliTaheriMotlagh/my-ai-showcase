"use client";

import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/primitives";
import type { InfiniteFeed } from "@/hooks/useInfiniteFeed";

type Props = Pick<InfiniteFeed, "items" | "error" | "done" | "retry" | "attachSentinel"> & {
  empty?: ReactNode;
  endLabel?: string;
};

export function FeedFooter({ items, error, done, retry, attachSentinel, empty, endLabel = "You're all caught up ✨" }: Props) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted">
        <p>Couldn&apos;t load more right now.</p>
        <button type="button" onClick={retry} className="rounded-full bg-elevated px-4 py-2 font-semibold text-fg hover:bg-line">
          Try again
        </button>
      </div>
    );
  }
  if (done) {
    if (items.length === 0) return <>{empty}</>;
    return <p className="py-10 text-center text-sm text-muted">{endLabel}</p>;
  }
  return (
    <div ref={attachSentinel} className="flex justify-center py-10">
      <Spinner />
    </div>
  );
}
