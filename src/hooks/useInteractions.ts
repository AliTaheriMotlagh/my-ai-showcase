"use client";

import { toggleFollowAction, toggleLikeAction, toggleSaveAction } from "@/app/actions";
import type { FeedPost } from "@/lib/types";
import { useServerToggle } from "./useServerToggle";

/** Like state and count for one post. The count adjusts by the same optimistic delta as the flag. */
export function useLike(post: Pick<FeedPost, "id" | "stats" | "viewer">) {
  const { value, toggle } = useServerToggle({
    key: `like:${post.id}`,
    serverValue: post.viewer.liked,
    run: () => toggleLikeAction(post.id),
    select: (d: { liked: boolean }) => d.liked,
    needsAuthMessage: "Log in to like posts.",
  });
  const delta = value === post.viewer.liked ? 0 : value ? 1 : -1;
  return { liked: value, likes: Math.max(0, post.stats.likes + delta), toggle };
}

export function useSave(post: Pick<FeedPost, "id" | "stats" | "viewer">) {
  const { value, toggle } = useServerToggle({
    key: `save:${post.id}`,
    serverValue: post.viewer.saved,
    run: () => toggleSaveAction(post.id),
    select: (d: { saved: boolean }) => d.saved,
    needsAuthMessage: "Log in to save posts.",
  });
  return { saved: value, toggle };
}

export function useFollow(userId: string, serverFollowing: boolean) {
  return useServerToggle({
    key: `follow:${userId}`,
    serverValue: serverFollowing,
    run: () => toggleFollowAction(userId),
    select: (d: { following: boolean }) => d.following,
    needsAuthMessage: "Log in to follow creators.",
  });
}
