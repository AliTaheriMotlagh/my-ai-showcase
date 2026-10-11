import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExploreGrid } from "@/components/feed/ExploreGrid";
import { KindChips } from "@/components/feed/KindChips";
import { getFeedPage, newFeedSeed } from "@/lib/data";
import { isKind, KIND_MAP } from "@/lib/kinds";

type Props = { searchParams: Promise<{ kind?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { kind } = await searchParams;
  if (isKind(kind)) {
    const meta = KIND_MAP[kind];
    return {
      title: `Explore AI ${meta.plural.toLowerCase()}`,
      description: `Discover trending AI ${meta.plural.toLowerCase()} from creators worldwide — ${meta.blurb.toLowerCase()}. Copy prompts and remix them.`,
      alternates: { canonical: `/explore?kind=${kind}` },
    };
  }
  return {
    title: "Explore AI art, video, music & code",
    description: "An endless, ever-changing mosaic of the best AI-made images, videos, music, writing, code, data viz and 3D. Find your next inspiration.",
    alternates: { canonical: "/explore" },
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const { kind: k } = await searchParams;
  const kind = isKind(k) ? k : null;
  const seed = newFeedSeed();
  const first = getFeedPage({ feed: "explore", seed, kind, limit: 15 });

  return (
    <div className="mx-auto w-full max-w-[975px] md:px-4 md:py-6">
      <header className="space-y-3 px-3 py-3 md:px-0 md:pb-5 md:pt-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {kind ? `Explore ${KIND_MAP[kind].plural}` : "Explore"}
          </h1>
          <Link
            href="/search"
            className="ml-auto flex h-10 flex-1 items-center gap-2 rounded-xl bg-elevated px-3 text-sm text-muted hover:bg-line sm:max-w-xs"
          >
            <Search className="size-4" aria-hidden /> Search creators, prompts, tags
          </Link>
        </div>
        <KindChips basePath="/explore" active={kind} />
      </header>
      <ExploreGrid key={`${kind}:${seed}`} initial={first.items} initialCursor={first.nextCursor} seed={seed} kind={kind} />
    </div>
  );
}
