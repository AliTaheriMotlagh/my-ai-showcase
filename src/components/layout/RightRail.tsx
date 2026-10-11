import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { FollowButton } from "@/components/ui/client-bits";
import { VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { getSuggestedUsers, getTrendingTags } from "@/lib/data";
import { compact } from "@/lib/format";
import { site } from "@/lib/site";
import { MeMini } from "./MeMini";

/** Desktop-only discovery column (X-style "Who to follow" + "Trending"). */
export function RightRail({ className }: { className?: string }) {
  const suggested = getSuggestedUsers(5);
  const tags = getTrendingTags(8);
  return (
    <aside aria-label="Discover" className={cn("sticky top-6 h-fit space-y-6 self-start", className)}>
      <MeMini />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Suggested for you</h2>
          <Link href="/search" className="text-xs font-semibold hover:text-muted">
            See all
          </Link>
        </div>
        <ul className="space-y-3">
          {suggested.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <Link href={`/u/${u.username}`} className="shrink-0">
                <Avatar user={u} size={40} />
              </Link>
              <div className="min-w-0 flex-1 leading-tight">
                <Link href={`/u/${u.username}`} className="flex items-center gap-1 text-sm font-semibold hover:underline">
                  <span className="truncate">{u.username}</span>
                  {u.verified && <VerifiedBadge className="size-3.5" />}
                </Link>
                <p className="truncate text-xs text-muted">{u.headline}</p>
              </div>
              <FollowButton userId={u.id} variant="link" />
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-line p-4">
        <h2 className="mb-3 font-semibold">Trending now</h2>
        <ol className="space-y-2.5">
          {tags.map((t, i) => (
            <li key={t.tag}>
              <Link href={`/tags/${t.tag}`} className="group block">
                <span className="text-xs text-muted">
                  {i + 1} · Trending in AI
                </span>
                <span className="block font-semibold group-hover:underline">#{t.tag}</span>
                <span className="text-xs text-muted">{compact(t.count)} showcases</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
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
        <span className="w-full">© 2026 {site.name}</span>
      </footer>
    </aside>
  );
}
