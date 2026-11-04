import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { FreeSampleGate } from "@/components/store/free-sample-gate";
import { ProductImage } from "@/components/store/product-image";
import { StickyMobileCart } from "@/components/store/sticky-mobile-cart";
import { StoreCartButton, StoreCartDrawer } from "@/components/store/store-cart-drawer";
import {
  STORE_FAQ,
  STORE_GUARANTEE,
  bundleSavingsUsd,
} from "@/lib/excel-module-catalog";
import {
  CATEGORY_TABS,
  FORMAT_OPTIONS,
  LEVEL_OPTIONS,
  PLATFORM_OPTIONS,
  PRICE_BUCKETS,
  countActiveFilters,
  filterCatalogProducts,
  getMasterBundle,
  listCatalogProducts,
  parseStoreSearch,
  searchToFilters,
  storeSearchToParams,
  type CatalogProduct,
  type PriceBucketId,
  type StoreFilters,
  type StoreFormat,
  type StoreLevel,
  type StorePlatform,
  type StoreSearchParams,
  type StoreSort,
} from "@/lib/store-catalog";
import { StoreCartProvider, useStoreCart } from "@/lib/store-cart";
import { formatKes, formatUsd, usdToKes } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const bundle = getMasterBundle();
const save = bundleSavingsUsd(bundle);
const savePct = Math.round((save / bundle.listValueUsd) * 100);

export const Route = createFileRoute("/store")({
  validateSearch: (search: Record<string, unknown>): StoreSearchParams => parseStoreSearch(search),
  head: () => ({
    meta: [
      { title: "Store — Smart Algos" },
      {
        name: "description",
        content:
          "Excel quant models, trading tools, and free samples. Transparent workbooks with instant Paystack delivery.",
      },
      { property: "og:title", content: "Store — Smart Algos" },
      {
        property: "og:description",
        content: "Browse Excel models and more. Master Bundle $129. Free Black-Scholes sample.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/store" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://www.smartalgosts.com/media/store/covers/bundle.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "627" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.smartalgosts.com/media/store/covers/bundle.jpg" },
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
      <StickyMobileCart />
    </StoreCartProvider>
  );
}

function toggleIn<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function StorePage() {
  const search = Route.useSearch();
  const filters = useMemo(() => searchToFilters(search), [search]);
  const navigate = Route.useNavigate();
  const { addItem } = useStoreCart();
  const [mobileFilters, setMobileFilters] = useState(false);
  const all = useMemo(() => listCatalogProducts(), []);

  const setFilters = (next: Partial<StoreFilters>) => {
    const merged = { ...filters, ...next };
    void navigate({
      to: "/store",
      search: storeSearchToParams(merged),
      replace: true,
    });
  };

  const clearAll = () => {
    void navigate({ to: "/store", search: {}, replace: true });
  };

  const results = useMemo(() => filterCatalogProducts(all, filters), [all, filters]);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-16 md:pt-20 pb-28 md:pb-16 text-[15px] leading-relaxed">
      {/* Slim header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Store</p>
          <h1
            className="font-display font-semibold text-foreground tracking-tight"
            style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
          >
            Product catalog
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground max-w-[52ch]">
            Transparent Excel models and tools — audit every cell. Instant delivery after Paystack.
          </p>
        </div>
        <StoreCartButton />
      </header>

      {/* Search + sort */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search products…"
            className="w-full rounded-md border border-border/70 bg-card/30 py-2 pl-8 pr-3 text-[13px] focus:outline-none focus:border-gold/50"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-2 text-[12px] text-muted-foreground lg:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 ? (
              <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/30 px-2.5 py-2 text-[12px] text-muted-foreground">
            Sort
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value as StoreSort })}
              className="bg-transparent text-foreground focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-border/50 pb-px">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilters({ category: tab.id })}
            className={cn(
              "shrink-0 px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors",
              filters.category === tab.id
                ? "border-gold text-gold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bundle banner */}
      <section className="mt-5 overflow-hidden rounded-xl border border-gold/35 bg-[#0d121c]">
        <div className="grid md:grid-cols-[200px_1fr] gap-0">
          <div className="relative hidden md:block min-h-[140px]">
            <img
              src="/media/store/covers/bundle.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 p-4 md:p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Best value · Bundle</p>
              <h2 className="font-display text-[18px] font-semibold leading-snug">Master Bundle — all 4 Excel workbooks</h2>
              <p className="text-[13px] text-muted-foreground">
                <span className="line-through">{formatUsd(bundle.listValueUsd)}</span>
                {" → "}
                <span className="text-gold font-semibold">{formatUsd(bundle.priceUsd)}</span>
                {" · "}
                Save {formatUsd(save)} ({savePct}%) · ≈ {formatKes(usdToKes(bundle.priceUsd))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => addItem(bundle.id)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add bundle
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Desktop filters */}
        <aside className="hidden lg:block sticky top-20 space-y-5 rounded-xl border border-border/60 bg-card/15 p-4">
          <FilterPanel filters={filters} setFilters={setFilters} />
          {activeCount > 0 ? (
            <button type="button" onClick={clearAll} className="text-[12px] text-gold hover:underline">
              Clear all
            </button>
          ) : null}
        </aside>

        <div className="min-w-0 space-y-4">
          {/* Chips + count */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] text-muted-foreground mr-1">
              {results.length} product{results.length === 1 ? "" : "s"}
            </p>
            {filters.levels.map((id) => (
              <Chip
                key={id}
                label={LEVEL_OPTIONS.find((o) => o.id === id)?.label ?? id}
                onRemove={() => setFilters({ levels: filters.levels.filter((x) => x !== id) })}
              />
            ))}
            {filters.platforms.map((id) => (
              <Chip
                key={id}
                label={PLATFORM_OPTIONS.find((o) => o.id === id)?.label ?? id}
                onRemove={() => setFilters({ platforms: filters.platforms.filter((x) => x !== id) })}
              />
            ))}
            {filters.formats.map((id) => (
              <Chip
                key={id}
                label={FORMAT_OPTIONS.find((o) => o.id === id)?.label ?? id}
                onRemove={() => setFilters({ formats: filters.formats.filter((x) => x !== id) })}
              />
            ))}
            {filters.prices.map((id) => (
              <Chip
                key={id}
                label={PRICE_BUCKETS.find((o) => o.id === id)?.label ?? id}
                onRemove={() => setFilters({ prices: filters.prices.filter((x) => x !== id) })}
              />
            ))}
            {filters.q ? (
              <Chip label={`“${filters.q}”`} onRemove={() => setFilters({ q: "" })} />
            ) : null}
            {activeCount > 0 ? (
              <button type="button" onClick={clearAll} className="text-[11px] text-gold hover:underline">
                Clear all
              </button>
            ) : null}
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-12 text-center space-y-3">
              <Filter className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="text-[15px] text-foreground">No products match</p>
              <p className="text-[13px] text-muted-foreground">Try clearing filters or searching something else.</p>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex rounded-md border border-gold/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={() => p.cartProductId && addItem(p.cartProductId)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trust / FAQ compact */}
      <section className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold">14-day guarantee</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{STORE_GUARANTEE}</p>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-[18px] font-semibold">FAQ</h2>
          {STORE_FAQ.slice(0, 4).map((item) => (
            <details key={item.q} className="rounded-lg border border-border/60 bg-card/20 px-3 py-2">
              <summary className="cursor-pointer text-[13px] font-semibold">{item.q}</summary>
              <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="free-sample" className="mt-10">
        <FreeSampleGate />
      </section>

      {/* Mobile filter sheet */}
      {mobileFilters ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-border bg-[#0b0e14] p-4 pb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-[16px] font-semibold">Filters</p>
              <button type="button" onClick={() => setMobileFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 rounded-md border border-border py-2.5 text-[12px] text-muted-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="flex-1 rounded-md bg-primary py-2.5 text-[12px] font-semibold uppercase tracking-wider text-primary-foreground"
              >
                Show {results.length}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-gold/35 bg-gold/10 px-2.5 py-0.5 text-[11px] text-gold"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

function FilterPanel({
  filters,
  setFilters,
}: {
  filters: StoreFilters;
  setFilters: (next: Partial<StoreFilters>) => void;
}) {
  return (
    <div className="space-y-5 text-[13px]">
      <FilterGroup title="Level">
        {LEVEL_OPTIONS.map((o) => (
          <CheckRow
            key={o.id}
            label={o.label}
            checked={filters.levels.includes(o.id)}
            onChange={() => setFilters({ levels: toggleIn<StoreLevel>(filters.levels, o.id) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Platform">
        {PLATFORM_OPTIONS.map((o) => (
          <CheckRow
            key={o.id}
            label={o.label}
            checked={filters.platforms.includes(o.id)}
            onChange={() => setFilters({ platforms: toggleIn<StorePlatform>(filters.platforms, o.id) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Format">
        {FORMAT_OPTIONS.map((o) => (
          <CheckRow
            key={o.id}
            label={o.label}
            checked={filters.formats.includes(o.id)}
            onChange={() => setFilters({ formats: toggleIn<StoreFormat>(filters.formats, o.id) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BUCKETS.map((o) => (
          <CheckRow
            key={o.id}
            label={o.label}
            checked={filters.prices.includes(o.id)}
            onChange={() => setFilters({ prices: toggleIn<PriceBucketId>(filters.prices, o.id) })}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground/90">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-border accent-[var(--gold,#f59e0b)]"
      />
      {label}
    </label>
  );
}

function ProductCard({ product, onAdd }: { product: CatalogProduct; onAdd: () => void }) {
  const detail = product.isFree ? (
    <a href="#free-sample" className="hover:text-gold transition-colors">
      {product.title}
    </a>
  ) : (
    <Link to="/store/$slug" params={{ slug: product.slug }} className="hover:text-gold transition-colors">
      {product.title}
    </Link>
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/20 hover:border-gold/40 transition-colors">
      {product.isFree ? (
        <a href="#free-sample" className="block p-2 pb-0">
          <CardThumb product={product} />
        </a>
      ) : (
        <Link to="/store/$slug" params={{ slug: product.slug }} className="block p-2 pb-0">
          <CardThumb product={product} />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-1 p-2.5 pt-2">
        <h3 className="font-display text-[16px] font-semibold leading-snug line-clamp-2">{detail}</h3>
        <p className="text-[12px] text-muted-foreground line-clamp-1">{product.summary}</p>
        <p className="text-[11px] text-muted-foreground/80">{product.meta}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="font-display text-[16px] font-semibold text-gold tabular-nums">
            {product.isFree ? "Free" : formatUsd(product.price)}
          </p>
          {product.isFree ? (
            <a
              href="#free-sample"
              className="rounded-md border border-gold/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold opacity-90 group-hover:opacity-100 group-hover:bg-gold/10 transition"
            >
              Get
            </a>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="rounded-md border border-gold/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold opacity-80 group-hover:opacity-100 group-hover:bg-gold/10 transition"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CardThumb({ product }: { product: CatalogProduct }) {
  return (
    <div className="relative">
      <ProductImage src={product.image} alt={product.title} aspect="4/3" />
      <span
        className={cn(
          "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
          product.isFree
            ? "bg-emerald-500/90 text-white"
            : product.level === "advanced"
              ? "bg-gold text-primary-foreground"
              : "bg-sky-500/90 text-white",
        )}
      >
        {product.badge}
      </span>
    </div>
  );
}
