"use client";

import { Heart } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Instagram-style double-tap to like, with a heart burst. Ignores taps on controls. */
export function DoubleTap({ onDoubleTap, children, className }: { onDoubleTap: () => void; children: ReactNode; className?: string }) {
  const last = useRef(0);
  const [bursts, setBursts] = useState<number[]>([]);

  return (
    <div
      className={cn("relative touch-manipulation select-none", className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, a, input, textarea, select, audio, video")) return;
        const now = Date.now();
        if (now - last.current < 320) {
          last.current = 0;
          onDoubleTap();
          setBursts((b) => [...b, now]);
          window.setTimeout(() => setBursts((b) => b.filter((x) => x !== now)), 900);
        } else {
          last.current = now;
        }
      }}
    >
      {children}
      {bursts.map((id) => (
        <span key={id} className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-hidden>
          <Heart className="animate-heart-burst size-24 fill-white text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.35)]" />
        </span>
      ))}
    </div>
  );
}
