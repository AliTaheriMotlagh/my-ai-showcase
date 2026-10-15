import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { KIND_MAP } from "@/lib/kinds";
import type { Aspect, FeedPost, MediaItem } from "@/lib/types";

/**
 * feed — natural size inside a feed card
 * tile — fills an absolutely-positioned grid cell (Explore, profiles)
 * full — fills its parent (post page, Flow)
 */
export type MediaVariant = "feed" | "tile" | "full";

export interface MediaProps {
  post: FeedPost;
  variant: MediaVariant;
  /** Set by Flow: whether this item is the one on screen. */
  active?: boolean;
}

export const ASPECT: Record<Aspect, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
};

export function frameClass(variant: MediaVariant, feedClass = "") {
  if (variant === "tile") return "absolute inset-0";
  if (variant === "full") return "relative h-full w-full";
  return cn("relative w-full", feedClass);
}

export function altText(post: FeedPost) {
  return `${post.title} — AI ${KIND_MAP[post.kind].label.toLowerCase()} by @${post.author.username}, made with ${post.model}`;
}

export const mediaOf = (post: FeedPost, type: MediaItem["type"]) => post.media.find((m) => m.type === type);

/** Covers its parent. `contain` keeps the whole image visible on the full-size post page. */
export function ImgFill({ src, alt, fit = "cover", width, height }: { src: string; alt: string; fit?: "cover" | "contain"; width?: number | null; height?: number | null }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- user uploads on Blob storage
    <img
      src={src}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={cn("absolute inset-0 h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
    />
  );
}

/** Shown only if a post somehow has no file for its kind. Writing rejects this combination, so it's a safety net. */
export function MissingMedia({ label = "Media unavailable" }: { label?: string }) {
  return <div className="absolute inset-0 grid place-items-center bg-elevated text-sm text-muted">{label}</div>;
}

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden bg-black", className)}>{children}</div>;
}
