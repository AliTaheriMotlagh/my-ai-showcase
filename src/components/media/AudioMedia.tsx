import { Music2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { paletteFor } from "@/lib/palettes";
import { altText, frameClass, ImgFill, mediaOf, MissingMedia, type MediaProps } from "./shared";

/** Real audio with native controls. The optional cover image (second upload) is shown as the artwork. */
export function AudioMedia({ post, variant }: MediaProps) {
  const audio = mediaOf(post, "audio");
  const cover = mediaOf(post, "image");
  if (!audio) return <MissingMedia />;

  const p = paletteFor(post.id);
  const artwork = cover ? (
    <ImgFill src={cover.url} alt={altText(post)} />
  ) : (
    <div
      role="img"
      aria-label={altText(post)}
      className="absolute inset-0 grid place-items-center"
      style={{ background: `radial-gradient(at 30% 20%, ${p[2]} 0, transparent 60%), radial-gradient(at 80% 90%, ${p[3]} 0, transparent 55%), ${p[0]}` }}
    >
      <Music2 className="size-1/4 text-white/80" aria-hidden />
    </div>
  );

  if (variant === "tile") return <div className="absolute inset-0 overflow-hidden">{artwork}</div>;

  return (
    <div className={cn(frameClass(variant, "aspect-square"), "overflow-hidden bg-black text-white")}>
      <div className="absolute inset-0 scale-125 opacity-60 blur-2xl">{artwork}</div>
      <div className="relative flex h-full flex-col items-center justify-center gap-5 p-6">
        <div className="relative aspect-square w-[52%] max-w-[300px] overflow-hidden rounded-xl shadow-2xl shadow-black/50">{artwork}</div>
        <p className="w-full max-w-[340px] truncate text-center font-semibold">{post.title}</p>
        <audio src={audio.url} controls preload="metadata" className="w-full max-w-[340px]" aria-label={`Play ${post.title}`} />
      </div>
    </div>
  );
}
