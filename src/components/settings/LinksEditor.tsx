"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { addLinkAction, deleteLinkAction, moveLinkAction, updateLinkAction } from "@/app/actions";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/primitives";
import { LIMITS } from "@/lib/rules";
import type { ProfileLink } from "@/lib/types";

/** The link-in-bio list. Every change is saved straight away, and the list is replaced by the server's copy. */
export function LinksEditor({ initial }: { initial: ProfileLink[] }) {
  const [links, setLinks] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();

  const open = (link: ProfileLink | null) => {
    setEditing(link?.id ?? "new");
    setTitle(link?.title ?? "");
    setUrl(link?.url ?? "");
  };

  const save = () => {
    startTransition(async () => {
      const result = editing === "new" ? await addLinkAction({ title, url }) : await updateLinkAction(editing!, { title, url });
      if (!result.ok) return toast(result.error);
      setLinks(result.data);
      setEditing(null);
      toast(editing === "new" ? "Link added" : "Link saved");
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Remove this link?")) return;
    startTransition(async () => {
      const result = await deleteLinkAction(id);
      if (!result.ok) return toast(result.error);
      setLinks(result.data);
    });
  };

  const move = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      const result = await moveLinkAction(id, direction);
      if (!result.ok) return toast(result.error);
      setLinks(result.data);
    });
  };

  return (
    <div className="space-y-4">
      {links.length === 0 && editing === null && (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Add your portfolio, store, newsletter or socials. They appear as buttons on your profile.
        </p>
      )}

      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={l.id} className="flex items-center gap-2 rounded-2xl border border-line bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.title}</p>
              <p className="truncate text-xs text-muted">
                {l.url} · {l.clicks} {l.clicks === 1 ? "click" : "clicks"}
              </p>
            </div>
            <button type="button" aria-label={`Move ${l.title} up`} disabled={i === 0 || pending} onClick={() => move(l.id, "up")} className="grid size-9 place-items-center rounded-lg hover:bg-elevated disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" aria-label={`Move ${l.title} down`} disabled={i === links.length - 1 || pending} onClick={() => move(l.id, "down")} className="grid size-9 place-items-center rounded-lg hover:bg-elevated disabled:opacity-30">
              <ArrowDown className="size-4" />
            </button>
            <button type="button" aria-label={`Edit ${l.title}`} disabled={pending} onClick={() => open(l)} className="grid size-9 place-items-center rounded-lg hover:bg-elevated">
              <Pencil className="size-4" />
            </button>
            <button type="button" aria-label={`Delete ${l.title}`} disabled={pending} onClick={() => remove(l.id)} className="grid size-9 place-items-center rounded-lg text-muted hover:text-like">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {editing !== null ? (
        <form
          className="space-y-3 rounded-2xl border border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Title</span>
            <input className="input" value={title} maxLength={LIMITS.linkTitle} onChange={(e) => setTitle(e.target.value)} placeholder="My portfolio" required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Link</span>
            <input className="input" value={url} maxLength={LIMITS.linkUrl} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" required />
            <span className="block text-xs text-muted">Only web addresses (http or https) are allowed.</span>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:text-fg">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60">
              {pending && <Spinner className="size-3.5" />} Save link
            </button>
          </div>
        </form>
      ) : (
        links.length < LIMITS.links && (
          <button type="button" onClick={() => open(null)} className="inline-flex items-center gap-2 rounded-xl bg-elevated px-4 py-2.5 text-sm font-semibold hover:bg-line">
            <Plus className="size-4" aria-hidden /> Add link
          </button>
        )
      )}
    </div>
  );
}
