import type { HTMLAttributes } from "react";

/** The <model-viewer> web component (loaded from the CDN in ModelMedia.tsx). */
interface ModelViewerAttributes extends HTMLAttributes<HTMLElement> {
  src?: string;
  alt?: string;
  "camera-controls"?: string;
  "auto-rotate"?: string;
  "interaction-prompt"?: string;
  "shadow-intensity"?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
