import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { ProductShotCarousel, ProductVisual } from "@/components/store/product-visual";
import { StickyMobileCart } from "@/components/store/sticky-mobile-cart";
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
import { formatUsd, formatKes, usdToKes } from "@/lib/pricing";

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
          content: `https://www.smartalgosts.com${product.coverImage}`,
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "627" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `https://www.smartalgosts.com${product.coverImage}` },
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
      <StickyMobileCart />
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
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-16 md:pt-20 pb-28 md:pb-16 text-[15px]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Store
        </Link>
        <StoreCartButton />
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
        <div>
          {product.isBundle ? (
            <ProductVisual product={product} variant="hero" showCaption={false} />
          ) : (
            <ProductShotCarousel
              images={product.shots.map((s) => s.src)}
              captions={product.shots.map((s) => s.caption)}
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-20 space-y-4 rounded-xl border border-gold/30 bg-secondary-surface/60 p-5">
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded border border-border/70 px-2 py-0.5 uppercase tracking-wider">
              {product.level}
            </span>
            <span>
              {product.sheetCount} sheets · {product.chartCount} charts · {product.approxSizeMb}
            </span>
          </div>
          <h1 className="font-display text-[clamp(22px,2.5vw,32px)] font-semibold leading-snug">
            {product.title}
          </h1>
          <p className="text-[14px] text-foreground/85 leading-relaxed">{product.promise}</p>
          <div className="flex flex-wrap items-end gap-2">
            <p className="font-display text-3xl font-semibold text-gold leading-none tabular-nums">
              {formatUsd(product.priceUsd)}
            </p>
            <p className="text-[12px] text-muted-foreground">≈ {formatKes(usdToKes(product.priceUsd))}</p>
            {product.isBundle ? (
              <p className="text-[13px] text-muted-foreground w-full">
                <span className="line-through">{formatUsd(product.listValueUsd)}</span>
                {" · "}
                Save {formatUsd(bundleSavingsUsd(product))}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
          </button>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Paystack checkout · unlock in{" "}
            <Link to="/portal" className="text-gold hover:underline">
              My downloads
            </Link>
            . 14-day open-file guarantee.
          </p>
          {!product.isBundle ? (
            <p className="text-[12px] text-muted-foreground rounded-lg border border-border/50 px-3 py-2">
              Bundle the other {modulesLeft} modules:{" "}
              <button type="button" onClick={() => addItem(bundle.id)} className="text-gold hover:underline">
                Master Bundle ({formatUsd(bundle.priceUsd)})
              </button>
            </p>
          ) : null}
        </aside>
      </div>

      <div className="mt-10 space-y-3">
        <div className="flex gap-1 border-b border-border/50">
          {(["overview", "inside", "faq"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                document.getElementById(`tab-${tab}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-gold capitalize"
            >
              {tab === "inside" ? "What’s inside" : tab}
            </button>
          ))}
        </div>

        <section id="tab-overview" className="space-y-2 pt-2">
          <h2 className="font-display text-[18px] font-semibold">Overview</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[70ch]">{product.description}</p>
          <ul className="space-y-1.5 pt-1">
            {product.features.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] text-foreground/85">
                <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section id="tab-inside" className="space-y-2 pt-4">
          <h2 className="font-display text-[18px] font-semibold">What’s inside</h2>
          <div className="grid sm:grid-cols-3 gap-2 text-[13px]">
            {[
              `${product.sheetCount} sheets`,
              `${product.chartCount} charts`,
              product.approxSizeMb,
              "Excel 365 / 2021 / 2019",
              "Windows & Mac",
              "No VBA macros",
            ].map((t) => (
              <div key={t} className="rounded-lg border border-border/60 bg-card/20 px-3 py-2.5 text-muted-foreground">
                {t}
              </div>
            ))}
          </div>
        </section>

        <section id="tab-faq" className="space-y-2 pt-4">
          <h2 className="font-display text-[18px] font-semibold">FAQ</h2>
          {STORE_FAQ.slice(0, 5).map((item) => (
            <details key={item.q} className="rounded-lg border border-border/60 bg-card/20 px-3 py-2">
              <summary className="cursor-pointer text-[13px] font-semibold">{item.q}</summary>
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </section>
      </div>

      {others.length > 0 ? (
        <section className="mt-10 space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            You may also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {others.map((p) => (
              <Link
                key={p.id}
                to="/store/$slug"
                params={{ slug: p.slug }}
                className="rounded-lg border border-border/60 bg-card/20 p-2.5 hover:border-gold/40 transition space-y-1.5"
              >
                <ProductVisual product={p} variant="thumb" showCaption={false} className="max-w-full" />
                <p className="text-gold text-[14px] font-semibold">{formatUsd(p.priceUsd)}</p>
                <p className="text-[13px] font-medium line-clamp-2">{p.shortTitle}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
