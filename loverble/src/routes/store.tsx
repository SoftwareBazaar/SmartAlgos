import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CheckoutForm } from "@/components/checkout-form";
import {
  EXCEL_MODULE_PRODUCTS,
  listExcelModulesOnly,
} from "@/lib/excel-module-catalog";
import { formatUsd, formatUsdWithKes } from "@/lib/pricing";
import { ArrowRight, Check } from "lucide-react";

const bundle = EXCEL_MODULE_PRODUCTS.find((p) => p.isBundle)!;
const modules = listExcelModulesOnly();

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      {
        title: "Quantitative Finance Excel Suite — Smart Algo STS Store",
      },
      {
        name: "description",
        content:
          "Buy institutional quantitative finance Excel workbooks: portfolio Monte Carlo risk, multi-leg options Greeks, fixed-income yield curves, and multi-factor stock selection. Macro-free. Paystack checkout.",
      },
      {
        property: "og:title",
        content: "Quantitative Finance Master Bundle — Excel Modeling Suite",
      },
      {
        property: "og:description",
        content:
          "Wall Street-grade quant models in native Microsoft Excel. Four modules or the Master Bundle. Instant unlock via Paystack.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/store" },
      { property: "og:type", content: "website" },
      { name: "keywords", content: "excel quantitative finance, portfolio optimization excel, black scholes excel, yield curve excel, factor investing excel, monte carlo var excel" },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/store" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Quantitative Finance Excel Modeling Suite",
          url: "https://www.smartalgosts.com/store",
          description:
            "Institutional quantitative modeling workbooks for Microsoft Excel — portfolio risk, options, fixed income, and multi-factor equity.",
          hasPart: EXCEL_MODULE_PRODUCTS.map((p) => ({
            "@type": "Product",
            name: p.title,
            url: `https://www.smartalgosts.com/store/${p.slug}`,
            offers: {
              "@type": "Offer",
              price: p.priceUsd.toFixed(2),
              priceCurrency: "USD",
            },
          })),
        }),
      },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  return (
    <PageShell
      eyebrow="Store · Smart Algo STS"
      title="Quantitative Finance Master Bundle"
      description="Wall Street-grade quant models in macro-free Microsoft Excel. Instant unlock after Paystack checkout."
    >
      <section className="rounded-2xl border border-gold/40 bg-secondary-surface p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Best value</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">{bundle.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{bundle.description}</p>
            <p className="text-sm">
              <span className="text-gold font-semibold text-lg">{formatUsd(bundle.priceUsd)}</span>
              <span className="text-muted-foreground ml-2 line-through">
                {formatUsd(bundle.listValueUsd)}
              </span>
              <span className="text-muted-foreground ml-2 text-xs">
                ({formatUsdWithKes(bundle.priceUsd)})
              </span>
            </p>
          </div>
          <div className="w-full max-w-sm rounded-lg border border-border/60 bg-card/40 p-4">
            <CheckoutForm
              productType="excel_module"
              productId={bundle.id}
              amountUsd={bundle.priceUsd}
              label={`Buy master bundle — ${formatUsd(bundle.priceUsd)}`}
            />
          </div>
        </div>
        <ul className="grid sm:grid-cols-2 gap-2">
          {bundle.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-xl font-semibold">Individual modules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <article
              key={mod.id}
              className="rounded-xl border border-border/60 bg-card/30 p-5 space-y-3 flex flex-col"
            >
              <div className="space-y-2 flex-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                  {formatUsd(mod.priceUsd)}
                </p>
                <h3 className="font-display text-lg font-semibold leading-snug">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.summary}</p>
                <ul className="space-y-1.5 pt-1">
                  {mod.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/store/$slug"
                  params={{ slug: mod.slug }}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold hover:underline"
                >
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <CheckoutForm
                productType="excel_module"
                productId={mod.id}
                amountUsd={mod.priceUsd}
                label={`Buy — ${formatUsd(mod.priceUsd)}`}
              />
            </article>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
        Educational modeling tools only — not personalized financial advice. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        . Files unlock in the{" "}
        <Link to="/portal" className="text-gold hover:underline">
          client portal
        </Link>{" "}
        after Paystack confirmation.
      </p>
    </PageShell>
  );
}
