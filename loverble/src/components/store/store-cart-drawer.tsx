import { Link } from "@tanstack/react-router";
import { ShoppingCart, X } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { ProductVisual } from "@/components/store/product-visual";
import { formatUsd } from "@/lib/pricing";
import { resolveCartCheckout, useStoreCart } from "@/lib/store-cart";

export function StoreCartButton() {
  const { count, setOpen } = useStoreCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative inline-flex items-center gap-2 rounded-sm border border-gold/50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10"
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      Cart
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function StoreCartDrawer() {
  const { items, open, setOpen, removeItem, clear, subtotalUsd } = useStoreCart();
  const checkout = resolveCartCheckout(items);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close cart"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-dominant shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Cart</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cart is empty.{" "}
              <Link to="/store" className="text-gold hover:underline" onClick={() => setOpen(false)}>
                Browse modules
              </Link>
            </p>
          ) : (
            items.map(({ product }) => (
              <div
                key={product.id}
                className="flex gap-3 rounded-lg border border-border/60 bg-card/20 p-3"
              >
                <ProductVisual product={product} className="max-w-[88px] shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">{product.shortTitle}</p>
                  <p className="text-base font-semibold text-gold">{formatUsd(product.priceUsd)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="text-[11px] text-muted-foreground hover:text-bear"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (USD)</span>
              <span className="font-display text-xl font-semibold text-gold">
                {formatUsd(subtotalUsd)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Email is collected once below for your receipt and download link. Files also unlock in{" "}
              <Link to="/portal" className="text-gold hover:underline" onClick={() => setOpen(false)}>
                My downloads
              </Link>
              .
            </p>
            {checkout ? (
              <CheckoutForm
                productType="excel_module"
                productId={checkout.productId}
                amountUsd={checkout.amountUsd}
                label={checkout.label}
                onSuccessClose={() => {
                  clear();
                  setOpen(false);
                }}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Checkout one module at a time, or add all four to unlock the Master Bundle in a
                  single payment.
                </p>
                {items.map(({ product }) => (
                  <CheckoutForm
                    key={product.id}
                    productType="excel_module"
                    productId={product.id}
                    amountUsd={product.priceUsd}
                    label={`Pay ${formatUsd(product.priceUsd)} · ${product.shortTitle}`}
                    onSuccessClose={() => removeItem(product.id)}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={clear}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear cart
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
