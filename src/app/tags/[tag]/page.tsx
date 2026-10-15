import { Hash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/art/Avatar";
import { TileGrid } from "@/components/post/ExploreTile";
import { JsonLd } from "@/components/ui/primitives";
import { compact } from "@/lib/format";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getFeedPage } from "@/server/queries/posts";
import { getTagStats, getTrendingTags } from "@/server/queries/discover";
import { getViewer } from "@/server/session";

type Props = { params: Promise<{ tag: string }> };

const normalize = (raw: string) => decodeURIComponent(raw).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normalize((await params).tag);
  const { total } = await getTagStats(tag);
  if (!total) return { title: `#${tag}`, robots: { index: false } };
  return {
    title: `#${tag} — AI art, prompts & creations`,
    description: `Browse ${total} AI showcases tagged #${tag}: images, video, music, code and more, with the prompts behind them.`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: Props) {
  const tag = normalize((await params).tag);
  if (!tag) notFound();
  const viewer = await getViewer();
  const [{ total, likes }, page, trending] = await Promise.all([
    getTagStats(tag),
    getFeedPage({ feed: "tag", tag, viewerId: viewer?.id ?? null, limit: 24 }),
    getTrendingTags(12),
  ]);
  if (!total) notFound();

  const creators = [...new Map(page.items.map((p) => [p.author.id, p.author])).values()].slice(0, 8);
  const related = trending.filter((t) => t.tag !== tag).slice(0, 10);

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
          {creators.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {creators.slice(0, 5).map((u) => (
                  <Link key={u.id} href={`/u/${u.username}`} title={`@${u.username}`}>
                    <Avatar user={u} size={28} className="ring-2 ring-bg" />
                  </Link>
                ))}
              </div>
              <span className="text-sm text-muted">Creators in #{tag}</span>
            </div>
          )}
        </div>
      </header>
      {related.length > 0 && (
        <nav aria-label="Related tags" className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4 md:px-0">
          {related.map((t) => (
            <Link key={t.tag} href={`/tags/${t.tag}`} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-elevated">
              #{t.tag}
            </Link>
          ))}
        </nav>
      )}
      <TileGrid posts={page.items} />
    </div>
  );
}
