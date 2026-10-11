import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame } from "@/lib/og";
import { PALETTES } from "@/lib/palettes";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame palette={PALETTES[0].colors}>
        <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, display: "flex" }}>Where AI work gets seen.</div>
        <div style={{ fontSize: 32, marginTop: 20, opacity: 0.85, display: "flex" }}>
          Images · Video · Music · Writing · Code · Data · 3D
        </div>
      </OgFrame>
    ),
    size,
  );
}
