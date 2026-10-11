"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Artwork } from "@/components/art/Artwork";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { mulberry32 } from "@/lib/random";
import { playSynth, type SynthHandle } from "@/lib/synth";
import { altText, frameClass, type MediaProps } from "./shared";

const PREVIEW_SECONDS = 30;

export function AudioMedia({ post, variant }: MediaProps) {
  const audio = post.audio ?? { duration: 120, bpm: 100, key: "C minor", genre: "Ambient" };
  const visual = post.visuals[0];
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const handle = useRef<SynthHandle | null>(null);

  const bars = useMemo(() => {
    const r = mulberry32(visual.seed ^ 0x9e3779b9);
    return Array.from({ length: 44 }, (_, i) => 0.18 + Math.abs(Math.sin(i * 0.45 + r() * 0.8)) * 0.6 + r() * 0.22);
  }, [visual.seed]);

  useEffect(() => () => handle.current?.stop(), []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const h = handle.current;
      if (h) setProgress(Math.min(1, Math.max(0, (h.ctx.currentTime - h.startedAt) / h.duration)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  if (variant === "tile") {
    return (
      <div className="absolute inset-0">
        <Artwork visual={visual} label={altText(post)} />
      </div>
    );
  }

  const toggle = () => {
    if (playing) {
      handle.current?.stop();
      return;
    }
    handle.current = playSynth({
      seed: visual.seed,
      bpm: audio.bpm,
      seconds: PREVIEW_SECONDS,
      onEnd: () => {
        setPlaying(false);
        setProgress(0);
        handle.current = null;
      },
    });
    setPlaying(true);
  };

  return (
    <div className={cn(frameClass(variant, "aspect-square"), "overflow-hidden bg-black text-white")}>
      <div className="absolute inset-0 scale-125 opacity-70 blur-2xl">
        <Artwork visual={visual} grain={false} />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-5 p-6">
        <div className="relative aspect-square w-[52%] max-w-[300px]">
          <div
            className={cn(
              "vinyl absolute inset-0 rounded-full transition-[translate] duration-700",
              playing ? "translate-x-[22%] animate-spin-slow" : "translate-x-0",
            )}
          />
          <div className="relative h-full w-full overflow-hidden rounded-xl shadow-2xl shadow-black/50">
            <Artwork visual={visual} label={altText(post)} />
          </div>
        </div>
        <div className="w-full max-w-[340px] text-center">
          <p className="truncate font-semibold">{post.title}</p>
          <p className="text-xs text-white/70">
            {audio.genre} · {audio.bpm} BPM · {audio.key}
          </p>
        </div>
        <div className="flex w-full max-w-[340px] items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause preview" : "Play preview"}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-black transition active:scale-95"
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
          </button>
          <div className="flex h-10 flex-1 items-center gap-[2px]" aria-hidden>
            {bars.map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-full transition-colors", i / bars.length < progress ? "bg-white" : "bg-white/35", playing && "eq-bar")}
                style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 90}ms` }}
              />
            ))}
          </div>
          <span className="w-10 text-right text-xs tabular-nums text-white/80">
            {formatDuration(playing ? progress * PREVIEW_SECONDS : audio.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
