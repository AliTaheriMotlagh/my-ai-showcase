import { CalendarDays, Clapperboard, ExternalLink, Link2, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/art/Avatar";
import { VerifiedBadge } from "@/components/ui/primitives";
import { monthYear } from "@/lib/format";
import { displayHost } from "@/lib/rules";
import { paletteFor } from "@/lib/palettes";
import type { ProfileLink, UserProfile } from "@/lib/types";

/** Profile header shared by public profiles and your own profile. */
export function ProfileHeader({ profile, stats, actions }: { profile: UserProfile; stats: { label: string; value: ReactNode }[]; actions: ReactNode }) {
  const p = paletteFor(profile.username);
  return (
    <header>
      <div className="relative h-32 overflow-hidden bg-elevated sm:h-44 md:mt-4 md:rounded-2xl">
        {profile.banner ? (
          // eslint-disable-next-line @next/next/no-img-element -- user upload on Blob storage
          <img src={profile.banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div aria-hidden className="h-full w-full" style={{ background: `radial-gradient(at 20% 30%, ${p[1]} 0, transparent 55%), radial-gradient(at 80% 70%, ${p[3]} 0, transparent 50%), linear-gradient(135deg, ${p[0]}, ${p[2]})` }} />
        )}
      </div>
      <div className="px-4 sm:px-6">
        <div className="relative z-10 -mt-11 flex items-end justify-between gap-3 sm:-mt-14">
          <Avatar user={profile} size={104} className="ring-4 ring-bg" />
          <div className="flex items-center justify-end gap-2 pb-1">{actions}</div>
        </div>
        <div className="mt-3">
          <h1 className="flex items-center gap-1.5 text-2xl font-bold tracking-tight">
            {profile.name}
            {profile.verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="text-muted">@{profile.username}</p>
        </div>
        {profile.headline && <p className="mt-2 font-medium">{profile.headline}</p>}
        {profile.bio && <p className="mt-1 max-w-2xl whitespace-pre-line break-words text-[15px] text-fg/90">{profile.bio}</p>}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {profile.location && (
            <li className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden /> {profile.location}
            </li>
          )}
          {profile.website && (
            <li className="flex items-center gap-1">
              <Link2 className="size-4" aria-hidden />
              <a href={profile.website} target="_blank" rel="nofollow ugc noopener noreferrer" className="text-accent hover:underline">
                {displayHost(profile.website)}
              </a>
            </li>
          )}
          <li className="flex items-center gap-1">
            <CalendarDays className="size-4" aria-hidden /> Joined {monthYear(profile.joinedAt)}
          </li>
        </ul>
        <dl className="mt-4 grid max-w-lg grid-cols-4 rounded-2xl border border-line py-3 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="text-lg font-bold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        {profile.tools.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted">Made with</span>
            {profile.tools.map((t) => (
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

/** Link-in-bio buttons. Each link goes through /go/[id] so the click is counted before the redirect. */
export function ProfileLinks({ links }: { links: ProfileLink[] }) {
  if (!links.length) return null;
  return (
    <nav aria-label="Links" className="mx-4 mt-6 grid gap-2.5 sm:mx-6 md:mx-0">
      {links.map((l) => (
        <a
          key={l.id}
          href={`/go/${l.id}`}
          target="_blank"
          rel="nofollow ugc noopener noreferrer"
          className="group flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 transition hover:-translate-y-px hover:border-accent hover:shadow-lg"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{l.title}</span>
            <span className="block truncate text-xs text-muted">{displayHost(l.url)}</span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-muted transition group-hover:text-accent" aria-hidden />
        </a>
      ))}
    </nav>
  );
}

export function FlowLink({ username }: { username: string }) {
  return (
    <Link href={`/flow?user=${username}`} aria-label="Watch in Flow" title="Watch in Flow" className="grid size-10 place-items-center rounded-xl bg-elevated hover:bg-line">
      <Clapperboard className="size-4" />
    </Link>
  );
}
