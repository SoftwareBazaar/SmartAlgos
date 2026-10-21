import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { ProductVisual } from "@/components/store/product-visual";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  EXCEL_MODULE_PRODUCTS,
  listExcelModulesOnly,
} from "@/lib/excel-module-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatUsd, formatUsdWithKes } from "@/lib/pricing";

const bundle = EXCEL_MODULE_PRODUCTS.find((p) => p.isBundle)!;
const modules = listExcelModulesOnly();

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Excel Quant Store — Smart Algo STS" },
      {
        name: "description",
        content:
          "Shop institutional quantitative finance Excel workbooks — portfolio risk, options Greeks, yield curves, and multi-factor equity. Macro-free. Paystack checkout.",
      },
      { property: "og:title", content: "Excel Quant Store — Smart Algo STS" },
      {
        property: "og:description",
        content: "Four Excel modules or the Master Bundle. Instant unlock after Paystack payment.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/store" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/store" }],
  }),
  component: StoreRoute,
});

function StoreRoute() {
  return (
    <StoreCartProvider>
      <StorePage />
      <StoreCartDrawer />
    </StoreCartProvider>
  );
}

function StorePage() {
  const { addItem } = useStoreCart();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-20 md:pt-24 pb-16 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Store</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Quantitative Excel suite
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[65ch]">
            Macro-free institutional models for Microsoft Excel. Add modules to your cart and unlock
            instantly after Paystack checkout.
          </p>
        </div>
        <StoreCartButton />
      </header>

      {/* Bundle spotlight */}
      <section className="grid md:grid-cols-[200px_1fr_auto] gap-6 items-center rounded-xl border border-gold/35 bg-secondary-surface/70 p-5 md:p-7">
        <ProductVisual product={bundle} />
        <div className="space-y-2 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Best value</p>
          <h2 className="font-display text-2xl font-semibold">{bundle.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[60ch]">
            {bundle.summary}
          </p>
          <p className="text-sm">
            <span className="text-gold text-xl font-semibold">{formatUsd(bundle.priceUsd)}</span>
            <span className="text-muted-foreground ml-2 line-through text-xs">
              {formatUsd(bundle.listValueUsd)}
            </span>
            <span className="text-muted-foreground ml-2 text-xs">
              {formatUsdWithKes(bundle.priceUsd)}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-44">
          <button
            type="button"
            onClick={() => addItem(bundle.id)}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
          </button>
          <Link
            to="/store/$slug"
            params={{ slug: bundle.slug }}
            className="text-center text-xs text-gold hover:underline"
          >
            View details
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod) => (
            <article
              key={mod.id}
              className="flex flex-col rounded-xl border border-border/60 bg-card/20 overflow-hidden hover:border-gold/35 transition-colors"
            >
              <Link
                to="/store/$slug"
                params={{ slug: mod.slug }}
                className="flex justify-center bg-dominant/80 p-4 border-b border-border/40"
              >
                <ProductVisual product={mod} />
              </Link>
              <div className="flex flex-col flex-1 gap-2 p-4">
                <p className="text-gold text-sm font-semibold">{formatUsd(mod.priceUsd)}</p>
                <h3 className="font-display text-base font-semibold leading-snug">
                  <Link
                    to="/store/$slug"
                    params={{ slug: mod.slug }}
                    className="hover:text-gold transition-colors"
                  >
                    {mod.shortTitle}
                  </Link>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {mod.summary}
                </p>
                <button
                  type="button"
                  onClick={() => addItem(mod.id)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-6 max-w-[70ch]">
        Educational modeling tools — not personalized financial advice.{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        . Files unlock in the{" "}
        <Link to="/portal" className="text-gold hover:underline">
          client portal
        </Link>{" "}
        after payment.
      </p>
    </div>
  );
}
