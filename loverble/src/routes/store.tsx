import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { FreeSampleGate } from "@/components/store/free-sample-gate";
import { ProductShotCarousel, ProductVisual } from "@/components/store/product-visual";
import { StickyMobileCart } from "@/components/store/sticky-mobile-cart";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  EXCEL_MODULE_PRODUCTS,
  STORE_FAQ,
  STORE_GUARANTEE,
  bundleSavingsUsd,
  listExcelModulesOnly,
  type ExcelModuleProduct,
} from "@/lib/excel-module-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatUsd, formatUsdWithKes, usdToKes, formatKes } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const bundle = EXCEL_MODULE_PRODUCTS.find((p) => p.isBundle)!;
const modules = listExcelModulesOnly();
const save = bundleSavingsUsd(bundle);
const savePct = Math.round((save / bundle.listValueUsd) * 100);

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Excel Quant Models — Smart Algos Store" },
      {
        name: "description",
        content:
          "Buy transparent Excel models for portfolio risk, options Greeks, yield curves, and multi-factor stock selection. No macros. Instant download after Paystack.",
      },
      { property: "og:title", content: "Excel Quant Models — Smart Algos Store" },
      {
        property: "og:description",
        content:
          "Four audit-friendly Excel workbooks or the $129 Master Bundle. Free Black-Scholes sample. Instant portal delivery.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/store" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://www.smartalgosts.com/store/covers/bundle.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "627" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Excel Quant Models — Smart Algos Store" },
      {
        name: "twitter:description",
        content: "Transparent Excel quant workbooks. Master Bundle $129. Free sample available.",
      },
      { name: "twitter:image", content: "https://www.smartalgosts.com/store/covers/bundle.jpg" },
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
          provider: { "@type": "Organization", name: "Smart Algos" },
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
      <StickyMobileCart />
    </StoreCartProvider>
  );
}

function LevelBadge({ level }: { level: ExcelModuleProduct["level"] }) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        level === "Advanced"
          ? "border border-gold/50 bg-gold/10 text-gold"
          : "border border-sky-500/40 bg-sky-500/10 text-sky-300",
      )}
    >
      {level}
    </span>
  );
}

function StorePage() {
  const { addItem } = useStoreCart();

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pt-20 md:pt-24 pb-28 md:pb-16 space-y-14">
      {/* Hero */}
      <header className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Smart Algos · Store</p>
          <h1 className="font-display text-[1.75rem] md:text-[2.15rem] font-semibold leading-[1.2] tracking-tight max-w-[20ch]">
            Transparent Excel models you can audit cell by cell
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
            Portfolio risk, options Greeks, yield curves, and multi-factor selection — no VBA
            macros, so files open cleanly on Windows and Mac. Built for analysts, CFA candidates,
            and serious retail quants.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => addItem(bundle.id)}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Get Master Bundle · {formatUsd(bundle.priceUsd)}
            </button>
            <a
              href="#free-sample"
              className="text-sm text-gold hover:underline underline-offset-4"
            >
              Try a free sample
            </a>
            <StoreCartButton />
          </div>
          <p className="text-xs text-muted-foreground max-w-[50ch]">
            {formatUsdWithKes(bundle.priceUsd)} desk rate · Paystack (card / M-Pesa when available) ·
            unlock in{" "}
            <Link to="/portal" className="text-gold hover:underline">
              My downloads
            </Link>
            . Educational models — not personalized advice.
          </p>
        </div>
        <ProductVisual product={bundle} variant="hero" showCaption={false} />
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
      <motion.section
        id="bundle"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-xl border border-gold/40 bg-secondary-surface/80 overflow-hidden"
      >
        <div className="grid md:grid-cols-[minmax(0,280px)_1fr] gap-0">
          <div className="relative min-h-[200px] md:min-h-full">
            <img
              src={bundle.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="p-6 md:p-8 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Best value</p>
              <h2 className="font-display text-xl md:text-2xl font-semibold mt-1 tracking-tight">
                What’s in the Master Bundle
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-[60ch] leading-relaxed">
                {bundle.description}
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-sm">
              <span className="text-muted-foreground line-through">{formatUsd(bundle.listValueUsd)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold text-gold">{formatUsd(bundle.priceUsd)}</span>
              <span className="text-muted-foreground">
                · Save {formatUsd(save)} ({savePct}%)
              </span>
              <span className="text-[11px] text-muted-foreground w-full sm:w-auto">
                Buy 4 separately {formatUsd(bundle.listValueUsd)} → Bundle {formatUsd(bundle.priceUsd)}
              </span>
            </div>

            <ul className="grid sm:grid-cols-2 gap-2">
              {bundle.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-4 pt-1">
              <div>
                <p className="font-display text-2xl md:text-3xl font-semibold text-gold leading-none tabular-nums">
                  {formatUsd(bundle.priceUsd)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatKes(usdToKes(bundle.priceUsd))} desk rate
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
              account needed before checkout. M-Pesa appears at Paystack checkout when enabled.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Modules 2×2 */}
      <section className="space-y-5">
        <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">Individual modules</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {modules.map((mod, i) => (
            <motion.article
              key={mod.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: Math.min(i * 0.05, 0.2) }}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/20 hover:border-gold/35 transition-colors"
            >
              <Link to="/store/$slug" params={{ slug: mod.slug }} className="block p-4 pb-0">
                <ProductVisual product={mod} variant="card" className="max-w-none" />
              </Link>
              <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge level={mod.level} />
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
                <p className="text-sm text-foreground/85 leading-relaxed">{mod.promise}</p>
                <ul className="space-y-1">
                  {mod.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                  <div>
                    <p className="font-display text-xl font-semibold text-gold tabular-nums">
                      {formatUsd(mod.priceUsd)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">≈ {formatKes(usdToKes(mod.priceUsd))}</p>
                  </div>
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
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Screenshot galleries */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">Inspect the sheets</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-[60ch]">
            Sheet-layout previews for each module — click to zoom. Captions sit under the image.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {modules.map((mod) => (
            <div key={mod.id} className="space-y-2">
              <h3 className="font-display text-base font-semibold">{mod.shortTitle}</h3>
              <ProductShotCarousel product={mod} />
            </div>
          ))}
        </div>
      </section>

      {/* What’s inside */}
      <section className="space-y-4">
        <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">What’s inside</h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-card/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Sheets</th>
                <th className="px-4 py-3 font-medium">Charts</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-t border-border/50">
                  <td className="px-4 py-3 text-foreground">{m.shortTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.level}</td>
                  <td className="px-4 py-3 tabular-nums">{m.sheetCount}</td>
                  <td className="px-4 py-3 tabular-nums">{m.chartCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.approxSizeMb}</td>
                  <td className="px-4 py-3 text-gold font-semibold tabular-nums">{formatUsd(m.priceUsd)}</td>
                </tr>
              ))}
              <tr className="border-t border-gold/30 bg-gold/5">
                <td className="px-4 py-3 font-semibold">Master Bundle</td>
                <td className="px-4 py-3 text-muted-foreground">All</td>
                <td className="px-4 py-3 tabular-nums">{bundle.sheetCount}</td>
                <td className="px-4 py-3 tabular-nums">{bundle.chartCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{bundle.approxSizeMb}</td>
                <td className="px-4 py-3 text-gold font-semibold tabular-nums">{formatUsd(bundle.priceUsd)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Excel versions: Microsoft 365, Excel 2021, Excel 2019 — Windows and Mac. No VBA macros.
        </p>
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">How delivery works</h2>
        <ol className="grid md:grid-cols-3 gap-4">
          {[
            {
              n: "1",
              t: "Pay with Paystack",
              d: "Checkout collects your email and card (or M-Pesa when available). Amounts are shown in USD; Paystack may settle in KES.",
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
              <p className="text-gold font-mono text-sm font-semibold tracking-wider">{s.n}</p>
              <p className="font-semibold text-foreground">{s.t}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Guarantee */}
      <section className="rounded-xl border border-gold/30 bg-gold/5 p-5 md:p-6 space-y-2 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">14-day open-file guarantee</p>
        <h2 className="font-display text-lg font-semibold tracking-tight">What you can expect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{STORE_GUARANTEE}</p>
      </section>

      {/* Sample */}
      <section id="free-sample">
        <FreeSampleGate />
      </section>

      {/* Built by */}
      <section className="rounded-xl border border-border/60 bg-card/20 p-5 md:p-6 space-y-2 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Built by</p>
        <h2 className="font-display text-lg font-semibold tracking-tight">Smart Algos quant desk</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Models are maintained by Smart Algos Investment Solution Ltd (Kenya) — the same team
          behind our Decision Math notes and systematic research. These Excel files are educational /
          research tools, not a regulated product.
        </p>
        <Link to="/finance" className="text-sm text-gold hover:underline inline-block pt-1">
          Browse Decision Math notes →
        </Link>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">FAQ</h2>
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
