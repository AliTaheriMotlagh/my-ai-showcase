"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Artwork } from "@/components/art/Artwork";
import { cn } from "@/lib/cn";
import { altText, ASPECT, frameClass, type MediaProps } from "./shared";

export function GalleryMedia({ post, variant }: MediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const n = post.visuals.length;

  if (variant === "tile") {
    return (
      <div className="absolute inset-0">
        <Artwork visual={post.visuals[0]} label={altText(post)} />
      </div>
    );
  }

  const go = (to: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: to * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={cn(frameClass(variant, ASPECT[post.aspect]), "group overflow-hidden bg-black")}>
      <div
        ref={ref}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${post.title}, ${n} images`}
      >
        {post.visuals.map((v, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
            <Artwork visual={v} label={`${altText(post)} (${i + 1}/${n})`} fit={variant === "full" ? "contain" : "cover"} />
          </div>
        ))}
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white tabular-nums">
        {index + 1}/{n}
      </span>
      {index > 0 && (
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-black shadow-lg md:group-hover:grid"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {index < n - 1 && (
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next image"
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-black shadow-lg md:group-hover:grid"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {post.visuals.map((_, i) => (
          <span key={i} className={cn("size-1.5 rounded-full transition-colors", i === index ? "bg-white" : "bg-white/45")} />
        ))}
      </div>
    </div>
  );
}
