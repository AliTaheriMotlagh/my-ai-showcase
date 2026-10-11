"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/art/Avatar";
import { TimeAgo } from "@/components/ui/client-bits";
import { VerifiedBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { compact } from "@/lib/format";
import { profileHref } from "@/lib/links";
import { actions, meAsUser, useAppStore } from "@/lib/store";
import type { Comment } from "@/lib/types";

const EMPTY: never[] = [];

export function Comments({ postId, initial, total }: { postId: string; initial: Comment[]; total: number }) {
  const local = useAppStore((s) => s.comments[postId] ?? EMPTY);
  const me = useAppStore((s) => s.me);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const author = meAsUser(me);
  const list: Comment[] = [...local.map((c) => ({ id: c.id, author, text: c.text, createdAt: c.createdAt, likes: 0 })), ...initial];

  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <h2 id="comments-heading" className="mb-3 text-sm font-semibold">
        Comments <span className="font-normal text-muted">{compact(total + local.length)}</span>
      </h2>
      <form
        className="mb-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          actions.addComment(postId, text.trim());
          setText("");
        }}
      >
        <Avatar user={author} size={32} />
        <label htmlFor={`comment-${postId}`} className="sr-only">
          Add a comment
        </label>
        <input
          id={`comment-${postId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Add a comment…"
          className="input flex-1 !rounded-full !py-2"
        />
        <button type="submit" disabled={!text.trim()} className="px-2 text-sm font-semibold text-accent disabled:opacity-40">
          Post
        </button>
      </form>
      <ul className="space-y-4">
        {list.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Link href={profileHref(c.author)} className="shrink-0">
              <Avatar user={c.author} size={32} />
            </Link>
            <div className="min-w-0 flex-1 text-sm">
              <p>
                <Link href={profileHref(c.author)} className="mr-1.5 inline-flex items-center gap-1 font-semibold hover:underline">
                  {c.author.username}
                  {c.author.verified && <VerifiedBadge className="size-3.5" />}
                </Link>
                {c.text}
              </p>
              <div className="mt-1 flex gap-3 text-xs text-muted">
                <TimeAgo iso={c.createdAt} />
                {c.likes + (liked[c.id] ? 1 : 0) > 0 && <span>{compact(c.likes + (liked[c.id] ? 1 : 0))} likes</span>}
              </div>
            </div>
            <button
              type="button"
              aria-label={liked[c.id] ? "Unlike comment" : "Like comment"}
              aria-pressed={!!liked[c.id]}
              onClick={() => setLiked((l) => ({ ...l, [c.id]: !l[c.id] }))}
              className="self-start p-1 text-muted hover:text-fg"
            >
              <Heart className={cn("size-3.5", liked[c.id] && "fill-like text-like")} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
