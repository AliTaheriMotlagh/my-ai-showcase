"use client";

import { ImagePlus, Music2, Plus, Repeat2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPostAction } from "@/app/actions";
import { PostCard } from "@/components/post/PostCard";
import { Spinner } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { KINDS, KIND_MODELS } from "@/lib/kinds";
import { aspectFor, measureFile, uploadFile } from "@/lib/upload";
import { ACCEPT, fileProblem } from "@/lib/media-files";
import { LIMITS, normalizeTags } from "@/lib/rules";
import type { ChartSpec, ChatMessage, FeedPost, MediaItem, MediaType, PostKind } from "@/lib/types";
import type { Viewer } from "@/server/session";

/** A file the person picked, held in memory until they publish. Previews use an object URL. */
interface Staged {
  id: string;
  file: File;
  type: MediaType;
  previewUrl: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface Draft {
  kind: PostKind;
  title: string;
  caption: string;
  prompt: string;
  model: string;
  tags: string;
  images: Staged[];
  video: Staged | null;
  audio: Staged | null;
  cover: Staged | null;
  model3d: Staged | null;
  textForm: string;
  textBody: string;
  codeLang: string;
  codeFile: string;
  codeSource: string;
  chat: ChatMessage[];
  chartType: ChartSpec["type"];
  chartRows: { label: string; value: number }[];
}

const LANGS = ["javascript", "typescript", "python", "rust", "go", "glsl", "sql", "css", "html"];
const TEXT_FORMS = ["Poem", "Micro-fiction", "Essay", "Lyrics", "Haiku", "Script"];
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Remixes copy the words (prompt, model, tags, text or code) but not the files. The remixer uploads their own. */
function makeDraft(remix: FeedPost | null): Draft {
  return {
    kind: remix?.kind ?? "image",
    title: remix ? `${remix.title} (remix)`.slice(0, LIMITS.postTitle) : "",
    caption: "",
    prompt: remix?.prompt ?? "",
    model: remix?.model ?? KIND_MODELS.image[0],
    tags: remix ? [...remix.tags.filter((t) => t !== "remix"), "remix"].join(", ") : "",
    images: [],
    video: null,
    audio: null,
    cover: null,
    model3d: null,
    textForm: remix?.text?.form ?? "Poem",
    textBody: remix?.text?.body ?? "",
    codeLang: remix?.code?.language ?? "javascript",
    codeFile: remix?.code?.filename ?? "sketch.js",
    codeSource: remix?.code?.source ?? "",
    chat: remix?.chat ?? [
      { role: "user", text: "" },
      { role: "ai", text: "" },
    ],
    chartType: remix?.chart?.type ?? "bar",
    chartRows: remix?.chart
      ? remix.chart.labels.map((label, i) => ({ label, value: remix.chart!.values[i] }))
      : [
          { label: "Mon", value: 12 },
          { label: "Tue", value: 19 },
          { label: "Wed", value: 15 },
          { label: "Thu", value: 24 },
        ],
  };
}

async function stage(file: File, type: MediaType): Promise<Staged> {
  const measured = await measureFile(file, type).catch(() => ({}));
  return { id: newId(), file, type, previewUrl: URL.createObjectURL(file), ...measured };
}

/** Returns the first problem with the draft, in the same words the server would use. */
function validate(d: Draft): string | null {
  if (!d.title.trim()) return "Give your showcase a title.";
  if (!d.model.trim()) return "Tell people which model or tool you used.";
  switch (d.kind) {
    case "image":
      if (!d.images.length) return "Upload an image.";
      break;
    case "gallery":
      if (d.images.length < 2) return "A series needs at least two images.";
      break;
    case "video":
      if (!d.video) return "Upload a video.";
      break;
    case "audio":
      if (!d.audio) return "Upload an audio file.";
      break;
    case "3d":
      if (!d.model3d) return "Upload a .glb or .gltf model.";
      break;
    case "text":
      if (!d.textBody.trim()) return "Add the writing.";
      break;
    case "code":
      if (!d.codeSource.trim()) return "Add the code.";
      break;
    case "chat":
      if (!d.chat.some((m) => m.text.trim())) return "Add at least one message.";
      break;
    case "chart":
      if (!d.chartRows.length || d.chartRows.some((r) => !r.label.trim())) return "Every chart row needs a label.";
      break;
  }
  return null;
}

/** Local preview model: the same shape the feed uses, built from the staged files. */
function buildPreview(d: Draft, viewer: Viewer, remix: FeedPost | null): FeedPost {
  const staged: Staged[] = [...d.images, ...(d.video ? [d.video] : []), ...(d.audio ? [d.audio] : []), ...(d.cover ? [d.cover] : []), ...(d.model3d ? [d.model3d] : [])];
  const media: MediaItem[] = staged.map((s) => ({ url: s.previewUrl, type: s.type, mime: s.file.type, width: s.width, height: s.height, duration: s.duration }));
  const first = d.images[0] ?? d.video;
  return {
    id: "preview",
    kind: d.kind,
    title: d.title.trim() || "Untitled",
    caption: d.caption.trim(),
    prompt: d.prompt.trim(),
    model: d.model.trim() || "Unknown model",
    tags: normalizeTags(d.tags),
    createdAt: new Date().toISOString(),
    aspect: aspectFor(first?.width, first?.height),
    media,
    stats: { likes: 0, comments: 0, views: 0, saves: 0, remixes: 0 },
    ...(d.kind === "text" && { text: { form: d.textForm, body: d.textBody } }),
    ...(d.kind === "code" && { code: { language: d.codeLang, filename: d.codeFile || "snippet", source: d.codeSource } }),
    ...(d.kind === "chat" && { chat: d.chat.filter((m) => m.text.trim()) }),
    ...(d.kind === "chart" && {
      chart: { type: d.chartType, labels: d.chartRows.map((r) => r.label || "—"), values: d.chartRows.map((r) => Math.max(0, r.value || 0)) },
    }),
    remixOf: remix ? { id: remix.id, title: remix.title, username: remix.author.username } : null,
    author: { id: viewer.id, username: viewer.username, name: viewer.name, headline: "", avatar: viewer.avatar, verified: false },
    viewer: { liked: false, saved: false, following: false, owner: true },
  };
}

export function Composer({ remix, viewer }: { remix: FeedPost | null; viewer: Viewer }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => makeDraft(remix));
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [staging, setStaging] = useState(false);

  // Release object URLs for files that are no longer part of the draft, and everything on unmount.
  const previewsRef = useRef(new Set<string>());
  useEffect(() => {
    const live = new Set<string>([
      ...draft.images.map((s) => s.previewUrl),
      ...[draft.video, draft.audio, draft.cover, draft.model3d].filter((s): s is Staged => !!s).map((s) => s.previewUrl),
    ]);
    for (const url of previewsRef.current) if (!live.has(url)) URL.revokeObjectURL(url);
    previewsRef.current = live;
  }, [draft.images, draft.video, draft.audio, draft.cover, draft.model3d]);
  useEffect(() => {
    const urls = previewsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const preview = useMemo(() => buildPreview(draft, viewer, remix), [draft, viewer, remix]);

  /** Adds picked files to the right slot. Bad files are reported, and the good ones still go in. */
  const addFiles = async (files: FileList | File[] | null, slot: "images" | "video" | "audio" | "cover" | "model3d") => {
    const picked = files ? [...files] : [];
    if (!picked.length) return;
    const type: MediaType = slot === "images" || slot === "cover" ? "image" : slot === "video" ? "video" : slot === "audio" ? "audio" : "model";
    const problems: string[] = [];
    const accepted = picked.filter((f) => {
      const problem = fileProblem(f, type);
      if (problem) problems.push(problem);
      return !problem;
    });
    if (problems.length) toast(problems[0]);
    if (!accepted.length) return;

    const limit = slot === "images" ? (draft.kind === "gallery" ? LIMITS.galleryImages : 1) : 1;
    const room = slot === "images" ? Math.max(0, limit - draft.images.length) : 1;
    const chosen = accepted.slice(0, room);
    if (accepted.length > room) toast(room ? `You can add up to ${limit} images.` : "Remove the current file first.");
    if (!chosen.length) return;

    setStaging(true);
    try {
      const staged = await Promise.all(chosen.map((f) => stage(f, type)));
      if (slot === "images") setDraft((d) => ({ ...d, images: [...d.images, ...staged].slice(0, limit) }));
      else set(slot, staged[0]);
    } catch {
      toast("Couldn't read that file. Try a different one.");
    } finally {
      setStaging(false);
    }
  };

  const removeStaged = (slot: "images" | "video" | "audio" | "cover" | "model3d", id?: string) => {
    if (slot === "images") set("images", draft.images.filter((s) => s.id !== id));
    else set(slot, null);
  };

  const publish = async () => {
    const problem = validate(draft);
    if (problem) {
      setError(problem);
      setView("edit");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const uploads: Staged[] = [
        ...draft.images,
        ...[draft.video, draft.audio, draft.cover, draft.model3d].filter((s): s is Staged => !!s),
      ];

      const media: MediaItem[] = [];
      for (const [i, staged] of uploads.entries()) {
        setStatus(uploads.length > 1 ? `Uploading ${i + 1} of ${uploads.length}…` : "Uploading…");
        const url = await uploadFile(staged.file, staged.type, viewer.id);
        media.push({
          url,
          type: staged.type,
          mime: staged.file.type || (staged.type === "model" ? "model/gltf-binary" : "application/octet-stream"),
          width: staged.width ?? null,
          height: staged.height ?? null,
          duration: staged.duration ?? null,
        });
      }

      setStatus("Publishing…");
      const first = draft.images[0] ?? draft.video;
      const result = await createPostAction({
        kind: draft.kind,
        title: draft.title,
        caption: draft.caption,
        prompt: draft.prompt,
        model: draft.model,
        tags: normalizeTags(draft.tags),
        aspect: aspectFor(first?.width, first?.height),
        media,
        remixOfId: remix?.id ?? null,
        ...(draft.kind === "text" && { text: { form: draft.textForm, body: draft.textBody } }),
        ...(draft.kind === "code" && { code: { language: draft.codeLang, filename: draft.codeFile || "snippet", source: draft.codeSource } }),
        ...(draft.kind === "chat" && { chat: draft.chat.filter((m) => m.text.trim()) }),
        ...(draft.kind === "chart" && {
          chart: { type: draft.chartType, labels: draft.chartRows.map((r) => r.label.trim()), values: draft.chartRows.map((r) => Math.max(0, r.value || 0)) },
        }),
      });

      if (!result.ok) {
        setError(result.error);
        setView("edit");
        return;
      }
      toast("Published to your profile ✨");
      router.push(`/p/${result.data.id}`);
    } catch {
      setError("The upload didn't finish. Check your connection and try again.");
      setView("edit");
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  const usesMedia = ["image", "gallery", "video", "audio", "3d"].includes(draft.kind);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 md:pt-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{remix ? "Remix" : "Create"}</h1>
        {remix && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1 text-sm">
            <Repeat2 className="size-4 text-accent" aria-hidden /> from @{remix.author.username} · “{remix.title}”
          </span>
        )}
        <div className="ml-auto grid grid-cols-2 rounded-xl bg-elevated p-1 text-sm font-semibold lg:hidden" role="tablist">
          {(["edit", "preview"] as const).map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("rounded-lg px-4 py-1.5 capitalize", view === v && "bg-bg shadow")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {remix && <p className="mb-6 text-sm text-muted">Remixing copies the prompt, model and tags, and links back to the original. Upload your own files for this version.</p>}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <form
          className={cn("space-y-6", view === "preview" && "hidden lg:block")}
          onSubmit={(e) => {
            e.preventDefault();
            void publish();
          }}
        >
          <fieldset className="min-w-0" disabled={busy}>
            <legend className="mb-2 text-sm font-semibold">What did you make?</legend>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-5">
              {KINDS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={draft.kind === id}
                  onClick={() => setDraft((d) => ({ ...d, kind: id, model: KIND_MODELS[id][0] }))}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                    draft.kind === id ? "border-accent bg-accent/10 text-fg" : "border-line hover:bg-elevated",
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {label}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Title" hint={`${draft.title.length}/${LIMITS.postTitle}`} error={error && !draft.title.trim() ? error : undefined}>
            <input
              className="input"
              value={draft.title}
              maxLength={LIMITS.postTitle}
              placeholder="Give it a name people will remember"
              disabled={busy}
              onChange={(e) => {
                set("title", e.target.value);
                setError("");
              }}
            />
          </Field>

          {usesMedia && (
            <MediaSlots draft={draft} onAdd={addFiles} onRemove={removeStaged} staging={staging} disabled={busy} />
          )}

          <KindFields draft={draft} set={set} />

          <Field label="Prompt" hint="Shared publicly so others can learn and remix">
            <textarea
              className="input min-h-24 font-mono text-sm"
              value={draft.prompt}
              maxLength={LIMITS.prompt}
              onChange={(e) => set("prompt", e.target.value)}
              placeholder="The exact prompt you used…"
              disabled={busy}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Model / tool">
              <input className="input" list="models" value={draft.model} maxLength={LIMITS.model} onChange={(e) => set("model", e.target.value)} disabled={busy} />
              <datalist id="models">
                {KIND_MODELS[draft.kind].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input className="input" value={draft.tags} onChange={(e) => set("tags", e.target.value)} placeholder="cyberpunk, portrait, neon" disabled={busy} />
            </Field>
          </div>

          <Field label="Caption" hint={`${draft.caption.length}/${LIMITS.caption}`}>
            <textarea
              className="input min-h-20"
              value={draft.caption}
              maxLength={LIMITS.caption}
              onChange={(e) => set("caption", e.target.value)}
              placeholder="The story behind it, your process, what you learned…"
              disabled={busy}
            />
          </Field>

          {error && <p role="alert" className="text-sm text-like">{error}</p>}

          <button
            type="submit"
            disabled={busy || staging}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.99] disabled:opacity-60 lg:hidden"
          >
            {busy && <Spinner className="size-4 border-white/40 border-t-white" />}
            {busy ? status || "Publishing…" : "Publish"}
          </button>
        </form>

        <aside className={cn("lg:sticky lg:top-6 lg:self-start", view === "edit" && "hidden lg:block")} aria-label="Preview">
          <p className="mb-2 text-sm font-semibold text-muted">Live preview</p>
          <PostCard post={preview} preview />
          <button
            type="button"
            onClick={() => void publish()}
            disabled={busy || staging}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.99] disabled:opacity-60"
          >
            {busy && <Spinner className="size-4 border-white/40 border-t-white" />}
            {busy ? status || "Publishing…" : "Publish"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">Your files are stored on our servers. Posts appear on your profile straight away.</p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-sm text-like">{error}</span>}
    </label>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-elevated p-1">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium capitalize", value === o ? "bg-bg shadow" : "text-muted hover:text-fg")}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Drop zone for one file type. Keyboard users can activate it, and screen readers get the requirements. */
function FileDrop({ label, hint, accept, multiple, busy, onFiles }: { label: string; hint: string; accept: string; multiple?: boolean; busy?: boolean; onFiles: (f: FileList) => void }) {
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-accent hover:bg-elevated/50 focus-within:border-accent"
    >
      {busy ? <Spinner /> : <Upload className="size-7 text-muted" aria-hidden />}
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted">{hint}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function MediaSlots({
  draft,
  onAdd,
  onRemove,
  staging,
  disabled,
}: {
  draft: Draft;
  onAdd: (files: FileList | File[] | null, slot: "images" | "video" | "audio" | "cover" | "model3d") => void;
  onRemove: (slot: "images" | "video" | "audio" | "cover" | "model3d", id?: string) => void;
  staging: boolean;
  disabled: boolean;
}) {
  switch (draft.kind) {
    case "image":
    case "gallery": {
      const many = draft.kind === "gallery";
      return (
        <div className="space-y-3">
          {(!many ? draft.images.length === 0 : draft.images.length < LIMITS.galleryImages) && (
            <FileDrop
              label={many ? "Drop your images or click to choose" : "Drop an image or click to choose"}
              hint={`JPG, PNG, WebP, GIF or AVIF · up to 20 MB each${many ? ` · ${LIMITS.galleryImages} images` : ""}`}
              accept={ACCEPT.image}
              multiple={many}
              busy={staging}
              onFiles={(f) => onAdd(f, "images")}
            />
          )}
          {draft.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.images.map((s, i) => (
                <div key={s.id} className="group relative size-20 overflow-hidden rounded-xl bg-elevated">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                  <img src={s.previewUrl} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove image ${i + 1}`}
                    disabled={disabled}
                    onClick={() => onRemove("images", s.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {many && <p className="text-xs text-muted">{draft.images.length}/{LIMITS.galleryImages} images · a series needs at least two</p>}
        </div>
      );
    }
    case "video":
      return draft.video ? (
        <MediaPreview slot="video" disabled={disabled} onRemove={onRemove}>
              <video src={draft.video.previewUrl} className="max-h-72 w-full rounded-xl bg-black object-contain" muted controls playsInline />
        </MediaPreview>
      ) : (
        <FileDrop label="Drop a video or click to choose" hint="MP4, WebM or MOV · up to 250 MB" accept={ACCEPT.video} busy={staging} onFiles={(f) => onAdd(f, "video")} />
      );
    case "audio":
      return (
        <div className="space-y-3">
          {draft.audio ? (
            <MediaPreview slot="audio" disabled={disabled} onRemove={onRemove}>
              <audio src={draft.audio.previewUrl} controls className="w-full" />
            </MediaPreview>
          ) : (
            <FileDrop label="Drop a track or click to choose" hint="MP3, M4A, WAV, OGG or FLAC · up to 80 MB" accept={ACCEPT.audio} busy={staging} onFiles={(f) => onAdd(f, "audio")} />
          )}
          {draft.cover ? (
            <MediaPreview slot="cover" disabled={disabled} onRemove={onRemove}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={draft.cover.previewUrl} alt="Cover art" className="h-40 w-40 rounded-xl object-cover" />
            </MediaPreview>
          ) : (
            <label className="flex items-center gap-3 text-sm text-muted">
              <ImagePlus className="size-4" aria-hidden />
              <span>Optional cover art</span>
              <input type="file" accept={ACCEPT.image} className="sr-only" onChange={(e) => { onAdd(e.target.files, "cover"); e.target.value = ""; }} />
              <span className="cursor-pointer font-semibold text-accent hover:underline">Choose</span>
            </label>
          )}
        </div>
      );
    case "3d":
      return draft.model3d ? (
        <MediaPreview slot="model3d" disabled={disabled} onRemove={onRemove}>
          <p className="flex items-center gap-2 rounded-xl bg-elevated p-4 text-sm">
            <Music2 className="size-4 text-accent" aria-hidden /> {draft.model3d.file.name} · shown as an interactive 3D viewer after publishing
          </p>
        </MediaPreview>
      ) : (
        <FileDrop label="Drop a .glb or .gltf model or click to choose" hint="Up to 150 MB · the viewer lets people rotate it" accept={ACCEPT.model} busy={staging} onFiles={(f) => onAdd(f, "model3d")} />
      );
    default:
      return null;
  }
}

function MediaPreview({
  slot,
  disabled,
  onRemove,
  children,
}: {
  slot: "video" | "audio" | "cover" | "model3d";
  disabled: boolean;
  onRemove: (slot: "video" | "audio" | "cover" | "model3d") => void;
  children: ReactNode;
}) {
  return (
    <div className="relative space-y-2 rounded-2xl border border-line p-3">
      {children}
      <button type="button" disabled={disabled} onClick={() => onRemove(slot)} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-like">
        <Trash2 className="size-3.5" aria-hidden /> Remove file
      </button>
    </div>
  );
}

function KindFields({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(key: K, value: Draft[K]) => void }) {
  switch (draft.kind) {
    case "text":
      return (
        <div className="space-y-3">
          <Segmented value={draft.textForm} options={TEXT_FORMS} onChange={(v) => set("textForm", v)} />
          <textarea
            className="input min-h-48 font-display text-xl leading-relaxed"
            value={draft.textBody}
            maxLength={LIMITS.textBody}
            onChange={(e) => set("textBody", e.target.value)}
            placeholder="Paste the writing…"
          />
        </div>
      );
    case "code":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="input font-mono text-sm" value={draft.codeFile} onChange={(e) => set("codeFile", e.target.value)} aria-label="File name" placeholder="file name" />
            <select className="input" value={draft.codeLang} onChange={(e) => set("codeLang", e.target.value)} aria-label="Language">
              {LANGS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            className="input min-h-56 font-mono text-[13px]"
            spellCheck={false}
            value={draft.codeSource}
            maxLength={LIMITS.codeSource}
            onChange={(e) => set("codeSource", e.target.value)}
            placeholder="Paste your code…"
          />
        </div>
      );
    case "chat":
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Conversation</p>
          {draft.chat.map((m, i) => (
            <div key={i} className="flex gap-2">
              <button
                type="button"
                onClick={() => set("chat", draft.chat.map((x, j) => (j === i ? { ...x, role: x.role === "user" ? "ai" : "user" } : x)))}
                className={cn("w-14 shrink-0 rounded-lg text-xs font-semibold", m.role === "user" ? "bg-brand text-white" : "bg-elevated")}
                aria-label={`Message ${i + 1} is from ${m.role === "user" ? "you" : "AI"} — click to switch`}
              >
                {m.role === "user" ? "You" : "AI"}
              </button>
              <textarea
                className="input min-h-12 flex-1 text-sm"
                value={m.text}
                maxLength={LIMITS.chatMessages.text}
                onChange={(e) => set("chat", draft.chat.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                placeholder={m.role === "user" ? "What you asked…" : "What the AI answered…"}
              />
              <button type="button" aria-label="Remove message" onClick={() => set("chat", draft.chat.filter((_, j) => j !== i))} className="self-start p-2 text-muted hover:text-like">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("chat", [...draft.chat, { role: draft.chat.at(-1)?.role === "user" ? "ai" : "user", text: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-elevated px-3 py-1.5 text-sm font-medium hover:bg-line"
          >
            <Plus className="size-4" aria-hidden /> Add message
          </button>
        </div>
      );
    case "chart":
      return (
        <div className="space-y-3">
          <Segmented value={draft.chartType} options={["bar", "line", "donut"] as const} onChange={(v) => set("chartType", v)} />
          {draft.chartRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input"
                value={row.label}
                maxLength={LIMITS.chartRows.label}
                aria-label={`Label ${i + 1}`}
                onChange={(e) => set("chartRows", draft.chartRows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
              />
              <input
                className="input w-32"
                type="number"
                min={0}
                value={row.value}
                aria-label={`Value ${i + 1}`}
                onChange={(e) => set("chartRows", draft.chartRows.map((r, j) => (j === i ? { ...r, value: Number(e.target.value) } : r)))}
              />
              <button type="button" aria-label="Remove row" onClick={() => set("chartRows", draft.chartRows.filter((_, j) => j !== i))} className="p-2 text-muted hover:text-like">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={draft.chartRows.length >= LIMITS.chartRows.max}
            onClick={() => set("chartRows", [...draft.chartRows, { label: `Item ${draft.chartRows.length + 1}`, value: 10 }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-elevated px-3 py-1.5 text-sm font-medium hover:bg-line disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden /> Add row
          </button>
        </div>
      );
    default:
      return null;
  }
}
