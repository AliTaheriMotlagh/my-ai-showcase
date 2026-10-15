"use client";

import { Bookmark, Eye, Heart, MessageCircle, Repeat2, Send } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { shareUrl } from "@/components/ui/client-bits";
import { cn } from "@/lib/cn";
import { compact } from "@/lib/format";
import { useLike, useSave } from "@/hooks/useInteractions";
import type { FeedPost } from "@/lib/types";

export function PostActions({ post, layout = "row", className }: { post: FeedPost; layout?: "row" | "column"; className?: string }) {
  const { liked, likes, toggle: toggleLike } = useLike(post);
  const { saved, toggle: toggleSave } = useSave(post);
  const [pop, setPop] = useState(0);
  const href = `/p/${post.id}`;
  const likeLabel = compact(likes);

  const like = () => {
    if (!liked) setPop((p) => p + 1);
    void toggleLike();
  };
  const heart = (size: string) => <Heart key={pop} className={cn(size, liked && "animate-like-pop fill-like text-like")} aria-hidden />;

  if (layout === "column") {
    return (
      <div className={cn("flex flex-col items-center gap-5 text-white", className)}>
        <ColumnButton label={liked ? "Unlike" : "Like"} onClick={like} caption={likeLabel} pressed={liked}>
          {heart("size-7")}
        </ColumnButton>
        <ColumnButton label="Comments" href={`${href}#comments`} caption={compact(post.stats.comments)}>
          <MessageCircle className="size-7 -scale-x-100" aria-hidden />
        </ColumnButton>
        <ColumnButton label={saved ? "Unsave" : "Save"} onClick={() => void toggleSave()} caption={saved ? "Saved" : "Save"} pressed={saved}>
          <Bookmark className={cn("size-7", saved && "fill-current")} aria-hidden />
        </ColumnButton>
        <ColumnButton label="Remix this prompt" href={`/create?remix=${post.id}`} caption={compact(post.stats.remixes)}>
          <Repeat2 className="size-7" aria-hidden />
        </ColumnButton>
        <ColumnButton label="Share" onClick={() => shareUrl(href, post.title)} caption="Share">
          <Send className="size-7" aria-hidden />
        </ColumnButton>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center">
        <RowButton label={liked ? "Unlike" : "Like"} onClick={like} pressed={liked}>
          {heart("size-[22px]")}
          <span className={cn(liked && "text-like")}>{likeLabel}</span>
        </RowButton>
        <RowButton label="Comments" href={`${href}#comments`}>
          <MessageCircle className="size-[22px] -scale-x-100" aria-hidden />
          <span>{compact(post.stats.comments)}</span>
        </RowButton>
        <RowButton label="Remix this prompt" href={`/create?remix=${post.id}`}>
          <Repeat2 className="size-[22px]" aria-hidden />
          <span>{compact(post.stats.remixes)}</span>
        </RowButton>
        <RowButton label="Share" onClick={() => shareUrl(href, post.title)}>
          <Send className="size-[21px]" aria-hidden />
        </RowButton>
      </div>
      <div className="flex items-center">
        <span className="hidden items-center gap-1 px-2 text-sm text-muted sm:flex" title="Views">
          <Eye className="size-4" aria-hidden />
          {compact(post.stats.views)}
        </span>
        <RowButton label={saved ? "Unsave" : "Save"} onClick={() => void toggleSave()} pressed={saved}>
          <Bookmark className={cn("size-[22px]", saved && "fill-current")} aria-hidden />
        </RowButton>
      </div>
    </div>
  );
}

type BtnProps = { label: string; onClick?: () => void; href?: string; pressed?: boolean; children: ReactNode };

function RowButton({ label, onClick, href, pressed, children }: BtnProps) {
  const cls =
    "flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium tabular-nums transition hover:bg-elevated active:scale-95";
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function ColumnButton({ label, onClick, href, pressed, caption, children }: BtnProps & { caption: string }) {
  const inner = (
    <>
      <span className="grid size-12 place-items-center rounded-full bg-black/25 backdrop-blur-sm transition group-hover:bg-black/40 md:bg-white/10">
        {children}
      </span>
      <span className="text-xs font-semibold tabular-nums drop-shadow">{caption}</span>
    </>
  );
  const cls = "group flex flex-col items-center gap-1 transition active:scale-90";
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
