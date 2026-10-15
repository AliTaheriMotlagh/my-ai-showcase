import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { FollowButton } from "@/components/ui/client-bits";
import { VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { compact } from "@/lib/format";
import { site } from "@/lib/site";
import { getTrendingTags } from "@/server/queries/discover";
import { getTopCreators, isFollowing } from "@/server/queries/people";
import type { Viewer } from "@/server/session";
import { MeMini } from "./MeMini";

/** Desktop-only discovery column (X-style "Who to follow" + "Trending"). Built from real data, and hidden when empty. */
export async function RightRail({ viewer, className }: { viewer: Viewer | null; className?: string }) {
  const [suggested, tags] = await Promise.all([
    getTopCreators({ limit: 5, viewerId: viewer?.id ?? null, excludeFollowedBy: viewer?.id ?? null }),
    getTrendingTags(8),
  ]);
  const followState = await Promise.all(suggested.map((u) => isFollowing(viewer?.id ?? null, u.id)));

  return (
    <aside aria-label="Discover" className={cn("sticky top-6 h-fit space-y-6 self-start", className)}>
      <MeMini viewer={viewer} />
      {suggested.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted">Creators to follow</h2>
            <Link href="/search" className="text-xs font-semibold hover:text-muted">
              See all
            </Link>
          </div>
          <ul className="space-y-3">
            {suggested.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3">
                <Link href={`/u/${u.username}`} className="shrink-0">
                  <Avatar user={u} size={40} />
                </Link>
                <div className="min-w-0 flex-1 leading-tight">
                  <Link href={`/u/${u.username}`} className="flex items-center gap-1 text-sm font-semibold hover:underline">
                    <span className="truncate">{u.username}</span>
                    {u.verified && <VerifiedBadge className="size-3.5" />}
                  </Link>
                  <p className="truncate text-xs text-muted">{u.headline || u.name}</p>
                </div>
                <FollowButton userId={u.id} following={followState[i]} isSelf={viewer?.id === u.id} variant="link" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {tags.length > 0 && (
        <section className="rounded-2xl border border-line p-4">
          <h2 className="mb-3 font-semibold">Trending now</h2>
          <ol className="space-y-2.5">
            {tags.map((t, i) => (
              <li key={t.tag}>
                <Link href={`/tags/${t.tag}`} className="group block">
                  <span className="text-xs text-muted">{i + 1} · Trending</span>
                  <span className="block font-semibold group-hover:underline">#{t.tag}</span>
                  <span className="text-xs text-muted">{compact(t.count)} showcases</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
      <footer className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/explore" className="hover:underline">
          Explore
        </Link>
        <Link href="/flow" className="hover:underline">
          Flow
        </Link>
        <a href="/sitemap.xml" className="hover:underline">
          Sitemap
        </a>
        <span className="w-full">© {new Date().getFullYear()} {site.name}</span>
      </footer>
    </aside>
  );
}
