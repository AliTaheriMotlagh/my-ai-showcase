"use client";

import { ChevronDown, ChevronUp, Repeat2, Sparkles, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Artwork } from "@/components/art/Artwork";
import { Avatar } from "@/components/art/Avatar";
import { PostMedia } from "@/components/media/PostMedia";
import { DoubleTap } from "@/components/post/DoubleTap";
import { PostActions } from "@/components/post/PostActions";
import { CopyButton, FollowButton } from "@/components/ui/client-bits";
import { Spinner, VerifiedBadge } from "@/components/ui/primitives";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { fetchFeed } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { KIND_MAP, VISUAL_KINDS } from "@/lib/kinds";
import { profileHref } from "@/lib/links";
import { actions, useAppStore } from "@/lib/store";
import type { FeedPost } from "@/lib/types";

/** Items further than this from the active one render as empty placeholders to keep the DOM light. */
const WINDOW = 2;

export function FlowViewer({
  initial,
  initialCursor,
  seed,
  user,
}: {
  initial: FeedPost[];
  initialCursor: number | null;
  seed: number;
  user?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const fetchPage = useCallback(
    (cursor: number) =>
      fetchFeed(user ? { feed: "user", user, cursor, limit: 6 } : { feed: "explore", seed, cursor, limit: 6 }),
    [user, seed],
  );
  const feed = useInfiniteFeed({ key: user ? `u:${user}` : `ex:${seed}`, fetchPage, initial: { items: initial, nextCursor: initialCursor } });
  const { items, loadMore } = feed;

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll<HTMLElement>("[data-index]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (active >= items.length - 3) loadMore();
  }, [active, items.length, loadMore]);

  const go = useCallback((dir: 1 | -1) => {
    const root = scroller.current;
    root?.scrollBy({ top: dir * root.clientHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "l" && items[active]) {
        actions.toggleLike(items[active].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, active, items]);

  return (
    <div className="relative bg-black text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 md:hidden">
        <span className="flex items-center gap-1.5 text-lg font-semibold drop-shadow">
          <Sparkles className="size-5" aria-hidden /> {user ? `@${user}` : "Flow"}
        </span>
      </div>

      <div
        ref={scroller}
        className="flow-h no-scrollbar snap-y snap-mandatory overflow-y-scroll overscroll-y-contain"
        aria-label="Flow — vertical feed. Use arrow keys or J and K to move, L to like."
        tabIndex={-1}
      >
        {items.map((post, i) => (
          <section
            key={`${post.id}:${i}`}
            data-index={i}
            aria-label={`${post.title} by @${post.author.username}`}
            className="relative h-full w-full snap-start snap-always"
          >
            {Math.abs(i - active) <= WINDOW ? <FlowItem post={post} active={i === active} /> : null}
          </section>
        ))}
        <section className="flex h-full snap-start flex-col items-center justify-center gap-4 p-8 text-center">
          {feed.done ? (
            <>
              <p className="text-lg font-semibold">You&apos;re all caught up</p>
              <Link href="/flow" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                Keep scrolling everything
              </Link>
            </>
          ) : feed.error ? (
            <button type="button" onClick={feed.retry} className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold">
              Couldn&apos;t load — try again
            </button>
          ) : (
            <Spinner className="border-white/20 border-t-white" />
          )}
        </section>
      </div>

      <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button type="button" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30">
          <ChevronUp className="size-5" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}

function FlowItem({ post, active }: { post: FeedPost; active: boolean }) {
  const liked = useAppStore((s) => !!s.liked[post.id]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const visual = VISUAL_KINDS.includes(post.kind);
  const meta = KIND_MAP[post.kind];

  return (
    <div className="flex h-full w-full items-center justify-center md:gap-5 md:py-4">
      <div className="relative h-full w-full overflow-hidden bg-neutral-950 md:aspect-[9/16] md:w-auto md:max-w-full md:rounded-2xl">
        <DoubleTap className="h-full w-full" onDoubleTap={() => !liked && actions.toggleLike(post.id)}>
          {visual ? (
            <PostMedia post={post} variant="full" active={active} />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center p-4 pb-40 pt-16 md:pb-36">
              <div className="absolute inset-0 scale-110 opacity-60 blur-2xl">
                <Artwork visual={post.visuals[0]} grain={false} />
              </div>
              <div className="relative max-h-full w-full max-w-md overflow-hidden rounded-2xl text-fg shadow-2xl">
                <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto">
                  <PostMedia post={post} variant="full" active={active} />
                </div>
              </div>
            </div>
          )}
        </DoubleTap>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pr-20 pt-28 md:pr-4">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <Link href={profileHref(post.author)} className="flex min-w-0 items-center gap-2">
              <Avatar user={post.author} size={34} />
              <span className="truncate text-sm font-semibold">{post.author.username}</span>
              {post.author.verified && <VerifiedBadge className="size-3.5 text-black" />}
            </Link>
            <FollowButton userId={post.author.id} variant="overlay" />
          </div>
          <h2 className="mt-2 text-[15px] font-semibold leading-snug">{post.title}</h2>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={cn("pointer-events-auto mt-1 block text-left text-sm text-white/85", !expanded && "line-clamp-2")}
          >
            {post.caption}
          </button>
          <div className="pointer-events-auto mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
              <meta.icon className="size-3.5" aria-hidden /> {meta.label} · {post.model}
            </span>
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-semibold backdrop-blur hover:bg-white/25"
            >
              <Wand2 className="size-3.5" aria-hidden /> Prompt
            </button>
          </div>
        </div>

        <PostActions post={post} layout="column" className="absolute bottom-24 right-2 z-20 md:hidden" />

        {showPrompt && (
          <div className="animate-sheet absolute inset-x-0 bottom-0 z-30 rounded-t-3xl bg-neutral-900/95 p-5 pb-8 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <Wand2 className="size-4 text-violet-300" aria-hidden />
              <h3 className="font-semibold">Prompt</h3>
              <span className="text-xs text-white/60">{post.model}</span>
              <button type="button" onClick={() => setShowPrompt(false)} aria-label="Close prompt" className="ml-auto rounded-full p-1.5 hover:bg-white/10">
                <X className="size-4" />
              </button>
            </div>
            <p className="font-mono text-[13px] leading-relaxed text-white/90">{post.prompt}</p>
            <div className="mt-4 flex gap-2">
              <CopyButton text={post.prompt} label="Copy prompt" dark className="bg-white/10" />
              <Link href={`/create?remix=${post.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white">
                <Repeat2 className="size-3.5" aria-hidden /> Remix
              </Link>
            </div>
          </div>
        )}
      </div>

      <PostActions post={post} layout="column" className="hidden self-end pb-6 md:flex" />
    </div>
  );
}
