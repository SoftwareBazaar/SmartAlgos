import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShoppingBag } from "lucide-react";
import { FreeSampleGate } from "@/components/store/free-sample-gate";
import { ProductVisual } from "@/components/store/product-visual";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  EXCEL_MODULE_PRODUCTS,
  STORE_FAQ,
  bundleSavingsUsd,
  listExcelModulesOnly,
} from "@/lib/excel-module-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatUsd } from "@/lib/pricing";

const bundle = EXCEL_MODULE_PRODUCTS.find((p) => p.isBundle)!;
const modules = listExcelModulesOnly();
const save = bundleSavingsUsd(bundle);
const savePct = Math.round((save / bundle.listValueUsd) * 100);

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Excel Quant Models — Smart Algo STS Store" },
      {
        name: "description",
        content:
          "Buy transparent Excel models for portfolio risk, options Greeks, yield curves, and multi-factor stock selection. No macros. Instant download after Paystack.",
      },
      { property: "og:title", content: "Excel Quant Models — Smart Algo STS Store" },
      {
        property: "og:description",
        content:
          "Four audit-friendly Excel workbooks or the $129 Master Bundle. Free Black-Scholes sample. Instant portal delivery.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/store" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://www.smartalgosts.com/og/store-excel-suite.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Excel Quant Models — Smart Algo STS Store" },
      {
        name: "twitter:description",
        content: "Transparent Excel quant workbooks. Master Bundle $129. Free sample available.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/store" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Excel Quant Models",
          url: "https://www.smartalgosts.com/store",
          provider: { "@type": "Organization", name: "Smart Algo STS" },
          mainEntity: EXCEL_MODULE_PRODUCTS.map((p) => ({
            "@type": "Product",
            name: p.title,
            sku: p.id,
            offers: {
              "@type": "Offer",
              price: p.priceUsd.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          })),
        }),
      },
    ],
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
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-20 md:pt-24 pb-16 space-y-16">
      {/* Hero */}
      <header className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Smart Algo STS · Store</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] max-w-[18ch]">
            Transparent Excel models you can audit cell by cell
          </h1>
          <p className="text-base text-foreground/85 leading-relaxed max-w-[58ch]">
            Portfolio risk, options Greeks, yield curves, and multi-factor selection — no VBA
            macros, so files open cleanly on Windows and Mac. Built for analysts, CFA candidates,
            and serious retail quants.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addItem(bundle.id)}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Get Master Bundle · {formatUsd(bundle.priceUsd)}
            </button>
            <a
              href="#free-sample"
              className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-gold/50"
            >
              Try a free sample
            </a>
            <StoreCartButton />
          </div>
          <p className="text-xs text-muted-foreground max-w-[50ch]">
            Instant delivery: Paystack receipt + email link + unlock in{" "}
            <Link to="/portal" className="text-gold hover:underline">
              My downloads
            </Link>
            . Educational models — not personalized advice.
          </p>
        </div>
        <ProductVisual product={bundle} variant="hero" />
      </header>

      {/* Proof strip */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          "Excel 365 / 2021 / 2019 · Win & Mac",
          "No macros · no security prompts",
          "Email + portal download after pay",
          "14-day open-file guarantee",
        ].map((t) => (
          <div
            key={t}
            className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/20 px-3 py-3 text-sm text-foreground/90"
          >
            <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            {t}
          </div>
        ))}
      </section>

      {/* Bundle card */}
      <section
        id="bundle"
        className="rounded-xl border border-gold/40 bg-secondary-surface/80 p-6 md:p-8 space-y-6"
      >
        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">
          <ProductVisual product={bundle} />
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Best value</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-1">
                What’s in the Master Bundle
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[60ch] leading-relaxed">
                {bundle.description}
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {bundle.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-end gap-4 pt-2">
              <div>
                <p className="font-display text-4xl font-semibold text-gold leading-none">
                  {formatUsd(bundle.priceUsd)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="line-through">{formatUsd(bundle.listValueUsd)}</span>
                  {" · "}
                  <span className="text-foreground">
                    Save {formatUsd(save)} ({savePct}%)
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => addItem(bundle.id)}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add bundle to cart
              </button>
              <Link
                to="/store/$slug"
                params={{ slug: bundle.slug }}
                className="text-sm text-gold hover:underline self-center"
              >
                Full bundle details
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              After payment you’ll get a receipt email and files unlock under My downloads. No
              account needed before checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-semibold">Individual modules</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {modules.map((mod) => {
            const upgrade = bundle.priceUsd - mod.priceUsd;
            return (
              <article
                key={mod.id}
                className="grid sm:grid-cols-[160px_1fr] gap-4 rounded-xl border border-border/60 bg-card/20 p-4 md:p-5 hover:border-gold/35 transition-colors"
              >
                <Link to="/store/$slug" params={{ slug: mod.slug }}>
                  <ProductVisual product={mod} className="max-w-none" />
                </Link>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {mod.level}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {mod.sheetCount} sheets · {mod.chartCount} charts · {mod.approxSizeMb}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-snug">
                    <Link
                      to="/store/$slug"
                      params={{ slug: mod.slug }}
                      className="hover:text-gold transition-colors"
                    >
                      {mod.shortTitle}
                    </Link>
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{mod.summary}</p>
                  <ul className="space-y-1">
                    {mod.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                    <p className="font-display text-2xl font-semibold text-gold">
                      {formatUsd(mod.priceUsd)}
                    </p>
                    <button
                      type="button"
                      onClick={() => addItem(mod.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/55 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                    </button>
                    <Link
                      to="/store/$slug"
                      params={{ slug: mod.slug }}
                      className="text-xs text-muted-foreground hover:text-gold underline-offset-2 hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Add the other three for about {formatUsd(upgrade)} more via the Master Bundle
                    and save vs buying separately.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">How delivery works</h2>
        <ol className="grid md:grid-cols-3 gap-4">
          {[
            {
              n: "1",
              t: "Pay with Paystack",
              d: "Checkout collects your email and card. Amounts are shown in USD; Paystack may settle in local currency.",
            },
            {
              n: "2",
              t: "Get the link",
              d: "We email a download link and unlock the files in My downloads (portal) for the same email.",
            },
            {
              n: "3",
              t: "Open in Excel",
              d: "No macros to enable. Blue cells are inputs; black are formulas; green links pull from other sheets.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-lg border border-border/60 bg-card/20 p-4 space-y-2"
            >
              <p className="text-gold font-display text-2xl font-semibold">{s.n}</p>
              <p className="font-semibold text-foreground">{s.t}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Sample */}
      <section id="free-sample">
        <FreeSampleGate />
      </section>

      {/* Built by */}
      <section className="rounded-xl border border-border/60 bg-card/20 p-5 md:p-6 space-y-2 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Built by</p>
        <h2 className="font-display text-xl font-semibold">Smart Algo STS quant desk</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Models are maintained by Smart Algos Investment Solution Ltd (Kenya) — the same team
          behind our Decision Math notes and systematic research. See live strategy verification
          references via QuantConnect in the site footer. These Excel files are educational /
          research tools, not a regulated product.
        </p>
        <Link to="/finance" className="text-sm text-gold hover:underline inline-block pt-1">
          Browse Decision Math notes →
        </Link>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">FAQ</h2>
        <div className="space-y-2">
          {STORE_FAQ.map((item) => (
            <details
              key={item.q}
              className="rounded-lg border border-border/60 bg-card/20 px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[70ch]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-6 max-w-[70ch]">
        Educational modeling tools only — not personalized financial advice.{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
