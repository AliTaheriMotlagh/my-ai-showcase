import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/HomeFeed";
import { StoriesRow } from "@/components/feed/StoriesRow";
import { RightRail } from "@/components/layout/RightRail";
import { site } from "@/lib/site";
import { getFeedPage } from "@/server/queries/posts";
import { getTopCreators } from "@/server/queries/people";
import { getViewer } from "@/server/session";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const viewer = await getViewer();
  const [first, creators] = await Promise.all([
    getFeedPage({ feed: "foryou", viewerId: viewer?.id ?? null, cursor: 0, limit: 8 }),
    getTopCreators({ limit: 14, viewerId: viewer?.id ?? null }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1040px] justify-center gap-12 sm:px-4 md:pb-10">
      <div className="w-full min-w-0 max-w-[600px]">
        <h1 className="sr-only">
          {site.name} — {site.tagline}
        </h1>
        <HomeFeed initial={first.items} initialCursor={first.nextCursor} signedIn={!!viewer}>
          <StoriesRow users={creators} signedIn={!!viewer} />
        </HomeFeed>
      </div>
      <RightRail viewer={viewer} className="hidden w-[320px] shrink-0 pt-6 xl:block" />
    </div>
  );
}
