import { AtSign, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/art/Avatar";
import { ExploreTile } from "@/components/post/ExploreTile";
import { FollowButton, TimeAgo } from "@/components/ui/client-bits";
import { getNotificationGroups, type Notification } from "@/lib/data";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };
export const revalidate = 3600;

const ICONS = {
  like: { icon: Heart, cls: "bg-like text-white" },
  follow: { icon: UserPlus, cls: "bg-sky-500 text-white" },
  comment: { icon: MessageCircle, cls: "bg-emerald-500 text-white" },
  remix: { icon: Repeat2, cls: "bg-violet-500 text-white" },
  mention: { icon: AtSign, cls: "bg-amber-500 text-white" },
};

function describe(n: Notification) {
  const others = n.count ? ` and ${n.count} others` : "";
  switch (n.type) {
    case "like":
      return <>{others} liked <strong>{n.post?.title}</strong></>;
    case "follow":
      return <> started following you</>;
    case "comment":
      return <> commented on <strong>{n.post?.title}</strong>: “{n.text}”</>;
    case "remix":
      return <> remixed the prompt from <strong>{n.post?.title}</strong></>;
    case "mention":
      return <> mentioned you: “{n.text}”</>;
  }
}

export default function NotificationsPage() {
  const groups = getNotificationGroups();

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-4 md:pt-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
      {groups.map((g) => (
        <section key={g.label} className="mb-6">
          <h2 className="mb-2 font-semibold">{g.label}</h2>
          <ul>
            {g.items.map((n) => {
              const { icon: Icon, cls } = ICONS[n.type];
              return (
                <li key={n.id} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-elevated/60">
                  <Link href={`/u/${n.user.username}`} className="relative shrink-0">
                    <Avatar user={n.user} size={44} />
                    <span className={`absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full ring-2 ring-bg ${cls}`} aria-hidden>
                      <Icon className="size-3" />
                    </span>
                  </Link>
                  <p className="min-w-0 flex-1 text-sm leading-snug">
                    <Link href={`/u/${n.user.username}`} className="font-semibold hover:underline">
                      {n.user.username}
                    </Link>
                    {describe(n)} <TimeAgo iso={n.createdAt} className="text-muted" />
                  </p>
                  {n.post ? (
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                      <ExploreTile post={n.post} />
                    </div>
                  ) : (
                    <FollowButton userId={n.user.id} />
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
