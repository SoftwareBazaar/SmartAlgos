import { useState } from "react";
import { cn } from "@/lib/utils";

/** JPEG/WebP product image with graceful fallback (no SVG — unreliable as <img> in some CSP setups). */
export function ProductImage({
  src,
  alt,
  className,
  aspect = "4/3",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  aspect?: "4/3" | "16/10" | "16/9";
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (alt || "?").trim().charAt(0).toUpperCase() || "S";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border/50 bg-[#0a0f1a]",
        aspect === "4/3" && "aspect-[4/3]",
        aspect === "16/10" && "aspect-[16/10]",
        aspect === "16/9" && "aspect-[16/9]",
        className,
      )}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/20 via-[#0d121c] to-[#0a0f1a]">
          <span className="font-display text-4xl font-semibold text-gold/70">{initial}</span>
        </div>
      )}
    </div>
  );
}
