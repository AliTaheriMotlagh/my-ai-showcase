"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createCommentAction, deleteCommentAction } from "@/app/actions";
import { Avatar } from "@/components/art/Avatar";
import { TimeAgo } from "@/components/ui/client-bits";
import { toast } from "@/components/ui/toast";
import { VerifiedBadge } from "@/components/ui/primitives";
import { compact } from "@/lib/format";
import { profileHref } from "@/lib/links";
import { LIMITS } from "@/lib/rules";
import type { Comment } from "@/lib/types";

export interface CommentViewer {
  name: string;
  username: string;
  avatar: string | null;
}

export function Comments({
  postId,
  initial,
  total,
  viewer,
}: {
  postId: string;
  initial: Comment[];
  total: number;
  viewer: CommentViewer | null;
}) {
  const [list, setList] = useState<Comment[]>(initial);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const body = text.trim();
    if (!body || pending) return;
    startTransition(async () => {
      const result = await createCommentAction(postId, body);
      if (!result.ok) return toast(result.needsAuth ? "Log in to comment." : result.error);
      setList((prev) => [...prev, result.data]);
      setText("");
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    startTransition(async () => {
      const result = await deleteCommentAction(id);
      if (!result.ok) return toast(result.error);
      setList((prev) => prev.filter((c) => c.id !== id));
    });
  };

  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <h2 id="comments-heading" className="mb-3 text-sm font-semibold">
        Comments <span className="font-normal text-muted">{compact(Math.max(total, list.length))}</span>
      </h2>

      {viewer ? (
        <form
          className="mb-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Avatar user={viewer} size={32} />
          <label htmlFor={`comment-${postId}`} className="sr-only">
            Add a comment
          </label>
          <input
            id={`comment-${postId}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={LIMITS.comment}
            placeholder="Add a comment…"
            className="input flex-1 !rounded-full !py-2"
          />
          <button type="submit" disabled={!text.trim() || pending} className="px-2 text-sm font-semibold text-accent disabled:opacity-40">
            Post
          </button>
        </form>
      ) : (
        <p className="mb-4 text-sm text-muted">
          <Link href={`/login?next=/p/${postId}`} className="font-semibold text-accent hover:underline">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Link href={profileHref(c.author)} className="shrink-0">
                <Avatar user={c.author} size={32} />
              </Link>
              <div className="min-w-0 flex-1 text-sm">
                <p className="whitespace-pre-line break-words">
                  <Link href={profileHref(c.author)} className="mr-1.5 inline-flex items-center gap-1 font-semibold hover:underline">
                    {c.author.username}
                    {c.author.verified && <VerifiedBadge className="size-3.5" />}
                  </Link>
                  {c.text}
                </p>
                <div className="mt-1 flex gap-3 text-xs text-muted">
                  <TimeAgo iso={c.createdAt} />
                  {c.canDelete && (
                    <button type="button" onClick={() => remove(c.id)} className="hover:text-like">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
