"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { Artwork } from "@/components/art/Artwork";
import { useInView, usePrefersReducedMotion } from "@/hooks/useMedia";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { altText, ASPECT, frameClass, type MediaProps } from "./shared";

/**
 * Demo "video": the artwork is animated with GPU-friendly CSS (zoom, drift, hue),
 * autoplaying while on screen. Swap for <video> once real uploads exist.
 */
export function VideoMedia({ post, variant, active }: MediaProps) {
  const interactive = variant !== "tile";
  const inFlow = active !== undefined;
  const [ref, inView] = useInView<HTMLDivElement>(0.6, interactive && !inFlow);
  const reduced = usePrefersReducedMotion();
  const [override, setOverride] = useState<boolean | null>(null);
  const duration = post.video?.duration ?? 12;
  const visible = inFlow ? active : inView;
  const playing = interactive && visible && (override ?? !reduced);
  const playState = { animationPlayState: playing ? "running" : "paused" } as const;

  return (
    <div ref={ref} className={cn(frameClass(variant, ASPECT[post.aspect]), "overflow-hidden bg-black")}>
      <div className="video-motion absolute inset-0" style={{ ...playState, animationDuration: `${duration}s` }}>
        <Artwork visual={post.visuals[0]} label={altText(post)} />
      </div>
      <div className="video-sweep pointer-events-none absolute inset-0" style={{ ...playState, animationDuration: `${Math.max(4, duration / 2)}s` }} />
      {interactive && (
        <>
          {!playing && (
            <button
              type="button"
              onClick={() => setOverride(true)}
              aria-label="Play"
              className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:scale-105"
            >
              <Play className="size-7 translate-x-0.5 fill-current" />
            </button>
          )}
          {inFlow ? (
            playing && (
              <button
                type="button"
                onClick={() => setOverride(false)}
                aria-label="Pause"
                className="absolute right-3 top-16 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm md:top-3"
              >
                <Pause className="size-4 fill-current" />
              </button>
            )
          ) : (
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white">
              <button
                type="button"
                onClick={() => setOverride(!playing)}
                aria-label={playing ? "Pause" : "Play"}
                className="rounded-full p-1 hover:bg-white/15"
              >
                {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
              </button>
              <span className="tabular-nums">{formatDuration(duration)}</span>
              <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 backdrop-blur">AI video · {post.model}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
            <div className="video-progress h-full bg-white" style={{ ...playState, animationDuration: `${duration}s` }} />
          </div>
        </>
      )}
    </div>
  );
}
