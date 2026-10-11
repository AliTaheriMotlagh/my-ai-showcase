"use client";

import { Bookmark, Grid3x3, Heart, Pencil, Shuffle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/art/Avatar";
import { TileGrid } from "@/components/post/ExploreTile";
import { ShareButton } from "@/components/ui/client-bits";
import { Spinner } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { fetchFeed } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { PALETTES } from "@/lib/palettes";
import { actions, meAsUser, useAppStore, useHydrated, type Me } from "@/lib/store";
import type { FeedPost } from "@/lib/types";
import { ProfileHeader } from "./ProfileHeader";

type Tab = "posts" | "saved" | "liked";

export function MeView() {
  const hydrated = useHydrated();
  const me = useAppStore((s) => s.me);
  const posts = useAppStore((s) => s.posts);
  const liked = useAppStore((s) => s.liked);
  const saved = useAppStore((s) => s.saved);
  const following = useAppStore((s) => s.following);
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [remote, setRemote] = useState<{ key: string; items: FeedPost[] } | null>(null);

  const ids = tab === "saved" ? saved : liked;
  const remoteIds = useMemo(() => Object.keys(ids).filter((id) => !id.startsWith("local-")).slice(0, 100).join(","), [ids]);

  const remoteKey = `${tab}:${remoteIds}`;

  useEffect(() => {
    if (tab === "posts") return;
    let cancelled = false;
    (remoteIds ? fetchFeed({ feed: "ids", ids: remoteIds }) : Promise.resolve({ items: [], nextCursor: null }))
      .then((page) => !cancelled && setRemote({ key: remoteKey, items: page.items }))
      .catch(() => !cancelled && setRemote({ key: remoteKey, items: [] }));
    return () => {
      cancelled = true;
    };
  }, [tab, remoteIds, remoteKey]);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const user = meAsUser(me);
  const list =
    tab === "posts" ? posts : remote?.key === remoteKey ? [...posts.filter((p) => ids[p.id]), ...remote.items] : null;
  const tabs: { id: Tab; label: string; icon: typeof Grid3x3 }[] = [
    { id: "posts", label: "Posts", icon: Grid3x3 },
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "liked", label: "Liked", icon: Heart },
  ];

  return (
    <div className="mx-auto w-full max-w-[935px] pb-12 md:px-4">
      <ProfileHeader
        user={{ ...user, headline: "" }}
        showMeta={false}
        stats={[
          { label: "Posts", value: posts.length },
          { label: "Followers", value: 0 },
          { label: "Following", value: Object.keys(following).length },
          { label: "Saved", value: Object.keys(saved).length },
        ]}
        actions={
          <>
            <span className="hidden sm:block">
              <ShareButton path="/me" title="My Latent profile" />
            </span>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg">
              <Pencil className="size-4" aria-hidden /> Edit profile
            </button>
          </>
        }
      />

      <div role="tablist" aria-label="Profile sections" className="mt-6 grid grid-cols-3 border-t border-line">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mt-px flex items-center justify-center gap-2 border-t py-3 text-sm font-semibold uppercase tracking-wider",
              tab === id ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            <Icon className="size-4" aria-hidden /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="pt-1">
        {list === null ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : list.length ? (
          <TileGrid posts={list} />
        ) : (
          <EmptyTab tab={tab} />
        )}
      </div>

      {editing && <EditProfile me={me} onClose={() => setEditing(false)} />}
    </div>
  );
}

function EmptyTab({ tab }: { tab: Tab }) {
  const copy = {
    posts: { title: "Share your first creation", body: "Images, video, music, writing, code — anything you made with AI.", href: "/create", cta: "Create a post" },
    saved: { title: "Nothing saved yet", body: "Tap the bookmark on any post to keep it here for later.", href: "/explore", cta: "Explore" },
    liked: { title: "No likes yet", body: "Double-tap anything you love. It will show up here.", href: "/flow", cta: "Open Flow" },
  }[tab];
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 px-6 py-16 text-center">
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <p className="text-sm text-muted">{copy.body}</p>
      <Link href={copy.href} className="mt-3 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
        {copy.cta}
      </Link>
    </div>
  );
}

function EditProfile({ me, onClose }: { me: Me; onClose: () => void }) {
  const [draft, setDraft] = useState(me);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet w-full max-w-md rounded-t-3xl border border-line bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center">
          <h2 id="edit-title" className="text-lg font-semibold">
            Edit profile
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto rounded-full p-1.5 hover:bg-elevated">
            <X className="size-5" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            actions.updateMe({ ...draft, name: draft.name.trim() || "You", username: draft.username || "you" });
            toast("Profile updated");
            onClose();
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar user={draft} size={64} />
            <div className="flex flex-wrap gap-1.5">
              {PALETTES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  title={p.name}
                  aria-label={`${p.name} palette`}
                  aria-pressed={draft.palette === p.colors}
                  onClick={() => setDraft({ ...draft, palette: p.colors })}
                  className={cn("size-6 rounded-full ring-offset-2 ring-offset-card", draft.palette.join() === p.colors.join() && "ring-2 ring-fg")}
                  style={{ background: `linear-gradient(135deg, ${p.colors[1]}, ${p.colors[3]})` }}
                />
              ))}
              <button
                type="button"
                aria-label="Shuffle avatar"
                onClick={() => setDraft({ ...draft, avatarSeed: Math.floor(Math.random() * 1e9) })}
                className="grid size-6 place-items-center rounded-full bg-elevated"
              >
                <Shuffle className="size-3.5" />
              </button>
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Name</span>
            <input className="input" value={draft.name} maxLength={40} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Username</span>
            <input
              className="input"
              value={draft.username}
              maxLength={24}
              onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Bio</span>
            <textarea className="input min-h-24 resize-none" value={draft.bio} maxLength={160} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            <span className="block text-right text-xs text-muted">{draft.bio.length}/160</span>
          </label>
          <button type="submit" className="w-full rounded-xl bg-brand py-3 font-semibold text-white">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
