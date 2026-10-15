import type { Metadata } from "next";
import { FlowViewer } from "@/components/feed/FlowViewer";
import { getProfileByUsername } from "@/server/queries/people";
import { getFeedPage, getPost } from "@/server/queries/posts";
import { newFeedSeed } from "@/server/seed";
import { getViewer } from "@/server/session";

type Props = { searchParams: Promise<{ user?: string; start?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { user } = await searchParams;
  const u = user ? await getProfileByUsername(user) : null;
  return {
    title: u ? `${u.name} (@${u.username}) in Flow` : "Flow — endless AI showcase",
    description: "Swipe through an endless, full-screen stream of AI-made video, art, music, writing and code.",
    alternates: { canonical: "/flow" },
  };
}

export default async function FlowPage({ searchParams }: Props) {
  const { user, start } = await searchParams;
  const viewer = await getViewer();
  const seed = newFeedSeed();
  const u = user ? await getProfileByUsername(user) : null;
  const first = u
    ? await getFeedPage({ feed: "user", user: u.username, viewerId: viewer?.id ?? null, limit: 6 })
    : await getFeedPage({ feed: "explore", viewerId: viewer?.id ?? null, seed, limit: 6 });
  const startPost = start && /^[a-z0-9]{10}$/.test(start) ? await getPost(start, viewer?.id ?? null) : null;
  const items = startPost ? [startPost, ...first.items.filter((p) => p.id !== startPost.id)] : first.items;

  return (
    <>
      <h1 className="sr-only">Flow</h1>
      <FlowViewer key={`${u?.username}:${start}:${seed}`} initial={items} initialCursor={first.nextCursor} seed={seed} user={u?.username} />
    </>
  );
}
