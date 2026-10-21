import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { ProductVisual } from "@/components/store/product-visual";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  STORE_FAQ,
  bundleSavingsUsd,
  excelProductJsonLd,
  getExcelModuleProduct,
  listExcelModulesOnly,
  listExcelStoreProducts,
} from "@/lib/excel-module-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatUsd } from "@/lib/pricing";

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
          property: "og:image",
          content: "https://www.smartalgosts.com/og/store-excel-suite.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: product.title },
        { name: "twitter:description", content: product.summary },
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
  component: StoreProductRoute,
});

function StoreProductRoute() {
  return (
    <StoreCartProvider>
      <StoreProductPage />
      <StoreCartDrawer />
    </StoreCartProvider>
  );
}

function StoreProductPage() {
  const product = Route.useLoaderData();
  const { addItem } = useStoreCart();
  const others = listExcelStoreProducts().filter((p) => p.id !== product.id).slice(0, 3);
  const bundle = listExcelStoreProducts().find((p) => p.isBundle)!;
  const modulesLeft = listExcelModulesOnly().filter((m) => m.id !== product.id).length;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pt-16 md:pt-20 pb-16 space-y-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Store
        </Link>
        <StoreCartButton />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">
        <div className="space-y-4">
          <ProductVisual product={product} variant="hero" />
          <div className="grid grid-cols-2 gap-3">
            <ProductVisual product={product} variant="gallery" />
            <ProductVisual product={bundle} variant="gallery" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded border border-border/70 px-2 py-0.5 uppercase tracking-wider">
                {product.level}
              </span>
              <span>
                {product.sheetCount} sheets · {product.chartCount} charts · {product.approxSizeMb}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              {product.title}
            </h1>
            <p className="text-base text-foreground/85 leading-relaxed">{product.description}</p>
          </div>

          <ul className="space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-foreground/85">
                <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-gold/30 bg-secondary-surface/60 p-5 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl font-semibold text-gold leading-none">
                {formatUsd(product.priceUsd)}
              </p>
              {product.isBundle ? (
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">{formatUsd(product.listValueUsd)}</span>
                  {" · "}
                  Save {formatUsd(bundleSavingsUsd(product))}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => addItem(product.id)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to cart · {formatUsd(product.priceUsd)}
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant delivery after Paystack: receipt email + unlock in{" "}
              <Link to="/portal" className="text-gold hover:underline">
                My downloads
              </Link>
              . Paystack collects your email at checkout. 14-day open-file guarantee.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Educational model — not personalized financial advice.
            </p>
          </div>

          {!product.isBundle ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-border/50 px-3 py-2">
              Want everything? Add the other {modulesLeft} modules via the{" "}
              <button
                type="button"
                onClick={() => addItem(bundle.id)}
                className="text-gold hover:underline"
              >
                Master Bundle ({formatUsd(bundle.priceUsd)})
              </button>{" "}
              and save vs buying separately.
            </p>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Compatibility & delivery</h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          {[
            "Microsoft Excel 365 / 2021 / 2019 · Windows & Mac",
            "No VBA macros — every formula is inspectable",
            "Manual data inputs (no live market feed)",
          ].map((t) => (
            <div key={t} className="rounded-lg border border-border/60 bg-card/20 px-3 py-3 text-muted-foreground">
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">FAQ</h2>
        {STORE_FAQ.slice(0, 5).map((item) => (
          <details key={item.q} className="rounded-lg border border-border/60 bg-card/20 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold">{item.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </details>
        ))}
      </section>

      {others.length > 0 ? (
        <section className="space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            You may also like
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((p) => (
              <Link
                key={p.id}
                to="/store/$slug"
                params={{ slug: p.slug }}
                className="rounded-lg border border-border/60 bg-card/20 p-4 hover:border-gold/40 transition space-y-2"
              >
                <ProductVisual product={p} className="max-w-full" />
                <p className="text-gold font-semibold">{formatUsd(p.priceUsd)}</p>
                <p className="text-sm font-medium">{p.shortTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
