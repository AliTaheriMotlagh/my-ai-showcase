"use client";

import { Box } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useMedia";
import { cn } from "@/lib/cn";
import { paletteFor } from "@/lib/palettes";
import { altText, frameClass, mediaOf, MissingMedia, type MediaProps } from "./shared";

/** Pinned version so the page never loads code we haven't tested. Version 4.3.1 is older than two weeks. */
const MODEL_VIEWER_SRC = "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js";

let loader: Promise<void> | null = null;

/** Loads the web component once, the first time a 3D post is shown. */
function loadModelViewer(): Promise<void> {
  if (typeof customElements !== "undefined" && customElements.get("model-viewer")) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(new Error("Couldn't load the 3D viewer"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

/** Interactive .glb / .gltf viewer. Tiles show a placeholder so a grid never starts many WebGL contexts. */
export function ModelMedia({ post, variant }: MediaProps) {
  const model = mediaOf(post, "model");
  const [frameRef, inView] = useInView<HTMLDivElement>(0.2, variant !== "tile");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const p = paletteFor(post.id);
  const live = variant !== "tile" && inView && !failed;

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    loadModelViewer()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [live]);

  if (!model) return <MissingMedia />;

  const placeholder = (
    <div
      className="absolute inset-0 grid place-items-center"
      aria-hidden
      style={{ background: `radial-gradient(circle at 50% 42%, ${p[2]}66, ${p[0]} 62%), ${p[0]}` }}
    >
      <Box className="size-1/4 text-white/70" />
    </div>
  );

  return (
    <div ref={frameRef} role="img" aria-label={altText(post)} className={cn(frameClass(variant, "aspect-square"), "overflow-hidden")}>
      {live && ready ? (
        <model-viewer
          src={model.url}
          alt={altText(post)}
          camera-controls={variant === "full" ? "" : undefined}
          auto-rotate=""
          interaction-prompt="none"
          shadow-intensity="1"
          style={{ width: "100%", height: "100%", background: p[0] }}
        />
      ) : (
        placeholder
      )}
      {variant !== "tile" && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          {failed ? "3D viewer unavailable" : `3D model · ${post.model}`}
        </span>
      )}
    </div>
  );
}
