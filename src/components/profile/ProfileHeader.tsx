import { CalendarDays, Clapperboard, Link2, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Artwork } from "@/components/art/Artwork";
import { Avatar } from "@/components/art/Avatar";
import { VerifiedBadge } from "@/components/ui/primitives";
import { monthYear } from "@/lib/format";
import type { User } from "@/lib/types";

/** Shared profile header layout (used by public profiles and your own /me page). */
export function ProfileHeader({
  user,
  stats,
  actions,
  showMeta = true,
}: {
  user: User;
  stats: { label: string; value: ReactNode }[];
  actions: ReactNode;
  showMeta?: boolean;
}) {
  return (
    <header>
      <div className="relative h-32 overflow-hidden sm:h-44 md:mt-4 md:rounded-2xl">
        <Artwork visual={{ seed: user.avatarSeed, style: "mesh", palette: user.palette }} />
      </div>
      <div className="px-4 sm:px-6">
        <div className="relative z-10 -mt-11 flex items-end justify-between gap-3 sm:-mt-14">
          <Avatar user={user} size={104} className="ring-4 ring-bg" />
          <div className="flex items-center justify-end gap-2 pb-1">{actions}</div>
        </div>
        <div className="mt-3">
          <h1 className="flex items-center gap-1.5 text-2xl font-bold tracking-tight">
            {user.name}
            {user.verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="text-muted">@{user.username}</p>
        </div>
        {user.headline && <p className="mt-2 font-medium">{user.headline}</p>}
        <p className="mt-1 max-w-2xl whitespace-pre-line text-[15px] text-fg/90">{user.bio}</p>
        {showMeta && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {user.location && (
              <li className="flex items-center gap-1">
                <MapPin className="size-4" aria-hidden /> {user.location}
              </li>
            )}
            {user.website && (
              <li className="flex items-center gap-1">
                <Link2 className="size-4" aria-hidden />
                <a href={`https://${user.website}`} target="_blank" rel="nofollow ugc noopener noreferrer" className="text-accent hover:underline">
                  {user.website}
                </a>
              </li>
            )}
            <li className="flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden /> Joined {monthYear(user.joinedAt)}
            </li>
          </ul>
        )}
        <dl className="mt-4 grid max-w-lg grid-cols-4 rounded-2xl border border-line py-3 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="text-lg font-bold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        {user.tools.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted">Made with</span>
            {user.tools.map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-elevated px-2.5 py-1 font-medium hover:bg-line">
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export function FlowLink({ username }: { username: string }) {
  return (
    <Link
      href={`/flow?user=${username}`}
      aria-label="Watch in Flow"
      title="Watch in Flow"
      className="grid size-10 place-items-center rounded-xl bg-elevated hover:bg-line"
    >
      <Clapperboard className="size-4" />
    </Link>
  );
}
