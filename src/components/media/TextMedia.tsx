import { cn } from "@/lib/cn";
import { paletteFor } from "@/lib/palettes";
import type { MediaProps } from "./shared";

export function TextMedia({ post, variant }: MediaProps) {
  const t = post.text ?? { form: "Writing", body: "" };
  const p = paletteFor(post.id);
  const tint = {
    backgroundImage: `radial-gradient(at 0% 0%, ${p[1]}33, transparent 60%), radial-gradient(at 100% 100%, ${p[3]}33, transparent 55%)`,
  };

  if (variant === "tile") {
    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-card p-3 sm:p-4" style={tint}>
        <span className="text-[10px] uppercase tracking-widest text-muted">{t.form}</span>
        <p className="mt-1 line-clamp-2 font-display text-lg leading-tight sm:text-2xl">{post.title}</p>
        <p className="mt-2 line-clamp-6 whitespace-pre-line font-display text-xs leading-snug text-fg/75 sm:text-sm">{t.body}</p>
      </div>
    );
  }

  const full = variant === "full";
  const long = t.body.length > 420;
  return (
    <div className={cn("bg-card", full ? "h-full w-full overflow-y-auto" : "relative")} style={tint}>
      <div className={cn("relative mx-auto max-w-prose px-6 sm:px-10", full ? "py-12" : "max-h-[30rem] overflow-hidden py-10")}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{t.form}</p>
        <h3 className="mt-2 font-display text-3xl leading-tight text-balance sm:text-4xl">{post.title}</h3>
        <div className="mt-5 whitespace-pre-line font-display text-xl leading-relaxed text-fg/90">{t.body}</div>
        {!full && long && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-card to-transparent" />}
      </div>
    </div>
  );
}
