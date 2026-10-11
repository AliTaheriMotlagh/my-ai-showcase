import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { PostMedia } from "@/components/media/PostMedia";
import { compact } from "@/lib/format";
import { KIND_MAP } from "@/lib/kinds";
import type { FeedPost } from "@/lib/types";

/** Grid tile for Explore, profiles and tag pages. Parent must be `relative` with a size. */
export function ExploreTile({ post }: { post: FeedPost }) {
  const Icon = KIND_MAP[post.kind].icon;
  return (
    <Link
      href={`/p/${post.id}`}
      className="group absolute inset-0 block overflow-hidden bg-elevated"
      aria-label={`${post.title} by @${post.author.username}`}
    >
      <div className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        <PostMedia post={post} variant="tile" />
      </div>
      {post.kind !== "image" && (
        <span className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 text-white backdrop-blur-sm" aria-hidden>
          <Icon className="size-3.5" />
        </span>
      )}
      <div className="absolute inset-0 hidden flex-col justify-end bg-linear-to-t from-black/80 via-black/15 to-transparent p-3 text-white group-hover:flex group-focus-visible:flex">
        <p className="line-clamp-1 text-sm font-semibold">{post.title}</p>
        <div className="mt-1 flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5 fill-current" aria-hidden />
            {compact(post.stats.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5 fill-current" aria-hidden />
            {compact(post.stats.comments)}
          </span>
          <span className="truncate font-normal opacity-80">@{post.author.username}</span>
        </div>
      </div>
    </Link>
  );
}

/** Simple portrait grid (profiles, tags, related posts). */
export function TileGrid({ posts, className }: { posts: FeedPost[]; className?: string }) {
  return (
    <div className={className ?? "grid grid-cols-3 gap-0.5 sm:gap-1.5"}>
      {posts.map((p, i) => (
        <div key={`${p.id}:${i}`} className="relative aspect-[4/5] overflow-hidden sm:rounded-lg">
          <ExploreTile post={p} />
        </div>
      ))}
    </div>
  );
}
