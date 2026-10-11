"use client";

import { EyeOff, Flag, Link2, MoreHorizontal, Repeat2, Send, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { shareUrl } from "@/components/ui/client-bits";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/types";

export function PostMenu({ post, className }: { post: FeedPost; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const href = `/p/${post.id}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-elevated";
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-full text-muted hover:bg-elevated hover:text-fg"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div role="menu" className="animate-pop absolute right-0 top-10 z-30 w-56 overflow-hidden rounded-2xl border border-line bg-card py-1 shadow-2xl">
          <Link role="menuitem" href={href} className={item} onClick={() => setOpen(false)}>
            <SquareArrowOutUpRight className="size-4" /> Go to post
          </Link>
          <Link role="menuitem" href={`/create?remix=${post.id}`} className={item} onClick={() => setOpen(false)}>
            <Repeat2 className="size-4" /> Remix prompt
          </Link>
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={run(async () => {
              try {
                await navigator.clipboard.writeText(new URL(href, location.origin).toString());
                toast("Link copied");
              } catch {
                toast("Couldn't copy the link");
              }
            })}
          >
            <Link2 className="size-4" /> Copy link
          </button>
          <button role="menuitem" type="button" className={item} onClick={run(() => shareUrl(href, post.title))}>
            <Send className="size-4" /> Share to…
          </button>
          <button role="menuitem" type="button" className={item} onClick={run(() => toast("Got it — you'll see fewer posts like this"))}>
            <EyeOff className="size-4" /> Not interested
          </button>
          <button role="menuitem" type="button" className={cn(item, "text-like")} onClick={run(() => toast("Thanks — our team will review this post"))}>
            <Flag className="size-4" /> Report
          </button>
        </div>
      )}
    </div>
  );
}
