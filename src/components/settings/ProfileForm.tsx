"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions";
import { Avatar } from "@/components/art/Avatar";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/primitives";
import { uploadFile } from "@/lib/upload";
import { LIMITS } from "@/lib/rules";
import type { UserProfile } from "@/lib/types";

type Images = { avatar: string | null; banner: string | null };

export function ProfileForm({ profile, userId }: { profile: UserProfile; userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [images, setImages] = useState<Images>({ avatar: profile.avatar, banner: profile.banner });
  const [draft, setDraft] = useState({
    name: profile.name,
    username: profile.username,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    tools: profile.tools.join(", "),
  });
  const [error, setError] = useState("");

  const change = (key: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const pick = async (file: File | undefined, kind: "avatar" | "banner") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Choose an image file.");
    const limit = kind === "avatar" ? 5 : 10;
    if (file.size > limit * 1024 * 1024) return toast(`That image is over ${limit} MB.`);
    setUploading(kind);
    try {
      const url = await uploadFile(file, kind, userId);
      setImages((i) => ({ ...i, [kind]: url }));
    } catch {
      toast("The image didn't upload. Try again.");
    } finally {
      setUploading(null);
    }
  };

  const save = () => {
    setError("");
    startTransition(async () => {
      const result = await updateProfileAction({
        ...draft,
        tools: draft.tools.split(",").map((t) => t.trim()).filter(Boolean),
        avatar: images.avatar,
        banner: images.banner,
      });
      if (!result.ok) return setError(result.error);
      toast("Profile saved");
      router.refresh();
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="relative h-28 bg-elevated">
          {images.banner && (
            // eslint-disable-next-line @next/next/no-img-element -- user upload on Blob storage
            <img src={images.banner} alt="" className="h-full w-full object-cover" />
          )}
          <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/75">
            {uploading === "banner" ? "Uploading…" : "Change banner"}
            <input type="file" accept="image/*" className="sr-only" disabled={!!uploading} onChange={(e) => void pick(e.target.files?.[0], "banner")} />
          </label>
        </div>
        <div className="flex items-center gap-4 p-4">
          <Avatar user={{ name: draft.name || profile.name, username: draft.username, avatar: images.avatar }} size={72} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl bg-elevated px-3.5 py-2 text-sm font-semibold hover:bg-line">
              {uploading === "avatar" ? "Uploading…" : "Change photo"}
              <input type="file" accept="image/*" className="sr-only" disabled={!!uploading} onChange={(e) => void pick(e.target.files?.[0], "avatar")} />
            </label>
            {images.avatar && (
              <button type="button" onClick={() => setImages((i) => ({ ...i, avatar: null }))} className="text-sm font-medium text-muted hover:text-like">
                Remove photo
              </button>
            )}
            {uploading && <Spinner className="size-4" />}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display name" hint={`${draft.name.length}/${LIMITS.name}`}>
          <input className="input" value={draft.name} maxLength={LIMITS.name} onChange={change("name")} required />
        </Field>
        <Field label="Username" hint="/u/username">
          <input
            className="input"
            value={draft.username}
            maxLength={LIMITS.username.max}
            onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") }))}
          />
        </Field>
      </div>

      <Field label="Headline" hint={`${draft.headline.length}/${LIMITS.headline}`} help="A short line under your name, e.g. “Motion designer exploring video models”.">
        <input className="input" value={draft.headline} maxLength={LIMITS.headline} onChange={change("headline")} />
      </Field>

      <Field label="Bio" hint={`${draft.bio.length}/${LIMITS.bio}`}>
        <textarea className="input min-h-28" value={draft.bio} maxLength={LIMITS.bio} onChange={change("bio")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location">
          <input className="input" value={draft.location} maxLength={LIMITS.location} onChange={change("location")} />
        </Field>
        <Field label="Website" help="Shown on your profile. Use https:// or just the domain.">
          <input className="input" value={draft.website} maxLength={LIMITS.website} onChange={change("website")} placeholder="example.com" />
        </Field>
      </div>

      <Field label="Tools you use" help="Comma separated. Each one links to a search for that tool.">
        <input className="input" value={draft.tools} onChange={change("tools")} placeholder="Midjourney, Suno, Runway" />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-like">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending || !!uploading} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-60">
          {pending && <Spinner className="size-4 border-white/40 border-t-white" />}
          Save profile
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, help, children }: { label: string; hint?: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      {children}
      {help && <span className="block text-xs text-muted">{help}</span>}
    </label>
  );
}
