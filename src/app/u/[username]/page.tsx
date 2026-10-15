import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KindChips } from "@/components/feed/KindChips";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { FlowLink, ProfileHeader, ProfileLinks } from "@/components/profile/ProfileHeader";
import { FollowButton, ShareButton } from "@/components/ui/client-bits";
import { JsonLd } from "@/components/ui/primitives";
import { compact, truncate } from "@/lib/format";
import { isKind, KINDS } from "@/lib/kinds";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, profileJsonLd } from "@/lib/seo";
import { getProfileByUsername, getProfileLinks, isFollowing } from "@/server/queries/people";
import { getFeedPage, getKindCounts } from "@/server/queries/posts";
import { getViewer } from "@/server/session";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ kind?: string; tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) return { title: "Creator not found", robots: { index: false } };
  const title = `${user.name} (@${user.username})`;
  const description = truncate(
    [user.headline, user.bio, `${user.posts} AI showcases`, user.tools.length ? `made with ${user.tools.join(", ")}` : ""]
      .filter(Boolean)
      .join(" · "),
    160,
  );
  return {
    title,
    description,
    alternates: { canonical: `/u/${user.username}` },
    openGraph: { type: "profile", title, description, url: `/u/${user.username}`, username: user.username },
    twitter: { card: "summary_large_image", title, description },
  };
}

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "saved", label: "Saved" },
  { id: "liked", label: "Liked" },
] as const;

export default async function ProfilePage({ params, searchParams }: Props) {
  const [{ username }, { kind: k, tab: t }] = await Promise.all([params, searchParams]);
  const [profile, viewer] = await Promise.all([getProfileByUsername(username), getViewer()]);
  if (!profile) notFound();

  const isSelf = viewer?.id === profile.id;
  const tab = isSelf && (t === "saved" || t === "liked") ? t : "posts";
  const kind = tab === "posts" && isKind(k) ? k : null;

  const [following, links, kindCounts, first] = await Promise.all([
    isFollowing(viewer?.id ?? null, profile.id),
    getProfileLinks(profile.id),
    getKindCounts(profile.id),
    getFeedPage({
      feed: tab === "posts" ? "user" : tab,
      user: profile.username,
      viewerId: viewer?.id ?? null,
      kind,
      limit: 24,
    }),
  ]);

  
  const emptyText =
    tab === "saved"
      ? "Nothing saved yet. Tap the bookmark on any post to keep it here."
      : tab === "liked"
        ? "No likes yet. Double-tap anything you love."
        : kind
          ? `No ${KINDS.find((x) => x.id === kind)?.plural.toLowerCase()} yet.`
          : isSelf
            ? "Share your first creation. Images, video, music, writing and more."
            : "No showcases yet.";

  return (
    <div className="mx-auto w-full max-w-[935px] pb-10 md:px-4">
      <JsonLd data={profileJsonLd(profile, profile.posts)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `@${profile.username}`, path: `/u/${profile.username}` }])} />
      <ProfileHeader
        profile={profile}
        stats={[
          { label: "Posts", value: compact(profile.posts) },
          { label: "Followers", value: compact(profile.followers) },
          { label: "Following", value: compact(profile.following) },
          { label: "Likes", value: compact(profile.likes) },
        ]}
        actions={
          isSelf ? (
            <Link href="/settings" className="inline-flex items-center gap-2 rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg">
              Edit profile
            </Link>
          ) : (
            <>
              <FlowLink username={profile.username} />
              <span className="hidden sm:block">
                <ShareButton path={`/u/${profile.username}`} title={`${profile.name} on ${site.name}`} />
              </span>
              <FollowButton userId={profile.id} following={following} isSelf={false} />
            </>
          )
        }
      />

      <ProfileLinks links={links} />

      {tab === "posts" && profile.posts > 0 && (
        <nav aria-label="Highlights" className="no-scrollbar mt-6 flex gap-4 overflow-x-auto px-4 sm:px-6">
          {KINDS.filter((kd) => kindCounts[kd.id]).map(({ id, plural, icon: Icon }) => (
            <Link key={id} href={`/u/${profile.username}?kind=${id}#posts`} className="group flex w-16 shrink-0 flex-col items-center gap-1.5">
              <span className="grid size-16 place-items-center rounded-full border border-line bg-elevated transition group-hover:border-accent">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="w-full truncate text-center text-xs">
                {plural} <span className="text-muted">{kindCounts[id]}</span>
              </span>
            </Link>
          ))}
        </nav>
      )}

      <section id="posts" aria-label="Showcases" className="mt-6 scroll-mt-16 border-t border-line pt-1">
        {isSelf && (
          <div role="tablist" aria-label="Profile sections" className="grid grid-cols-3 border-b border-line">
            {TABS.map(({ id, label }) => (
              <Link
                key={id}
                role="tab"
                aria-selected={tab === id}
                href={id === "posts" ? `/u/${profile.username}` : `/u/${profile.username}?tab=${id}`}
                scroll={false}
                className={`-mb-px border-b-2 py-3 text-center text-sm font-semibold uppercase tracking-wider ${tab === id ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
        {tab === "posts" && (
          <KindChips basePath={`/u/${profile.username}`} active={kind} counts={kindCounts} className="my-4 px-4 md:px-0" />
        )}
        <ProfileGrid
          key={`${tab}:${kind ?? ""}`}
          feed={tab === "posts" ? "user" : tab}
          username={tab === "posts" ? profile.username : undefined}
          kind={kind}
          initial={{ items: first.items, nextCursor: first.nextCursor }}
          emptyText={emptyText}
        />
      </section>
    </div>
  );
}
