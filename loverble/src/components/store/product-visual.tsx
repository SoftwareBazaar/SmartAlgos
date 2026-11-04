import { useState } from "react";
import type { ExcelModuleProduct } from "@/lib/excel-module-catalog";
import { cn } from "@/lib/utils";

type Variant = "card" | "hero" | "gallery" | "cover";

/** Product shot or AI cover — captions always sit below the image, never overlaid. */
export function ProductVisual({
  product,
  variant = "card",
  className = "",
  shotIndex = 0,
  showCaption = true,
}: {
  product: ExcelModuleProduct;
  variant?: Variant;
  className?: string;
  shotIndex?: number;
  showCaption?: boolean;
}) {
  const shot = product.shots[Math.min(shotIndex, product.shots.length - 1)];
  const src = variant === "cover" ? product.coverImage : shot?.src ?? product.coverImage;
  const caption = shot?.caption ?? product.previewLabel;

  if (variant === "hero" && product.isBundle) {
    return <HeroMockupStack className={className} />;
  }

  return (
    <figure className={cn("w-full", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/60 bg-[#0a0f1a] group",
          variant === "gallery" || variant === "card" || variant === "hero"
            ? "aspect-[16/10]"
            : "aspect-[16/9]",
        )}
      >
        <img
          src={src}
          alt={caption}
          loading={variant === "hero" ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      {showCaption && variant !== "cover" ? (
        <figcaption className="mt-2 text-[11px] text-muted-foreground leading-snug">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function HeroMockupStack({ className = "" }: { className?: string }) {
  const layers = [
    { src: "/store/shots/portfolio-frontier.svg", rotate: "-rotate-2", z: "z-10", offset: "translate-y-2" },
    { src: "/store/shots/options-heatmap.svg", rotate: "rotate-1", z: "z-20", offset: "translate-x-4 -translate-y-1" },
    { src: "/store/shots/yield-curve.svg", rotate: "rotate-2", z: "z-30", offset: "translate-x-8 translate-y-3" },
  ];
  return (
    <div className={cn("relative aspect-[16/10] w-full", className)}>
      {layers.map((l, i) => (
        <div
          key={l.src}
          className={cn(
            "absolute inset-[6%] overflow-hidden rounded-xl border border-gold/25 bg-[#0a0f1a] shadow-[0_20px_50px_rgb(0_0_0_/_0.45)]",
            l.rotate,
            l.z,
            l.offset,
          )}
          style={{ width: "88%", maxWidth: "100%" }}
        >
          <img
            src={l.src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>
      ))}
      <p className="absolute bottom-0 left-0 right-0 text-[11px] text-muted-foreground">
        Real sheet layouts from the four workbooks (illustrative window frames)
      </p>
    </div>
  );
}

/** Embla-style carousel with click-to-zoom lightbox. */
export function ProductShotCarousel({ product }: { product: ExcelModuleProduct }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const shots = product.shots.length ? product.shots : [{ src: product.coverImage, caption: product.previewLabel }];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setLightbox(shots[active]?.src ?? null)}
        className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-[#0a0f1a] aspect-[16/10] text-left"
      >
        <img
          src={shots[active]?.src}
          alt={shots[active]?.caption ?? ""}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 right-3 rounded-md border border-gold/40 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wider text-gold">
          Click to zoom
        </span>
      </button>
      <p className="text-[11px] text-muted-foreground">{shots[active]?.caption}</p>
      {shots.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shots.map((s, i) => (
            <button
              key={`${s.src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-24 shrink-0 overflow-hidden rounded-md border",
                i === active ? "border-gold/60" : "border-border/50 opacity-70 hover:opacity-100",
              )}
            >
              <img src={s.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close zoom"
            onClick={() => setLightbox(null)}
          />
          <img
            src={lightbox}
            alt=""
            className="relative z-10 max-h-[90vh] max-w-[95vw] rounded-lg border border-border/60 object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
