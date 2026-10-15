import { Clapperboard, ChevronRight, Repeat2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/art/Avatar";
import { ASPECT } from "@/components/media/shared";
import { Comments } from "@/components/post/Comments";
import { TileGrid } from "@/components/post/ExploreTile";
import { PostActions } from "@/components/post/PostActions";
import { PostMenu } from "@/components/post/PostMenu";
import { PostStage } from "@/components/post/PostStage";
import { PromptBox } from "@/components/post/PromptPeek";
import { ViewCounter } from "@/components/post/ViewCounter";
import { FollowButton } from "@/components/ui/client-bits";
import { JsonLd, KindBadge, SectionTitle, VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { compact, fullDate, truncate } from "@/lib/format";
import { KIND_MAP, VISUAL_KINDS } from "@/lib/kinds";
import { tagHref } from "@/lib/links";
import { breadcrumbJsonLd, postJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getComments } from "@/server/queries/activity";
import { getAuthorPosts, getPost, getRelatedPosts } from "@/server/queries/posts";
import { getViewer } from "@/server/session";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id, null);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const kind = KIND_MAP[post.kind].label.toLowerCase();
  const title = `${post.title} — AI ${kind} by @${post.author.username}`;
  const description = truncate([post.caption, post.prompt && `Prompt: “${post.prompt}”`, post.model && `Made with ${post.model}.`].filter(Boolean).join(" "), 160);
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
  const viewer = await getViewer();
  const post = await getPost(id, viewer?.id ?? null);
  if (!post) notFound();

  const [comments, more, related] = await Promise.all([
    getComments(post.id, viewer?.id ?? null),
    getAuthorPosts(post.author.id, viewer?.id ?? null, post.id, 6),
    getRelatedPosts(post, viewer?.id ?? null, 9),
  ]);
  const textLike = !VISUAL_KINDS.includes(post.kind);
  const authorHref = `/u/${post.author.username}`;
  const hasPrompt = post.prompt.length > 0;

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
      <ViewCounter postId={post.id} />
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
          <PostStage post={post} className={cn(!textLike && cn(ASPECT[post.aspect], "lg:aspect-auto lg:h-full"), "lg:h-full")} mediaClassName="h-full" />
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
              <p className="truncate text-sm text-muted">{post.author.headline || `@${post.author.username}`}</p>
            </div>
            <FollowButton userId={post.author.id} following={post.viewer.following} isSelf={post.viewer.owner} />
            <PostMenu post={post} />
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <KindBadge kind={post.kind} />
                <time dateTime={post.createdAt}>{fullDate(post.createdAt)}</time>
              </div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-balance">{post.title}</h1>
              {post.remixOf && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                  <Repeat2 className="size-4" aria-hidden />
                  Remix of{" "}
                  <Link href={`/p/${post.remixOf.id}`} className="font-medium text-accent hover:underline">
                    {post.remixOf.title}
                  </Link>{" "}
                  by @{post.remixOf.username}
                </p>
              )}
              {post.caption && <p className="mt-2 whitespace-pre-line break-words text-[15px] text-fg/90">{post.caption}</p>}
            </div>

            {hasPrompt && <PromptBox post={post} />}

            <dl className="grid grid-cols-3 gap-2 text-sm">
              {[
                ["Model", post.model],
                ["Views", compact(post.stats.views)],
                ["Saves", compact(post.stats.saves)],
                ["Remixes", compact(post.stats.remixes)],
                ["Format", KIND_MAP[post.kind].label],
                ["Posted", fullDate(post.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-elevated px-3 py-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="truncate font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Link key={t} href={tagHref(t)} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-elevated">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            <Comments
              postId={post.id}
              initial={comments}
              total={post.stats.comments}
              viewer={viewer ? { name: viewer.name, username: viewer.username, avatar: viewer.avatar } : null}
            />
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

      {related.length > 0 && (
        <section className="mt-10 px-1 sm:px-0">
          <SectionTitle>You might also like</SectionTitle>
          <TileGrid posts={related} />
        </section>
      )}
    </div>
  );
}
