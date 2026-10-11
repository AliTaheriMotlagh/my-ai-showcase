import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KindChips } from "@/components/feed/KindChips";
import { TileGrid } from "@/components/post/ExploreTile";
import { FlowLink, ProfileHeader } from "@/components/profile/ProfileHeader";
import { FollowButton, FollowerCount, ShareButton } from "@/components/ui/client-bits";
import { JsonLd } from "@/components/ui/primitives";
import { getUser, getUserStats, postsByAuthor } from "@/lib/data";
import { compact, truncate } from "@/lib/format";
import { isKind, KINDS } from "@/lib/kinds";
import { breadcrumbJsonLd, profileJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ kind?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = getUser(username);
  if (!user) return { title: "Creator not found", robots: { index: false } };
  const stats = getUserStats(user.id);
  const title = `${user.name} (@${user.username})`;
  const description = truncate(
    `${user.headline}. ${user.bio} · ${compact(user.followers)} followers · ${stats.posts} AI showcases made with ${user.tools.join(", ")}.`,
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

export default async function ProfilePage({ params, searchParams }: Props) {
  const [{ username }, { kind: k }] = await Promise.all([params, searchParams]);
  const user = getUser(username);
  if (!user) notFound();
  const kind = isKind(k) ? k : null;
  const stats = getUserStats(user.id);
  const all = postsByAuthor(user.id);
  const shown = kind ? all.filter((p) => p.kind === kind) : all;

  return (
    <div className="mx-auto w-full max-w-[935px] pb-10 md:px-4">
      <JsonLd data={profileJsonLd(user, stats.posts)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `@${user.username}`, path: `/u/${user.username}` }])} />
      <ProfileHeader
        user={user}
        stats={[
          { label: "Posts", value: stats.posts },
          { label: "Followers", value: <FollowerCount userId={user.id} base={user.followers} /> },
          { label: "Following", value: compact(user.following) },
          { label: "Likes", value: compact(stats.likes) },
        ]}
        actions={
          <>
            <FlowLink username={user.username} />
            <span className="hidden sm:block">
              <ShareButton path={`/u/${user.username}`} title={`${user.name} on Latent`} />
            </span>
            <FollowButton userId={user.id} />
          </>
        }
      />

      {/* Highlights: one bubble per format, like Instagram story highlights */}
      <nav aria-label="Highlights" className="no-scrollbar mt-6 flex gap-4 overflow-x-auto px-4 sm:px-6">
        {KINDS.filter((kd) => stats.kinds[kd.id]).map(({ id, plural, icon: Icon }) => (
          <Link key={id} href={`/u/${user.username}?kind=${id}#posts`} className="group flex w-16 shrink-0 flex-col items-center gap-1.5">
            <span className="grid size-16 place-items-center rounded-full border border-line bg-elevated transition group-hover:border-accent">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="w-full truncate text-center text-xs">
              {plural} <span className="text-muted">{stats.kinds[id]}</span>
            </span>
          </Link>
        ))}
      </nav>

      <section id="posts" aria-label="Posts" className="mt-6 scroll-mt-16 border-t border-line pt-4">
        <KindChips basePath={`/u/${user.username}`} active={kind} counts={stats.kinds} className="mb-4 px-4 md:px-0" />
        {shown.length ? (
          <TileGrid posts={shown} />
        ) : (
          <p className="py-16 text-center text-muted">Nothing here yet.</p>
        )}
      </section>
    </div>
  );
}
