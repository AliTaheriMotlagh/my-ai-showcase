import type { Metadata } from "next";
import { HomeFeed } from "@/components/feed/HomeFeed";
import { StoriesRow } from "@/components/feed/StoriesRow";
import { RightRail } from "@/components/layout/RightRail";
import { getFeedPage, topCreators } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const first = getFeedPage({ feed: "foryou", cursor: 0, limit: 8 });
  return (
    <div className="mx-auto flex w-full max-w-[1040px] justify-center gap-12 sm:px-4 md:pb-10">
      <div className="w-full min-w-0 max-w-[600px]">
        <h1 className="sr-only">
          {site.name} — {site.tagline}
        </h1>
        <HomeFeed initial={first.items} initialCursor={first.nextCursor}>
          <StoriesRow users={topCreators(14)} />
        </HomeFeed>
      </div>
      <RightRail className="hidden w-[320px] shrink-0 pt-6 xl:block" />
    </div>
  );
}
