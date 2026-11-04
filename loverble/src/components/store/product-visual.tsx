import { useState } from "react";
import type { ExcelModuleProduct } from "@/lib/excel-module-catalog";
import { ProductImage } from "@/components/store/product-image";
import { cn } from "@/lib/utils";

type Variant = "card" | "hero" | "gallery" | "cover" | "thumb";

/** Uses JPG covers/products — captions sit below the image, never overlaid. */
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
  const shot = product.shots[Math.min(shotIndex, Math.max(0, product.shots.length - 1))];
  const src =
    variant === "cover" || variant === "card" || variant === "thumb"
      ? product.coverImage
      : shot?.src ?? product.coverImage;
  const caption = shot?.caption ?? product.previewLabel;

  if (variant === "hero" && product.isBundle) {
    return <HeroMockupStack className={className} />;
  }

  return (
    <figure className={cn("w-full", className)}>
      <ProductImage
        src={src}
        alt={caption}
        aspect={variant === "thumb" ? "4/3" : "16/10"}
        priority={variant === "hero"}
        className="group"
      />
      {showCaption && variant !== "cover" && variant !== "thumb" && variant !== "card" ? (
        <figcaption className="mt-1.5 text-[11px] text-muted-foreground leading-snug">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function HeroMockupStack({ className = "" }: { className?: string }) {
  const layers = [
    { src: "/media/store/products/portfolio.jpg", rotate: "-rotate-2", z: "z-10", offset: "translate-y-1" },
    { src: "/media/store/products/options.jpg", rotate: "rotate-1", z: "z-20", offset: "translate-x-3 -translate-y-0.5" },
    { src: "/media/store/products/fixed-income.jpg", rotate: "rotate-2", z: "z-30", offset: "translate-x-6 translate-y-2" },
  ];
  return (
    <div className={cn("relative aspect-[4/3] w-full max-w-md ml-auto", className)}>
      {layers.map((l) => (
        <div
          key={l.src}
          className={cn(
            "absolute inset-[8%] overflow-hidden rounded-lg border border-gold/25 bg-[#0a0f1a] shadow-[0_16px_40px_rgb(0_0_0_/_0.4)]",
            l.rotate,
            l.z,
            l.offset,
          )}
        >
          <img src={l.src} alt="" loading="eager" decoding="async" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export function ProductShotCarousel({
  images,
  captions,
}: {
  images: string[];
  captions?: string[];
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const shots = images.length ? images : [];

  if (!shots.length) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setLightbox(shots[active] ?? null)}
        className="group relative block w-full text-left"
      >
        <ProductImage src={shots[active]!} alt={captions?.[active] ?? ""} aspect="16/10" priority />
        <span className="absolute bottom-2 right-2 rounded border border-gold/40 bg-black/65 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
          Zoom
        </span>
      </button>
      {captions?.[active] ? (
        <p className="text-[11px] text-muted-foreground">{captions[active]}</p>
      ) : null}
      {shots.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {shots.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-12 w-16 shrink-0 overflow-hidden rounded border",
                i === active ? "border-gold/60" : "border-border/50 opacity-70 hover:opacity-100",
              )}
            >
              <img src={s} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/80" aria-label="Close" onClick={() => setLightbox(null)} />
          <img src={lightbox} alt="" className="relative z-10 max-h-[90vh] max-w-[95vw] rounded-lg border border-border/60 object-contain" />
        </div>
      ) : null}
    </div>
  );
}
