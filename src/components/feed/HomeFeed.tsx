"use client";

import { Clapperboard, Compass, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { PostCard } from "@/components/post/PostCard";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { fetchFeed } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import type { FeedPost } from "@/lib/types";
import { FeedFooter } from "./FeedFooter";

type Tab = "foryou" | "following";

export function HomeFeed({
  initial,
  initialCursor,
  signedIn,
  children,
}: {
  initial: FeedPost[];
  initialCursor: number | null;
  signedIn: boolean;
  children?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("foryou");
  const fetchPage = useCallback((cursor: number) => fetchFeed({ feed: tab, cursor, limit: 8 }), [tab]);
  const feed = useInfiniteFeed({
    key: tab,
    fetchPage,
    initial: tab === "foryou" ? { items: initial, nextCursor: initialCursor } : undefined,
  });

  return (
    <>
      <div role="tablist" aria-label="Feed" className="sticky top-14 z-20 grid grid-cols-2 border-b border-line bg-bg/85 backdrop-blur-xl md:top-0">
        {(
          [
            ["foryou", "For you"],
            ["following", "Following"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn("relative h-12 text-[15px] font-medium transition-colors hover:bg-elevated/60", tab === id ? "text-fg" : "text-muted")}
          >
            {label}
            {tab === id && <span className="absolute inset-x-0 bottom-0 mx-auto h-1 w-14 rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      {children}

      {!signedIn && <WelcomeCard />}

      {tab === "following" && !signedIn ? (
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
          <UserPlus className="size-10 text-muted" aria-hidden />
          <h2 className="text-lg font-semibold">Log in to see creators you follow</h2>
          <Link href="/login?next=/" className="mt-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
            Log in
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:gap-5 sm:pt-2">
            {feed.items.map((p, i) => (
              <PostCard key={`${p.id}:${i}`} post={p} />
            ))}
          </div>
          <FeedFooter
            {...feed}
            empty={
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
                <UserPlus className="size-10 text-muted" aria-hidden />
                <h2 className="text-lg font-semibold">{tab === "following" ? "Nothing from people you follow yet" : "No showcases yet"}</h2>
                <p className="text-sm text-muted">
                  {tab === "following"
                    ? "Follow creators you love and their newest work will show up here."
                    : "Be the first to share something you made with AI."}
                </p>
                <Link href={tab === "following" ? "/explore" : "/create"} className="mt-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
                  {tab === "following" ? "Find creators" : "Create a showcase"}
                </Link>
              </div>
            }
          />
        </>
      )}
    </>
  );
}

function WelcomeCard() {
  return (
    <section aria-label={`Welcome to ${site.name}`} className="relative mx-3 my-4 overflow-hidden rounded-2xl bg-brand p-[1px] sm:mx-0">
      <div className="relative rounded-[15px] bg-card p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-4" aria-hidden /> Welcome to {site.name}
        </p>
        <h2 className="mt-2 pr-8 font-display text-3xl leading-tight">Everything made with AI, in one feed.</h2>
        <p className="mt-2 text-sm text-muted">
          Images, video, music, writing, code, data and 3D. Share your work with its prompt, and build a profile that works as a portfolio and link page.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/signup" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Create an account
          </Link>
          <Link href="/flow" className="inline-flex items-center gap-1.5 rounded-full bg-elevated px-4 py-2 text-sm font-semibold hover:bg-line">
            <Clapperboard className="size-4" aria-hidden /> Open Flow
          </Link>
          <Link href="/explore" className="inline-flex items-center gap-1.5 rounded-full bg-elevated px-4 py-2 text-sm font-semibold hover:bg-line">
            <Compass className="size-4" aria-hidden /> Explore
          </Link>
        </div>
      </div>
    </section>
  );
}
