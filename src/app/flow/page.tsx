import type { Metadata } from "next";
import { FlowViewer } from "@/components/feed/FlowViewer";
import { getFeedPage, getPost, getUser, newFeedSeed } from "@/lib/data";

type Props = { searchParams: Promise<{ user?: string; start?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { user } = await searchParams;
  const u = user ? getUser(user) : undefined;
  return {
    title: u ? `${u.name} (@${u.username}) in Flow` : "Flow — endless AI showcase",
    description: "Swipe through an endless, full-screen stream of AI-made video, art, music, writing and code.",
    alternates: { canonical: "/flow" },
  };
}

export default async function FlowPage({ searchParams }: Props) {
  const { user, start } = await searchParams;
  const seed = newFeedSeed();
  const u = user ? getUser(user) : undefined;
  const first = u ? getFeedPage({ feed: "user", user: u.username, limit: 6 }) : getFeedPage({ feed: "explore", seed, limit: 6 });
  const startPost = start ? getPost(start) : undefined;
  const items = startPost ? [startPost, ...first.items.filter((p) => p.id !== startPost.id)] : first.items;

  return (
    <>
      <h1 className="sr-only">Flow</h1>
      <FlowViewer key={`${u?.username}:${start}:${seed}`} initial={items} initialCursor={first.nextCursor} seed={seed} user={u?.username} />
    </>
  );
}
