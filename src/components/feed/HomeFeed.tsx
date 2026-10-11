"use client";

import { Clapperboard, Compass, Sparkles, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { PostCard } from "@/components/post/PostCard";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { fetchFeed } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { actions, useAppStore, useHydrated } from "@/lib/store";
import type { FeedPost } from "@/lib/types";
import { FeedFooter } from "./FeedFooter";

type Tab = "foryou" | "following";

export function HomeFeed({ initial, initialCursor, children }: { initial: FeedPost[]; initialCursor: number | null; children?: ReactNode }) {
  const [tab, setTab] = useState<Tab>("foryou");
  const following = useAppStore((s) => s.following);
  const localPosts = useAppStore((s) => s.posts);
  const welcomeDismissed = useAppStore((s) => s.welcomeDismissed);
  const hydrated = useHydrated();
  const authors = useMemo(() => Object.keys(following).sort().join(","), [following]);

  const fetchPage = useCallback(
    (cursor: number) => fetchFeed({ feed: tab, cursor, limit: 8, authors: tab === "following" ? authors : undefined }),
    [tab, authors],
  );
  const feed = useInfiniteFeed({
    key: tab === "foryou" ? "foryou" : `following:${authors}`,
    fetchPage,
    initial: { items: initial, nextCursor: initialCursor },
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

      {hydrated && !welcomeDismissed && <WelcomeCard />}

      <div className="flex flex-col sm:gap-5 sm:pt-2">
        {tab === "foryou" && localPosts.map((p) => <PostCard key={p.id} post={p} />)}
        {feed.items.map((p, i) => (
          <PostCard key={`${p.id}:${i}`} post={p} />
        ))}
      </div>

      <FeedFooter
        {...feed}
        empty={
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
            <UserPlus className="size-10 text-muted" aria-hidden />
            <h2 className="text-lg font-semibold">Your Following feed is empty</h2>
            <p className="text-sm text-muted">Follow creators you love and their newest work will show up here.</p>
            <Link href="/explore" className="mt-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg">
              Find creators
            </Link>
          </div>
        }
      />
    </>
  );
}

function WelcomeCard() {
  return (
    <section aria-label={`Welcome to ${site.name}`} className="relative mx-3 my-4 overflow-hidden rounded-2xl bg-brand p-[1px] sm:mx-0">
      <div className="relative rounded-[15px] bg-card p-5">
        <button
          type="button"
          aria-label="Dismiss"
          onClick={actions.dismissWelcome}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted hover:bg-elevated hover:text-fg"
        >
          <X className="size-4" />
        </button>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-4" aria-hidden /> Welcome to {site.name}
        </p>
        <h2 className="mt-2 pr-8 font-display text-3xl leading-tight">Everything made with AI, in one endless feed.</h2>
        <p className="mt-2 text-sm text-muted">
          Images, video, music, writing, code, data and 3D. Double-tap to like, copy any prompt, and remix it with credit.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/create" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Share your first creation
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
