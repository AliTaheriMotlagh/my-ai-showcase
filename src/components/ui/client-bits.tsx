"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { compact, fullDate, timeAgo } from "@/lib/format";
import { actions, useAppStore } from "@/lib/store";
import { toast } from "./toast";

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  return (
    <time dateTime={iso} title={fullDate(iso)} className={className} suppressHydrationWarning>
      {timeAgo(iso)}
    </time>
  );
}

export async function shareUrl(path: string, title: string) {
  const url = new URL(path, window.location.origin).toString();
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard");
  } catch {
    toast("Couldn't copy the link");
  }
}

export function CopyButton({ text, label = "Copy", className, dark }: { text: string; label?: string; className?: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          toast("Couldn't copy");
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
        dark ? "text-[#c9d1d9] hover:bg-white/10" : "bg-bg hover:bg-line/60",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function ShareButton({ path, title, className, label = "Share" }: { path: string; title: string; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => shareUrl(path, title)}
      className={cn("inline-flex items-center gap-2 rounded-xl bg-elevated px-3.5 py-2 text-sm font-semibold hover:bg-line", className)}
    >
      <Share2 className="size-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

type FollowVariant = "solid" | "link" | "overlay";

export function FollowButton({
  userId,
  variant = "solid",
  hideWhenFollowing,
  className,
}: {
  userId: string;
  variant?: FollowVariant;
  hideWhenFollowing?: boolean;
  className?: string;
}) {
  const following = useAppStore((s) => !!s.following[userId]);
  if (userId === "me" || (hideWhenFollowing && following)) return null;
  const styles: Record<FollowVariant, string> = {
    solid: following
      ? "rounded-xl bg-elevated px-4 py-2 text-sm font-semibold hover:bg-line"
      : "rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg hover:opacity-90",
    link: "px-1 text-sm font-semibold text-accent hover:text-fg",
    overlay: following
      ? "rounded-lg border border-white/40 px-2.5 py-1 text-xs font-semibold text-white"
      : "rounded-lg border border-white px-2.5 py-1 text-xs font-semibold text-white hover:bg-white hover:text-black",
  };
  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => actions.toggleFollow(userId)}
      className={cn("shrink-0 transition active:scale-95", styles[variant], className)}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

export function FollowerCount({ userId, base }: { userId: string; base: number }) {
  const following = useAppStore((s) => !!s.following[userId]);
  return <>{compact(base + (following ? 1 : 0))}</>;
}
