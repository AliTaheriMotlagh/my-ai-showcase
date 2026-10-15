"use client";

import { PostMedia } from "@/components/media/PostMedia";
import { useLike } from "@/hooks/useInteractions";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/types";
import { DoubleTap } from "./DoubleTap";

/** The large media area on a post page. Double-tap likes, like the feed. */
export function PostStage({ post, className, mediaClassName }: { post: FeedPost; className?: string; mediaClassName?: string }) {
  const like = useLike(post);
  return (
    <DoubleTap className={cn("w-full", className)} onDoubleTap={() => !like.liked && void like.toggle()}>
      <div className={mediaClassName}>
        <PostMedia post={post} variant="full" />
      </div>
    </DoubleTap>
  );
}
