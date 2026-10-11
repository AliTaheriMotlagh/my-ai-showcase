import type { ArtStyle } from "./types";

/** Index 0 is the background; the rest are accents. */
export const PALETTES: { name: string; colors: string[] }[] = [
  { name: "Nebula", colors: ["#0b0221", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0"] },
  { name: "Sunset", colors: ["#1a0b2e", "#ff6b35", "#f7c59f", "#efa00b", "#d62246"] },
  { name: "Ocean", colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"] },
  { name: "Forest", colors: ["#081c15", "#2d6a4f", "#52b788", "#b7e4c7", "#f4d35e"] },
  { name: "Candy", colors: ["#fff0f6", "#ff99c8", "#c8b6ff", "#a0e7e5", "#ffd6a5"] },
  { name: "Ember", colors: ["#140001", "#6a040f", "#d00000", "#faa307", "#ffba08"] },
  { name: "Mint", colors: ["#f1faee", "#a8dadc", "#457b9d", "#1d3557", "#e63946"] },
  { name: "Cyber", colors: ["#000814", "#00f5d4", "#9b5de5", "#f15bb5", "#fee440"] },
  { name: "Desert", colors: ["#fefae0", "#e9c46a", "#f4a261", "#e76f51", "#264653"] },
  { name: "Mono", colors: ["#0d0d0d", "#3a3a3a", "#8a8a8a", "#d4d4d4", "#ff4d00"] },
  { name: "Lagoon", colors: ["#012a4a", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"] },
  { name: "Peach", colors: ["#2d1e2f", "#f9a26c", "#f7d6bf", "#e05780", "#7b2cbf"] },
];

export const ART_STYLES: ArtStyle[] = ["mesh", "orbit", "bauhaus", "waves", "flow", "bloom", "planet", "dunes"];
