import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { TileGrid } from "@/components/post/ExploreTile";
import { SearchInput } from "@/components/search/SearchInput";
import { FollowButton } from "@/components/ui/client-bits";
import { SectionTitle, VerifiedBadge } from "@/components/ui/primitives";
import { PostMedia } from "@/components/media/PostMedia";
import { compact } from "@/lib/format";
import { KINDS } from "@/lib/kinds";
import type { UserSummary } from "@/lib/types";
import { getTrendingTags, search } from "@/server/queries/discover";
import { getTopCreators, isFollowing } from "@/server/queries/people";
import { getFeedPage } from "@/server/queries/posts";
import { getViewer } from "@/server/session";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) return { title: `“${q}” — Search`, robots: { index: false, follow: true } };
  return {
    title: "Search AI creators, prompts & tags",
    description: "Find AI artists, filmmakers, musicians and coders, plus prompts, models and tags.",
    alternates: { canonical: "/search" },
  };
}

async function PersonRow({ u, viewerId }: { u: UserSummary; viewerId: string | null }) {
  const following = await isFollowing(viewerId, u.id);
  return (
    <li className="flex items-center gap-3 py-2">
      <Link href={`/u/${u.username}`} className="shrink-0">
        <Avatar user={u} size={48} />
      </Link>
      <div className="min-w-0 flex-1 leading-tight">
        <Link href={`/u/${u.username}`} className="flex items-center gap-1 font-semibold hover:underline">
          <span className="truncate">{u.name}</span>
          {u.verified && <VerifiedBadge />}
        </Link>
        <p className="truncate text-sm text-muted">@{u.username}</p>
        {u.headline && <p className="truncate text-sm">{u.headline}</p>}
      </div>
      <FollowButton userId={u.id} following={following} isSelf={viewerId === u.id} />
    </li>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const viewer = await getViewer();
  const results = await search(q, viewer?.id ?? null);

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-8 px-4 pb-12 pt-4 md:pt-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Search</h1>
        <SearchInput initial={q} />
      </div>

      {results ? (
        results.people.length + results.tags.length + results.posts.length === 0 ? (
          <p className="py-16 text-center text-muted">No results for “{q}”. Try a model name, a style, or a tag.</p>
        ) : (
          <>
            {results.people.length > 0 && (
              <section>
                <SectionTitle>People</SectionTitle>
                <ul className="divide-y divide-line">
                  {await Promise.all(results.people.map((u) => PersonRow({ u, viewerId: viewer?.id ?? null })))}
                </ul>
              </section>
            )}
            {results.tags.length > 0 && (
              <section>
                <SectionTitle>Tags</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((t) => (
                    <Link key={t.tag} href={`/tags/${t.tag}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-elevated">
                      #{t.tag} <span className="text-muted">{t.count}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {results.posts.length > 0 && (
              <section>
                <SectionTitle>Showcases</SectionTitle>
                <TileGrid posts={results.posts} className="-mx-4 grid grid-cols-3 gap-0.5 sm:mx-0 sm:gap-1.5" />
              </section>
            )}
          </>
        )
      ) : (
        <BrowseHome viewerId={viewer?.id ?? null} />
      )}
    </div>
  );
}

async function BrowseHome({ viewerId }: { viewerId: string | null }) {
  const [tags, people, samples] = await Promise.all([
    getTrendingTags(12),
    getTopCreators({ limit: 6, viewerId, excludeFollowedBy: viewerId }),
    Promise.all(KINDS.map((k) => getFeedPage({ feed: "explore", viewerId: null, kind: k.id, seed: 7, limit: 1 }))),
  ]);
  return (
    <>
      <section>
        <SectionTitle>Browse by format</SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KINDS.map((k, i) => {
            const sample = samples[i].items[0];
            return (
              <Link key={k.id} href={`/explore?kind=${k.id}`} className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-elevated">
                {sample && (
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    <PostMedia post={sample} variant="tile" />
                  </div>
                )}
                <span className="absolute inset-0 bg-linear-to-t from-black/75 to-black/10" />
                <span className="absolute bottom-3 left-3 flex items-center gap-2 font-semibold text-white">
                  <k.icon className="size-5" aria-hidden /> {k.plural}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      {tags.length > 0 && (
        <section>
          <SectionTitle>Trending tags</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link key={t.tag} href={`/tags/${t.tag}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-elevated">
                #{t.tag} <span className="text-muted">{compact(t.count)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {people.length > 0 && (
        <section>
          <SectionTitle>Creators to follow</SectionTitle>
          <ul className="divide-y divide-line">{await Promise.all(people.map((u) => PersonRow({ u, viewerId })))}</ul>
        </section>
      )}
    </>
  );
}
