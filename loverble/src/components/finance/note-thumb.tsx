import { cn } from "@/lib/utils";

/** Editorial cover — unique static image per note, no text baked in. */
export function NoteThumb({
  src,
  alt,
  className,
  priority = false,
  /** Stretch to parent height (featured 2-col); keep 16:9 on small screens. */
  fill = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-dominant",
        fill ? "aspect-[16/9] md:aspect-auto md:h-full md:min-h-[280px]" : "aspect-[16/9]",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]",
          fill ? "absolute inset-0 h-full w-full" : "h-full w-full",
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dominant/50 via-transparent to-transparent opacity-80" />
    </div>
  );
}
