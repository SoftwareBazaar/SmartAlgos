import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { ProductVisual } from "@/components/store/product-visual";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  excelProductJsonLd,
  getExcelModuleProduct,
  listExcelStoreProducts,
} from "@/lib/excel-module-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatUsd, formatUsdWithKes } from "@/lib/pricing";

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

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pt-16 md:pt-20 pb-16 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Store
        </Link>
        <StoreCartButton />
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8 md:gap-10 items-start">
        <ProductVisual product={product} className="max-w-[240px] mx-auto md:mx-0" />

        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Excel workbook</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              {product.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[65ch]">
              {product.description}
            </p>
            <p className="font-mono text-xs text-gold/90 border border-border/50 rounded px-3 py-1.5 inline-block">
              {product.filename}
            </p>
          </div>

          <ul className="space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-border/60 bg-card/30 p-5 space-y-3 max-w-md">
            <p className="font-display text-3xl font-semibold text-foreground">
              {formatUsd(product.priceUsd)}
            </p>
            <p className="text-xs text-muted-foreground">{formatUsdWithKes(product.priceUsd)}</p>
            <button
              type="button"
              onClick={() => addItem(product.id)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
            </button>
            <CheckoutForm
              productType="excel_module"
              productId={product.id}
              amountUsd={product.priceUsd}
              label={`Buy now — ${formatUsd(product.priceUsd)}`}
            />
          </div>
        </div>
      </div>

      {others.length > 0 ? (
        <section className="space-y-3 pt-4 border-t border-border/50">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            You may also like
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((p) => (
              <Link
                key={p.id}
                to="/store/$slug"
                params={{ slug: p.slug }}
                className="rounded-lg border border-border/60 bg-card/20 p-4 hover:border-gold/40 transition flex gap-3"
              >
                <ProductVisual product={p} className="max-w-[72px] shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-gold">
                    {formatUsd(p.priceUsd)}
                  </p>
                  <p className="text-sm font-medium mt-1">{p.shortTitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
