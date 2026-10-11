import { Hash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/art/Avatar";
import { TileGrid } from "@/components/post/ExploreTile";
import { JsonLd } from "@/components/ui/primitives";
import { getAllTags, postsByTag } from "@/lib/data";
import { compact } from "@/lib/format";
import { breadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag).toLowerCase();
  const count = postsByTag(tag).length;
  if (!count) return { title: `#${tag}`, robots: { index: false } };
  return {
    title: `#${tag} — AI art, prompts & creations`,
    description: `Browse ${count} AI showcases tagged #${tag}: images, video, music, code and more, with the prompts behind them.`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: Props) {
  const tag = decodeURIComponent((await params).tag).toLowerCase();
  const posts = postsByTag(tag);
  if (!posts.length) notFound();

  const creators = [...new Map(posts.map((p) => [p.author.id, p.author])).values()].slice(0, 8);
  const relatedTags = (() => {
    const counts = new Map<string, number>();
    for (const p of posts) for (const t of p.tags) if (t !== tag) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  })();
  const total = getAllTags().find((t) => t.tag === tag)?.count ?? posts.length;
  const likes = posts.reduce((s, p) => s + p.stats.likes, 0);

  return (
    <div className="mx-auto w-full max-w-[935px] pb-12 md:px-4 md:py-6">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Explore", path: "/explore" }, { name: `#${tag}`, path: `/tags/${tag}` }])} />
      <header className="flex flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center md:px-0">
        <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand text-white sm:size-28">
          <Hash className="size-10 sm:size-14" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">#{tag}</h1>
          <p className="mt-1 text-muted">
            <strong className="text-fg">{compact(total)}</strong> showcases · <strong className="text-fg">{compact(likes)}</strong> likes
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {creators.slice(0, 5).map((u) => (
                <Link key={u.id} href={`/u/${u.username}`} title={`@${u.username}`}>
                  <Avatar user={u} size={28} className="ring-2 ring-bg" />
                </Link>
              ))}
            </div>
            <span className="text-sm text-muted">Top creators in #{tag}</span>
          </div>
        </div>
      </header>
      {relatedTags.length > 0 && (
        <nav aria-label="Related tags" className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4 md:px-0">
          {relatedTags.map((t) => (
            <Link key={t} href={`/tags/${t}`} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-elevated">
              #{t}
            </Link>
          ))}
        </nav>
      )}
      <TileGrid posts={posts.slice(0, 36)} />
    </div>
  );
}
