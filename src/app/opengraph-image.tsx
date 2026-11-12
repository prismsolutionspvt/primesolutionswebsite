import { ImageResponse } from "next/og";

export const alt = "Prism Solutions — Your Partner in Business Growth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 1200×630 social preview (WhatsApp, Instagram, LinkedIn, X). Replace with the supplied artwork when final. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B1F4B", padding: 72, color: "#fff", fontFamily: "sans-serif" }}>
        <svg width="220" height="107" viewBox="0 0 132 64">
          <path d="M2 62C30 20 72 1 112 9C76 9 36 28 2 62Z" fill="#F28A1E" />
          <path d="M120 8 Q122 20 132 22 Q122 24 120 36 Q118 24 108 22 Q118 20 120 8Z" fill="#F7A83B" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 900, fontStyle: "italic", letterSpacing: -6, lineHeight: 1 }}>Prism</div>
          <div style={{ fontSize: 40, letterSpacing: 18, textTransform: "uppercase", marginTop: 8, opacity: 0.85 }}>Solutions</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, borderTop: "2px solid rgba(255,255,255,0.2)", paddingTop: 28 }}>
          <span>Your Partner in Business Growth.</span>
          <span style={{ color: "#F7A83B" }}>Quality · Commitment · Performance</span>
        </div>
      </div>
    ),
    size,
  );
}
