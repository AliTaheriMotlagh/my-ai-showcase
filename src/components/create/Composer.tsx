"use client";

import { ImagePlus, Plus, Repeat2, Shuffle, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Artwork } from "@/components/art/Artwork";
import { PostCard } from "@/components/post/PostCard";
import { Spinner } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { KINDS, KIND_MODELS } from "@/lib/kinds";
import { ART_STYLES, PALETTES } from "@/lib/palettes";
import { actions, meAsUser, useAppStore, useHydrated, type Me } from "@/lib/store";
import type { Aspect, ChartSpec, ChatMessage, FeedPost, PostKind, Visual } from "@/lib/types";

interface Draft {
  kind: PostKind;
  title: string;
  caption: string;
  prompt: string;
  model: string;
  tags: string;
  aspect: Aspect;
  visual: Visual;
  uploads: string[];
  galleryCount: number;
  textForm: string;
  textBody: string;
  codeLang: string;
  codeFile: string;
  codeSource: string;
  chat: ChatMessage[];
  chartType: ChartSpec["type"];
  chartRows: { label: string; value: number }[];
  bpm: number;
  duration: number;
  shape: "sphere" | "cube" | "atom";
}

const LANGS = ["javascript", "typescript", "python", "rust", "go", "glsl", "sql", "css", "html"];
const TEXT_FORMS = ["Poem", "Micro-fiction", "Essay", "Lyrics", "Haiku", "Script"];
const newSeed = () => Math.floor(Math.random() * 2 ** 30);

function makeDraft(remix: FeedPost | null): Draft {
  const base: Draft = {
    kind: "image",
    title: "",
    caption: "",
    prompt: "",
    model: KIND_MODELS.image[0],
    tags: "",
    aspect: "portrait",
    visual: { seed: newSeed(), style: "mesh", palette: PALETTES[0].colors },
    uploads: [],
    galleryCount: 4,
    textForm: "Poem",
    textBody: "",
    codeLang: "javascript",
    codeFile: "sketch.js",
    codeSource: "",
    chat: [
      { role: "user", text: "" },
      { role: "ai", text: "" },
    ],
    chartType: "bar",
    chartRows: [
      { label: "Mon", value: 12 },
      { label: "Tue", value: 19 },
      { label: "Wed", value: 15 },
      { label: "Thu", value: 24 },
    ],
    bpm: 110,
    duration: 12,
    shape: "sphere",
  };
  if (!remix) return base;
  return {
    ...base,
    kind: remix.kind,
    title: `${remix.title} (remix)`,
    prompt: remix.prompt,
    model: remix.model,
    tags: [...remix.tags.filter((t) => t !== "remix"), "remix"].join(", "),
    aspect: remix.aspect,
    visual: { ...remix.visuals[0], src: undefined, seed: newSeed() },
    galleryCount: Math.max(2, remix.visuals.length),
    textForm: remix.text?.form ?? base.textForm,
    textBody: remix.text?.body ?? "",
    codeLang: remix.code?.language ?? base.codeLang,
    codeFile: remix.code?.filename ?? base.codeFile,
    codeSource: remix.code?.source ?? "",
    chat: remix.chat ?? base.chat,
    chartType: remix.chart?.type ?? base.chartType,
    chartRows: remix.chart ? remix.chart.labels.map((label, i) => ({ label, value: remix.chart!.values[i] })) : base.chartRows,
    bpm: remix.audio?.bpm ?? base.bpm,
    duration: remix.video?.duration ?? base.duration,
    shape: remix.object3d?.shape ?? base.shape,
  };
}

function buildPost(d: Draft, me: Me, id: string, remix: FeedPost | null): FeedPost {
  const visuals: Visual[] = d.uploads.length
    ? (d.kind === "gallery" ? d.uploads : d.uploads.slice(0, 1)).map((src) => ({ ...d.visual, src }))
    : d.kind === "gallery"
      ? Array.from({ length: d.galleryCount }, (_, i) => ({ ...d.visual, seed: d.visual.seed + i * 7919 }))
      : [d.visual];
  const tags = d.tags
    .split(/[,\s#]+/)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, 8);
  const valid = d.chat.filter((m) => m.text.trim());
  return {
    id,
    authorId: "me",
    author: meAsUser(me),
    kind: d.kind,
    title: d.title.trim() || "Untitled",
    caption: d.caption.trim(),
    prompt: d.prompt.trim(),
    model: d.model.trim() || "Unknown model",
    tags,
    createdAt: new Date().toISOString(),
    aspect: d.aspect,
    visuals,
    stats: { likes: 0, comments: 0, views: 0, saves: 0, remixes: 0 },
    ...(d.kind === "text" && { text: { form: d.textForm, body: d.textBody } }),
    ...(d.kind === "code" && { code: { language: d.codeLang, filename: d.codeFile || "snippet", source: d.codeSource } }),
    ...(d.kind === "chat" && { chat: valid.length ? valid : [{ role: "user" as const, text: "…" }] }),
    ...(d.kind === "chart" && {
      chart: { type: d.chartType, labels: d.chartRows.map((r) => r.label || "—"), values: d.chartRows.map((r) => Math.max(0, r.value || 0)) },
    }),
    ...(d.kind === "audio" && { audio: { duration: 180, bpm: d.bpm, key: "C minor", genre: d.tags.split(",")[0]?.trim() || "Electronic" } }),
    ...(d.kind === "video" && { video: { duration: d.duration } }),
    ...(d.kind === "3d" && { object3d: { shape: d.shape } }),
    ...(remix && { remixOf: { id: remix.id, title: remix.title, username: remix.author.username } }),
  };
}

/** Downscale uploads in the browser so they fit in localStorage. */
async function fileToDataUrl(file: File, max = 1280) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const ratio = bitmap.width / bitmap.height;
  return { src: canvas.toDataURL("image/jpeg", 0.82), aspect: (ratio > 1.2 ? "landscape" : ratio < 0.9 ? "portrait" : "square") as Aspect };
}

export function Composer({ remix }: { remix: FeedPost | null }) {
  const hydrated = useHydrated();
  const me = useAppStore((s) => s.me);
  const router = useRouter();
  const [draft, setDraft] = useState(() => makeDraft(remix));
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const preview = buildPost(draft, me, "draft-preview", remix);
  const usesVisual = ["image", "gallery", "video", "audio", "3d"].includes(draft.kind);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const list = await Promise.all([...files].filter((f) => f.type.startsWith("image/")).slice(0, 5).map((f) => fileToDataUrl(f)));
      if (!list.length) return toast("Please choose image files");
      setDraft((d) => ({
        ...d,
        uploads: d.kind === "gallery" ? [...d.uploads, ...list.map((l) => l.src)].slice(0, 6) : [list[0].src],
        aspect: list[0].aspect,
      }));
    } catch {
      toast("Couldn't read that image");
    } finally {
      setBusy(false);
    }
  };

  const publish = () => {
    if (!draft.title.trim()) {
      setError("Give your showcase a title.");
      setView("edit");
      return;
    }
    const post = buildPost(draft, me, `local-${Date.now().toString(36)}`, remix);
    const ok = actions.addPost(post);
    toast(ok ? "Published to your profile ✨" : "Published, but storage is full — it won't survive a reload");
    router.push(`/p/${post.id}`);
  };

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

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <form
          className={cn("space-y-6", view === "preview" && "hidden lg:block")}
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
        >
          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-semibold">What did you make?</legend>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 xl:grid-cols-5">
              {KINDS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={draft.kind === id}
                  onClick={() => setDraft((d) => ({ ...d, kind: id, model: KIND_MODELS[id][0], uploads: id === d.kind ? d.uploads : [] }))}
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

          <Field label="Title" hint={`${draft.title.length}/80`} error={error}>
            <input
              className="input"
              value={draft.title}
              maxLength={80}
              placeholder="Give it a name people will remember"
              onChange={(e) => {
                set("title", e.target.value);
                setError("");
              }}
            />
          </Field>

          <KindEditor draft={draft} setDraft={setDraft} onFiles={handleFiles} busy={busy} />

          {usesVisual && draft.uploads.length === 0 && (
            <VisualPicker visual={draft.visual} onChange={(v) => set("visual", v)} aspect={draft.aspect} onAspect={(a) => set("aspect", a)} kind={draft.kind} />
          )}

          <Field label="Prompt" hint="Shared publicly so others can learn and remix">
            <textarea className="input min-h-24 font-mono text-sm" value={draft.prompt} maxLength={1000} onChange={(e) => set("prompt", e.target.value)} placeholder="The exact prompt you used…" />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Model / tool">
              <input className="input" list="models" value={draft.model} onChange={(e) => set("model", e.target.value)} />
              <datalist id="models">
                {KIND_MODELS[draft.kind].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input className="input" value={draft.tags} onChange={(e) => set("tags", e.target.value)} placeholder="cyberpunk, portrait, neon" />
            </Field>
          </div>

          <Field label="Caption" hint={`${draft.caption.length}/500`}>
            <textarea className="input min-h-20" value={draft.caption} maxLength={500} onChange={(e) => set("caption", e.target.value)} placeholder="The story behind it, your process, what you learned…" />
          </Field>

          <button type="submit" className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.99] lg:hidden">
            Publish
          </button>
        </form>

        <aside className={cn("lg:sticky lg:top-6 lg:self-start", view === "edit" && "hidden lg:block")} aria-label="Preview">
          <p className="mb-2 text-sm font-semibold text-muted">Live preview</p>
          <PostCard post={preview} preview />
          <button type="button" onClick={publish} className="mt-4 w-full rounded-xl bg-brand py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.99]">
            Publish
          </button>
          <p className="mt-2 text-center text-xs text-muted">Posts are saved in this browser until a backend is connected.</p>
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

function VisualPicker({ visual, onChange, aspect, onAspect, kind }: { visual: Visual; onChange: (v: Visual) => void; aspect: Aspect; onAspect: (a: Aspect) => void; kind: PostKind }) {
  return (
    <fieldset className="min-w-0 space-y-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">Cover visual</legend>
      <div className="flex gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
          <Artwork visual={visual} />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ART_STYLES.map((s) => (
              <button key={s} type="button" aria-pressed={visual.style === s} onClick={() => onChange({ ...visual, style: s })} className={cn("rounded-full border px-2.5 py-1 text-xs capitalize", visual.style === s ? "border-fg bg-fg text-bg" : "border-line hover:bg-elevated")}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`${p.name} palette`}
                aria-pressed={visual.palette.join() === p.colors.join()}
                onClick={() => onChange({ ...visual, palette: p.colors })}
                className={cn("size-6 rounded-full ring-offset-2 ring-offset-bg", visual.palette.join() === p.colors.join() && "ring-2 ring-fg")}
                style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[2]}, ${p.colors[4]})` }}
              />
            ))}
            <button type="button" onClick={() => onChange({ ...visual, seed: newSeed() })} className="ml-1 inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 text-xs font-medium hover:bg-line">
              <Shuffle className="size-3.5" aria-hidden /> Shuffle
            </button>
          </div>
        </div>
      </div>
      {(kind === "image" || kind === "gallery") && <Segmented value={aspect} options={["portrait", "square", "landscape"] as const} onChange={onAspect} />}
    </fieldset>
  );
}

function KindEditor({
  draft,
  setDraft,
  onFiles,
  busy,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  onFiles: (f: FileList | null) => void;
  busy: boolean;
}) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  switch (draft.kind) {
    case "image":
    case "gallery":
      return (
        <div className="space-y-3">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFiles(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-accent hover:bg-elevated/50"
          >
            {busy ? <Spinner /> : <Upload className="size-7 text-muted" aria-hidden />}
            <span className="font-medium">Drop {draft.kind === "gallery" ? "images" : "an image"} or click to upload</span>
            <span className="text-xs text-muted">JPG, PNG or WebP · resized to 1280px · or use a generated cover below</span>
            <input type="file" accept="image/*" multiple={draft.kind === "gallery"} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
          {draft.uploads.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.uploads.map((src, i) => (
                <div key={i} className="group relative size-20 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove upload ${i + 1}`}
                    onClick={() => set("uploads", draft.uploads.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {draft.kind === "gallery" && draft.uploads.length === 0 && (
            <label className="flex items-center gap-3 text-sm">
              <ImagePlus className="size-4 text-muted" aria-hidden /> Generated slides
              <input type="range" min={2} max={6} value={draft.galleryCount} onChange={(e) => set("galleryCount", Number(e.target.value))} className="flex-1 accent-violet-500" />
              <span className="w-4 tabular-nums">{draft.galleryCount}</span>
            </label>
          )}
        </div>
      );
    case "video":
      return (
        <Field label="Clip length" hint={`${draft.duration}s`}>
          <input type="range" min={4} max={60} value={draft.duration} onChange={(e) => set("duration", Number(e.target.value))} className="w-full accent-violet-500" />
        </Field>
      );
    case "audio":
      return (
        <Field label="Tempo" hint={`${draft.bpm} BPM`}>
          <input type="range" min={60} max={170} value={draft.bpm} onChange={(e) => set("bpm", Number(e.target.value))} className="w-full accent-violet-500" />
        </Field>
      );
    case "3d":
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Preview shape</p>
          <Segmented value={draft.shape} options={["sphere", "cube", "atom"] as const} onChange={(v) => set("shape", v)} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-3">
          <Segmented value={draft.textForm} options={TEXT_FORMS} onChange={(v) => set("textForm", v)} />
          <textarea className="input min-h-48 font-display text-xl leading-relaxed" value={draft.textBody} onChange={(e) => set("textBody", e.target.value)} placeholder="Paste the writing…" />
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
          <textarea className="input min-h-56 font-mono text-[13px]" spellCheck={false} value={draft.codeSource} onChange={(e) => set("codeSource", e.target.value)} placeholder="Paste your code…" />
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
              <input className="input" value={row.label} aria-label={`Label ${i + 1}`} onChange={(e) => set("chartRows", draft.chartRows.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
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
            onClick={() => set("chartRows", [...draft.chartRows, { label: `Item ${draft.chartRows.length + 1}`, value: 10 }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-elevated px-3 py-1.5 text-sm font-medium hover:bg-line"
          >
            <Plus className="size-4" aria-hidden /> Add row
          </button>
        </div>
      );
  }
}
