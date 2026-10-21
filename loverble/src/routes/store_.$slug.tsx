import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CheckoutForm } from "@/components/checkout-form";
import {
  excelProductJsonLd,
  getExcelModuleProduct,
  listExcelStoreProducts,
} from "@/lib/excel-module-catalog";
import { formatUsd, formatUsdWithKes } from "@/lib/pricing";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/store_/$slug")({
  loader: ({ params }) => {
    const product = getExcelModuleProduct(params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const product = loaderData;
    if (!product) return {};
    return {
      meta: [
        { title: `${product.shortTitle} — Smart Algo STS Store` },
        { name: "description", content: product.description },
        { property: "og:title", content: product.title },
        { property: "og:description", content: product.summary },
        {
          property: "og:url",
          content: `https://www.smartalgosts.com/store/${product.slug}`,
        },
        { property: "og:type", content: "product" },
        {
          name: "keywords",
          content: `${product.shortTitle}, excel quantitative finance, ${product.filename}, smart algo sts`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.smartalgosts.com/store/${product.slug}`,
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(excelProductJsonLd(product)),
        },
      ],
    };
  },
  component: StoreProductPage,
});

function StoreProductPage() {
  const product = Route.useLoaderData();
  const others = listExcelStoreProducts().filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <PageShell
      eyebrow="Store · Excel quant module"
      title={product.shortTitle}
      description={`${formatUsdWithKes(product.priceUsd)} · Macro-free Microsoft Excel`}
      actions={
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All products
        </Link>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(excelProductJsonLd(product)) }}
      />

      <article className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-display text-xl md:text-2xl font-semibold leading-snug">
              {product.title}
            </h2>
            <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <p className="font-mono text-xs text-gold border border-border/60 rounded px-3 py-2 inline-block">
              {product.filename}
            </p>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {product.isBundle ? (
              <p className="text-sm text-muted-foreground">
                Bundle unlocks all four workbooks. Listed separately at{" "}
                <span className="line-through">{formatUsd(product.listValueUsd)}</span>.
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-sm rounded-lg border border-border/60 bg-card/40 p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">One-time license</p>
            <p className="font-display text-3xl font-semibold text-foreground">
              {formatUsd(product.priceUsd)}
            </p>
            <p className="text-xs text-muted-foreground">{formatUsdWithKes(product.priceUsd)}</p>
            <CheckoutForm
              productType="excel_module"
              productId={product.id}
              amountUsd={product.priceUsd}
              label={`Buy with Paystack — ${formatUsd(product.priceUsd)}`}
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              After payment you are redirected to the portal downloads tab. Workbooks are
              educational models, not investment advice.
            </p>
          </div>
        </div>
      </article>

      {others.length > 0 ? (
        <section className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Related products
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {others.map((p) => (
              <Link
                key={p.id}
                to="/store/$slug"
                params={{ slug: p.slug }}
                className="rounded-lg border border-border/60 bg-card/30 p-4 hover:border-gold/40 transition"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-gold">
                  {formatUsd(p.priceUsd)}
                </p>
                <p className="text-sm font-medium mt-1">{p.shortTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
