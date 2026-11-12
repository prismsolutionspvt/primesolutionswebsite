import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#0B1F4B", color: "#fff", fontSize: 120, fontWeight: 900, fontStyle: "italic", paddingBottom: 10, position: "relative" }}>
        <svg width="140" height="68" viewBox="0 0 132 64" style={{ position: "absolute", top: 18, left: 20 }}>
          <path d="M2 62C30 20 72 1 112 9C76 9 36 28 2 62Z" fill="#F28A1E" />
          <path d="M120 8 Q122 20 132 22 Q122 24 120 36 Q118 24 108 22 Q118 20 120 8Z" fill="#F7A83B" />
        </svg>
        P
      </div>
    ),
    size,
  );
}
