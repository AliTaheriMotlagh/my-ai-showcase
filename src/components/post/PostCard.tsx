"use client";

import { Repeat2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/art/Avatar";
import { PostMedia } from "@/components/media/PostMedia";
import { FollowButton, TimeAgo } from "@/components/ui/client-bits";
import { VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { compact } from "@/lib/format";
import { KIND_MAP } from "@/lib/kinds";
import { profileHref, tagHref } from "@/lib/links";
import { actions, useAppStore } from "@/lib/store";
import type { FeedPost } from "@/lib/types";
import { DoubleTap } from "./DoubleTap";
import { PostActions } from "./PostActions";
import { PostMenu } from "./PostMenu";
import { PromptPeek } from "./PromptPeek";

export function PostCard({ post, preview = false }: { post: FeedPost; preview?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const liked = useAppStore((s) => !!s.liked[post.id]);
  const href = `/p/${post.id}`;
  const meta = KIND_MAP[post.kind];
  const KindIcon = meta.icon;
  const authorHref = profileHref(post.author);

  return (
    <article className="overflow-hidden border-b border-line pb-2 [contain-intrinsic-size:auto_760px] [content-visibility:auto] sm:rounded-2xl sm:border sm:bg-card sm:pb-1">
      <header className="flex items-center gap-3 px-3 py-3 sm:px-4">
        <Link href={authorHref} className="shrink-0" aria-label={`${post.author.name}'s profile`}>
          <Avatar user={post.author} size={38} ring />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1 text-[15px]">
            <Link href={authorHref} className="truncate font-semibold hover:underline">
              {post.author.name}
            </Link>
            {post.author.verified && <VerifiedBadge />}
            <span className="hidden truncate text-muted min-[400px]:inline">@{post.author.username}</span>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <TimeAgo iso={post.createdAt} className="shrink-0 text-muted" />
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <KindIcon className="size-3.5 shrink-0" aria-hidden />
            <span>{meta.label}</span>
            <span aria-hidden>·</span>
            <Sparkles className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{post.model}</span>
            {post.remixOf && (
              <>
                <span aria-hidden>·</span>
                <Repeat2 className="size-3 shrink-0" aria-hidden />
                <Link href={`/p/${post.remixOf.id}`} className="truncate hover:underline">
                  remix of @{post.remixOf.username}
                </Link>
              </>
            )}
          </div>
        </div>
        {!preview && <FollowButton userId={post.author.id} variant="link" hideWhenFollowing />}
        {!preview && <PostMenu post={post} />}
      </header>

      <DoubleTap onDoubleTap={() => !preview && !liked && actions.toggleLike(post.id)}>
        <PostMedia post={post} variant="feed" />
      </DoubleTap>

      {!preview && <PostActions post={post} className="px-1.5 pt-1" />}

      <div className={cn("space-y-2 px-3 pb-2 text-[15px] sm:px-4", preview && "pt-3")}>
        <h2 className="font-semibold leading-snug">
          <Link href={href} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        {post.caption && (
          <p className={cn("whitespace-pre-line text-fg/90", !expanded && "line-clamp-2")}>
            {post.caption}
          </p>
        )}
        {post.caption.length > 110 && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="-mt-1 text-sm text-muted hover:text-fg">
            more
          </button>
        )}
        {post.prompt && <PromptPeek prompt={post.prompt} />}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
            {post.tags.slice(0, 5).map((t) => (
              <Link key={t} href={tagHref(t)} className="text-accent hover:underline">
                #{t}
              </Link>
            ))}
          </div>
        )}
        {!preview && post.stats.comments > 0 && (
          <Link href={`${href}#comments`} className="block text-sm text-muted hover:text-fg">
            View all {compact(post.stats.comments)} comments
          </Link>
        )}
      </div>
    </article>
  );
}
