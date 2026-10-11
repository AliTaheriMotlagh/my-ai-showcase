import type { ReactNode } from "react";
import { site } from "./site";

/** Shared building blocks for Open Graph images (rendered by next/og — flexbox only). */

export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ palette, children }: { palette: string[]; children: ReactNode }) {
  const blob = (left: string, top: string, color: string, size: number) => (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        display: "flex",
      }}
    />
  );
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: palette[0], color: "white", fontFamily: "sans-serif" }}>
      {blob("-10%", "-30%", palette[1], 900)}
      {blob("55%", "-20%", palette[2], 800)}
      {blob("30%", "45%", palette[3], 900)}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, display: "flex", background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.75) 100%)" }} />
      <div style={{ position: "absolute", left: 64, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", background: "linear-gradient(135deg, #7c3aed, #db2777 60%, #f59e0b)" }} />
        <div style={{ fontSize: 34, fontWeight: 700, display: "flex" }}>{site.name}</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}
