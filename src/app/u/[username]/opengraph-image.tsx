import { ImageResponse } from "next/og";
import { getUser, getUserStats } from "@/lib/data";
import { compact, truncate } from "@/lib/format";
import { OG_SIZE, OgFrame } from "@/lib/og";
import { PALETTES } from "@/lib/palettes";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "AI creator profile";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getUser(username);
  if (!user) {
    return new ImageResponse(<OgFrame palette={PALETTES[0].colors}>{null}</OgFrame>, size);
  }
  const stats = getUserStats(user.id);
  const p = user.palette;
  return new ImageResponse(
    (
      <OgFrame palette={p}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 800,
              border: "6px solid white",
              background: `linear-gradient(135deg, ${p[2]}, ${p[4]})`,
            }}
          >
            {user.name.charAt(0)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, display: "flex" }}>{user.name}</div>
            <div style={{ fontSize: 32, opacity: 0.85, marginTop: 10, display: "flex" }}>
              @{user.username} · {truncate(user.headline, 40)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 30, marginTop: 28, display: "flex", gap: 28, opacity: 0.9 }}>
          <span>{compact(user.followers)} followers</span>
          <span>{stats.posts} showcases</span>
          <span>{compact(stats.likes)} likes</span>
        </div>
      </OgFrame>
    ),
    size,
  );
}
