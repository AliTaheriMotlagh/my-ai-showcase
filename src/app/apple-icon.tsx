import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed, #db2777 60%, #f59e0b)",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 64 64">
          <path d="M32 2c3 17 13 27 30 30-17 3-27 13-30 30-3-17-13-27-30-30 17-3 27-13 30-30z" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
