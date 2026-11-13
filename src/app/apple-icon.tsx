import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const file = await readFile(path.join(process.cwd(), "public", "brand", "prism-logo.jpg"));
  const src = `data:image/jpeg;base64,${file.toString("base64")}`;
  const w = 164;
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
