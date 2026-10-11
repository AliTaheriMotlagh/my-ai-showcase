import type { Metadata } from "next";
import Link from "next/link";
import { Artwork } from "@/components/art/Artwork";
import { Avatar } from "@/components/art/Avatar";
import { TileGrid } from "@/components/post/ExploreTile";
import { SearchInput } from "@/components/search/SearchInput";
import { FollowButton } from "@/components/ui/client-bits";
import { SectionTitle, VerifiedBadge } from "@/components/ui/primitives";
import { getFeedPage, getSuggestedUsers, getTrendingTags, search } from "@/lib/data";
import { compact } from "@/lib/format";
import { KINDS } from "@/lib/kinds";
import type { User } from "@/lib/types";

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

function PersonRow({ u }: { u: User }) {
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
        <p className="truncate text-sm text-muted">
          @{u.username} · {compact(u.followers)} followers
        </p>
        <p className="truncate text-sm">{u.headline}</p>
      </div>
      <FollowButton userId={u.id} />
    </li>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = search(q);

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
                  {results.people.map((u) => (
                    <PersonRow key={u.id} u={u} />
                  ))}
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
        <BrowseHome />
      )}
    </div>
  );
}

function BrowseHome() {
  const tags = getTrendingTags(12);
  const people = getSuggestedUsers(6);
  return (
    <>
      <section>
        <SectionTitle>Browse by format</SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KINDS.map((k) => {
            const sample = getFeedPage({ feed: "explore", kind: k.id, seed: 7, limit: 1 }).items[0];
            return (
              <Link key={k.id} href={`/explore?kind=${k.id}`} className="group relative aspect-[16/10] overflow-hidden rounded-2xl">
                {sample && <Artwork visual={sample.visuals[0]} className="transition-transform duration-500 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-linear-to-t from-black/75 to-black/10" />
                <span className="absolute bottom-3 left-3 flex items-center gap-2 font-semibold text-white">
                  <k.icon className="size-5" aria-hidden /> {k.plural}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section>
        <SectionTitle>Trending tags</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link key={t.tag} href={`/tags/${t.tag}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-elevated">
              #{t.tag}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <SectionTitle>Creators to follow</SectionTitle>
        <ul className="divide-y divide-line">
          {people.map((u) => (
            <PersonRow key={u.id} u={u} />
          ))}
        </ul>
      </section>
    </>
  );
}
