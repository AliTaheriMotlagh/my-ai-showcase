import { Clapperboard, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/art/Avatar";
import { PostMedia } from "@/components/media/PostMedia";
import { ASPECT } from "@/components/media/shared";
import { Comments } from "@/components/post/Comments";
import { LikeOnDoubleTap } from "@/components/post/DoubleTap";
import { TileGrid } from "@/components/post/ExploreTile";
import { LocalPostView } from "@/components/post/LocalPostView";
import { PostActions } from "@/components/post/PostActions";
import { PromptBox } from "@/components/post/PromptPeek";
import { FollowButton } from "@/components/ui/client-bits";
import { JsonLd, KindBadge, SectionTitle, VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { getComments, getPost, getRelated, postsByAuthor } from "@/lib/data";
import { compact, fullDate, truncate } from "@/lib/format";
import { KIND_MAP, VISUAL_KINDS } from "@/lib/kinds";
import { tagHref } from "@/lib/links";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd, postJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id.startsWith("local-")) return { title: "Your post", robots: { index: false } };
  const post = getPost(id);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const kind = KIND_MAP[post.kind].label.toLowerCase();
  const title = `${post.title} — AI ${kind} by @${post.author.username}`;
  const description = truncate(`${post.caption} Prompt: “${post.prompt}”. Made with ${post.model}.`, 160);
  return {
    title,
    description,
    keywords: [...post.tags, post.model, `AI ${kind}`],
    alternates: { canonical: `/p/${post.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/p/${post.id}`,
      publishedTime: post.createdAt,
      authors: [absoluteUrl(`/u/${post.author.username}`)],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  if (id.startsWith("local-")) return <LocalPostView id={id} />;
  const post = getPost(id);
  if (!post) notFound();

  const comments = getComments(post);
  const more = postsByAuthor(post.authorId).filter((p) => p.id !== post.id).slice(0, 6);
  const related = getRelated(post, 9);
  const textLike = !VISUAL_KINDS.includes(post.kind);
  const authorHref = `/u/${post.author.username}`;

  return (
    <div className="mx-auto w-full max-w-6xl pb-12 sm:px-4 md:py-6">
      <JsonLd data={postJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: `@${post.author.username}`, path: authorHref },
          { name: post.title, path: `/p/${post.id}` },
        ])}
      />
      <nav aria-label="Breadcrumb" className="hidden items-center gap-1 pb-4 text-sm text-muted sm:flex">
        <Link href="/" className="hover:text-fg">
          Home
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <Link href={authorHref} className="hover:text-fg">
          @{post.author.username}
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="truncate text-fg" aria-current="page">
          {post.title}
        </span>
      </nav>

      <article className="overflow-hidden bg-card sm:rounded-2xl sm:border sm:border-line lg:grid lg:h-[min(88vh,880px)] lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className={cn("relative lg:h-full lg:min-h-0", textLike ? "bg-elevated" : "bg-black")}>
          <LikeOnDoubleTap postId={post.id} className={cn("w-full lg:h-full", !textLike && cn(ASPECT[post.aspect], "lg:aspect-auto"))}>
            <PostMedia post={post} variant="full" />
          </LikeOnDoubleTap>
        </div>

        <aside className="flex min-h-0 flex-col lg:border-l lg:border-line">
          <header className="flex items-center gap-3 border-b border-line p-4">
            <Link href={authorHref} className="shrink-0">
              <Avatar user={post.author} size={40} ring />
            </Link>
            <div className="min-w-0 flex-1 leading-tight">
              <Link href={authorHref} className="flex items-center gap-1 font-semibold hover:underline">
                <span className="truncate">{post.author.name}</span>
                {post.author.verified && <VerifiedBadge />}
              </Link>
              <p className="truncate text-sm text-muted">{post.author.headline}</p>
            </div>
            <FollowButton userId={post.author.id} />
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <KindBadge kind={post.kind} />
                <time dateTime={post.createdAt}>{fullDate(post.createdAt)}</time>
              </div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-balance">{post.title}</h1>
              <p className="mt-2 whitespace-pre-line text-[15px] text-fg/90">{post.caption}</p>
            </div>

            <PromptBox post={post} />

            <dl className="grid grid-cols-3 gap-2 text-sm">
              {[
                ["Model", post.model],
                ["Views", compact(post.stats.views)],
                ["Saves", compact(post.stats.saves)],
                ["Remixes", compact(post.stats.remixes)],
                ["Seed", String(post.visuals[0].seed % 100_000)],
                ["Format", KIND_MAP[post.kind].label],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-elevated px-3 py-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="truncate font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link key={t} href={tagHref(t)} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-elevated">
                  #{t}
                </Link>
              ))}
            </div>

            <Comments postId={post.id} initial={comments} total={post.stats.comments} />
          </div>

          <div className="flex items-center gap-2 border-t border-line p-2">
            <PostActions post={post} className="flex-1" />
            <Link href={`/flow?start=${post.id}`} className="mr-1 hidden items-center gap-1.5 rounded-full bg-elevated px-3 py-2 text-sm font-semibold hover:bg-line sm:flex">
              <Clapperboard className="size-4" aria-hidden /> Flow
            </Link>
          </div>
        </aside>
      </article>

      {more.length > 0 && (
        <section className="mt-10 px-1 sm:px-0">
          <SectionTitle
            action={
              <Link href={authorHref} className="text-sm font-semibold text-accent">
                View profile
              </Link>
            }
          >
            More from @{post.author.username}
          </SectionTitle>
          <TileGrid posts={more} className="grid grid-cols-3 gap-0.5 sm:grid-cols-6 sm:gap-1.5" />
        </section>
      )}

      <section className="mt-10 px-1 sm:px-0">
        <SectionTitle>You might also like</SectionTitle>
        <TileGrid posts={related} />
      </section>
    </div>
  );
}
