import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Prism Solutions — Your Partner in Business Growth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 1200×630 social preview (WhatsApp, Instagram, LinkedIn, X): the exact Prism logo, uncropped, on white. */
export default async function OgImage() {
  const file = await readFile(path.join(process.cwd(), "public", "brand", "prism-logo.jpg"));
  const src = `data:image/jpeg;base64,${file.toString("base64")}`;
  // logo is 1413×729: fit inside the canvas with margin, preserving proportions
  const w = 1000;
  const h = Math.round((w * 729) / 1413);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={w} height={h} alt="" />
      </div>
    ),
    size,
  );
}
