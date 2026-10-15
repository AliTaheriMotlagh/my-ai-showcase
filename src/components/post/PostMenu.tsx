"use client";

import { Flag, Link2, MoreHorizontal, Repeat2, Send, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deletePostAction, reportPostAction } from "@/app/actions";
import { shareUrl } from "@/components/ui/client-bits";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/types";

const REASONS = [
  { id: "spam", label: "Spam" },
  { id: "inappropriate", label: "Inappropriate" },
  { id: "copyright", label: "Copyright" },
  { id: "other", label: "Something else" },
] as const;

export function PostMenu({ post, className, onDeleted }: { post: FeedPost; className?: string; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const href = `/p/${post.id}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setReporting(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-elevated";

  const report = (reason: (typeof REASONS)[number]["id"]) => {
    setOpen(false);
    setReporting(false);
    startTransition(async () => {
      const result = await reportPostAction({ postId: post.id, reason, details: "" });
      toast(result.ok ? "Thanks — we'll review this post." : result.needsAuth ? "Log in to report posts." : result.error);
    });
  };

  const remove = () => {
    setOpen(false);
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (!result.ok) return toast(result.error);
      toast("Post deleted");
      onDeleted?.();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
        onClick={() => {
          setOpen((o) => !o);
          setReporting(false);
        }}
        className="grid size-9 place-items-center rounded-full text-muted hover:bg-elevated hover:text-fg"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div role="menu" className="animate-pop absolute right-0 top-10 z-30 w-56 overflow-hidden rounded-2xl border border-line bg-card py-1 shadow-2xl">
          {!reporting ? (
            <>
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
                onClick={async () => {
                  setOpen(false);
                  try {
                    await navigator.clipboard.writeText(new URL(href, location.origin).toString());
                    toast("Link copied");
                  } catch {
                    toast("Couldn't copy the link");
                  }
                }}
              >
                <Link2 className="size-4" /> Copy link
              </button>
              <button role="menuitem" type="button" className={item} onClick={() => { setOpen(false); void shareUrl(href, post.title); }}>
                <Send className="size-4" /> Share to…
              </button>
              {post.viewer.owner ? (
                <button role="menuitem" type="button" className={cn(item, "text-like")} onClick={remove}>
                  <Trash2 className="size-4" /> Delete post
                </button>
              ) : (
                <button role="menuitem" type="button" className={cn(item, "text-like")} onClick={() => setReporting(true)}>
                  <Flag className="size-4" /> Report
                </button>
              )}
            </>
          ) : (
            <>
              <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">Why are you reporting this?</p>
              {REASONS.map((r) => (
                <button key={r.id} role="menuitem" type="button" className={item} onClick={() => report(r.id)}>
                  {r.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
