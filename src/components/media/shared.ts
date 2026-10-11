import { cn } from "@/lib/cn";
import { KIND_MAP } from "@/lib/kinds";
import type { Aspect, FeedPost } from "@/lib/types";

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
