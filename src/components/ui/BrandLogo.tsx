import Image from "next/image";

/** Intrinsic size of the original logo file. Do not change — it keeps the proportions exact. */
export const LOGO = { src: "/brand/prism-logo.jpg", width: 1413, height: 729 } as const;

type Props = {
  /** Rendered height in px; width follows the original proportions. */
  height?: number;
  priority?: boolean;
  className?: string;
};

/**
 * The EXACT original Prism Solutions logo (extracted from the company portfolio), uncropped.
 * The artwork has a white background, so in dark mode it sits on a white plate to stay fully legible.
 */
export function BrandLogo({ height = 48, priority = false, className = "" }: Props) {
  const width = Math.round((height * LOGO.width) / LOGO.height);
  return (
    <span className={`logo-plate inline-flex shrink-0 items-center ${className}`}>
      <Image
        src={LOGO.src}
        alt="Prism Solutions — Your Partner in Business Growth."
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        sizes={`${width}px`}
        style={{ height, width }}
        className="block select-none mix-blend-multiply"
        draggable={false}
      />
    </span>
  );
}
