import { ShoppingCart } from "lucide-react";
import { formatUsd, formatUsdWithKes } from "@/lib/pricing";
import { useStoreCart } from "@/lib/store-cart";

/** Mobile sticky bar: total + checkout (opens cart drawer). */
export function StickyMobileCart() {
  const { count, subtotalUsd, setOpen } = useStoreCart();
  if (count < 1) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-[#0b0e14]/95 backdrop-blur-md px-4 py-3 md:hidden safe-pb">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {count} item{count === 1 ? "" : "s"}
          </p>
          <p className="font-display text-lg font-semibold text-gold tabular-nums truncate">
            {formatUsd(subtotalUsd)}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{formatUsdWithKes(subtotalUsd)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Checkout
        </button>
      </div>
    </div>
  );
}
