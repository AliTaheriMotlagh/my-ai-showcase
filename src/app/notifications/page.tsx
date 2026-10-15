import { AtSign, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { NotificationsReader } from "@/components/notifications/NotificationsReader";
import { FollowButton, TimeAgo } from "@/components/ui/client-bits";
import type { AppNotification } from "@/lib/types";
import { getNotifications } from "@/server/queries/activity";
import { isFollowing } from "@/server/queries/people";
import { requireViewer } from "@/server/session";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

const ICONS = {
  like: { icon: Heart, cls: "bg-like text-white" },
  follow: { icon: UserPlus, cls: "bg-sky-500 text-white" },
  comment: { icon: MessageCircle, cls: "bg-emerald-500 text-white" },
  remix: { icon: Repeat2, cls: "bg-violet-500 text-white" },
};

function describe(n: AppNotification) {
  const title = n.post?.title ?? "your post";
  switch (n.type) {
    case "like":
      return (
        <>
          {" "}
          liked <strong>{title}</strong>
        </>
      );
    case "follow":
      return <> started following you</>;
    case "comment":
      return (
        <>
          {" "}
          commented on <strong>{title}</strong>: “{n.text}”
        </>
      );
    case "remix":
      return (
        <>
          {" "}
          remixed the prompt from <strong>{title}</strong>
        </>
      );
  }
}

const GROUP_LABELS: Record<AppNotification["group"], string> = { today: "Today", week: "This week", earlier: "Earlier" };

export default async function NotificationsPage() {
  const viewer = await requireViewer("/notifications");
  const items = await getNotifications(viewer.id);
  const groups = (["today", "week", "earlier"] as const)
    .map((g) => ({ label: GROUP_LABELS[g], items: items.filter((n) => n.group === g) }))
    .filter((g) => g.items.length);

  // Follow state for people who followed you, so the button can offer "follow back" correctly.
  const followers = [...new Set(items.filter((n) => n.type === "follow").map((n) => n.actor.id))];
  const followState = new Map(await Promise.all(followers.map(async (id) => [id, await isFollowing(viewer.id, id)] as const)));

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-4 md:pt-8">
      <NotificationsReader unread={items.some((n) => !n.read)} />
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
      {groups.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-semibold">No activity yet</p>
          <p className="mt-1 text-sm text-muted">When people like, comment, follow or remix your work, it shows up here.</p>
          <Link href="/create" className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
            Share something
          </Link>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.label} className="mb-6">
          <h2 className="mb-2 font-semibold">{g.label}</h2>
          <ul>
            {g.items.map((n) => {
              const { icon: Icon, cls } = ICONS[n.type];
              return (
                <li key={n.id} className={`-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-elevated/60 ${n.read ? "" : "bg-elevated/50"}`}>
                  <Link href={`/u/${n.actor.username}`} className="relative shrink-0">
                    <Avatar user={n.actor} size={44} />
                    <span className={`absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full ring-2 ring-bg ${cls}`} aria-hidden>
                      <Icon className="size-3" />
                    </span>
                  </Link>
                  <p className="min-w-0 flex-1 break-words text-sm leading-snug">
                    <Link href={`/u/${n.actor.username}`} className="font-semibold hover:underline">
                      {n.actor.username}
                    </Link>
                    {describe(n)} <TimeAgo iso={n.createdAt} className="text-muted" />
                  </p>
                  {n.post ? (
                    <Link href={`/p/${n.post.id}`} className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-elevated" aria-label={`Open ${n.post.title}`}>
                      {n.post.thumb && (
                        // eslint-disable-next-line @next/next/no-img-element -- user upload on Blob storage
                        <img src={n.post.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                      )}
                    </Link>
                  ) : n.type === "follow" ? (
                    <FollowButton userId={n.actor.id} following={followState.get(n.actor.id) ?? false} />
                  ) : (
                    <AtSign className="size-4 text-muted" aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
