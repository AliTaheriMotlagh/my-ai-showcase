"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { useInView, usePrefersReducedMotion } from "@/hooks/useMedia";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { altText, ASPECT, frameClass, mediaOf, MissingMedia, type MediaProps } from "./shared";

/**
 * Real video. Feed and tile cards play muted while on screen, which is the usual short-video behaviour.
 * The full post page uses native controls. Reduced-motion users get a still frame and a play button.
 */
export function VideoMedia({ post, variant, active }: MediaProps) {
  const video = mediaOf(post, "video");
  const ref = useRef<HTMLVideoElement>(null);
  const interactive = variant !== "tile";
  const inFlow = active !== undefined;
  const [frameRef, inView] = useInView<HTMLDivElement>(0.6, interactive && !inFlow);
  const reduced = usePrefersReducedMotion();
  const shouldPlay = interactive && (inFlow ? !!active : inView) && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || !interactive) return;
    if (shouldPlay) el.play().catch(() => {});
    else el.pause();
  }, [shouldPlay, interactive]);

  if (!video) return <MissingMedia />;

  const duration = video.duration ?? null;
  const playing = shouldPlay;
  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <div ref={frameRef} className={cn(frameClass(variant, ASPECT[post.aspect]), "overflow-hidden bg-black")}>
      <video
        ref={ref}
        src={`${video.url}#t=0.1`}
        aria-label={altText(post)}
        muted
        loop
        playsInline
        preload="metadata"
        controls={variant === "full"}
        onClick={interactive && variant !== "full" ? toggle : undefined}
        className={cn("h-full w-full", variant === "full" ? "object-contain" : "object-cover")}
        width={video.width ?? undefined}
        height={video.height ?? undefined}
      />
      {interactive && variant === "feed" && (
        <>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 p-1.5 text-white backdrop-blur hover:bg-black/70"
          >
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
          </button>
          {duration !== null && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium tabular-nums text-white backdrop-blur">
              {formatDuration(duration)}
            </span>
          )}
        </>
      )}
    </div>
  );
}
