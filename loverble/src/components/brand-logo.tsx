import { cn } from "@/lib/utils";
import { SigmaMark } from "@/components/sigma-mark";

const markSize = {
  nav: 42,
  sidebar: 36,
  icon: 32,
  footer: 30,
  auth: 48,
} as const;

function BrandWordmark() {
  return (
    <div className="flex flex-col leading-none min-w-0">
      <span className="font-display text-[13px] sm:text-sm font-semibold tracking-[0.16em] text-foreground whitespace-nowrap">
        SMART ALGOS
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-muted-foreground mt-1">
        Capital
      </span>
    </div>
  );
}

export function BrandLogo({
  variant = "nav",
  iconOnly = false,
  className,
}: {
  variant?: keyof typeof markSize;
  /** Mark only — sidebar collapsed or favicon-style placements */
  iconOnly?: boolean;
  className?: string;
}) {
  const size = markSize[variant];
  const showWordmark = !iconOnly && variant !== "icon";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 sm:gap-3 transition-opacity duration-200 hover:opacity-90",
        className,
      )}
    >
      <SigmaMark size={size} />
      {showWordmark && <BrandWordmark />}
    </div>
  );
}
