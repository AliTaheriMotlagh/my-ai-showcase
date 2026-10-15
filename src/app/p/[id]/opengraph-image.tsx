import { ImageResponse } from "next/og";
import { compact, truncate } from "@/lib/format";
import { KIND_MAP } from "@/lib/kinds";
import { OG_SIZE, OgFrame } from "@/lib/og";
import { paletteFor } from "@/lib/palettes";
import { getPost } from "@/server/queries/posts";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "AI showcase post";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id, null);
  if (!post) return new ImageResponse(<OgFrame palette={paletteFor("latent")}>{null}</OgFrame>, size);
  return new ImageResponse(
    (
      <OgFrame palette={paletteFor(post.id)}>
        <div style={{ fontSize: 26, opacity: 0.85, display: "flex", textTransform: "uppercase", letterSpacing: 3 }}>
          AI {KIND_MAP[post.kind].label} · {post.model}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 12, display: "flex" }}>{truncate(post.title, 48)}</div>
        <div style={{ fontSize: 30, marginTop: 20, display: "flex", gap: 24, opacity: 0.9 }}>
          <span>by @{post.author.username}</span>
          <span>{compact(post.stats.likes)} likes</span>
          <span>{compact(post.stats.remixes)} remixes</span>
        </div>
      </OgFrame>
    ),
    size,
  );
}
