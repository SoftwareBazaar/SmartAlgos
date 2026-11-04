import { STORE_PRODUCTS } from "@/data/products";
import {
  EXCEL_MODULE_PRODUCTS,
  getExcelModuleProduct,
  type ExcelModuleProduct,
} from "@/lib/excel-module-catalog";

export type StoreCategory =
  | "all"
  | "excel-models"
  | "trading-tools"
  | "research-packs"
  | "finance-systems"
  | "free";

export type StoreLevel = "beginner" | "intermediate" | "advanced";
export type StorePlatform = "excel" | "python" | "mt5" | "quantconnect";
export type StoreFormat = "workbook" | "pdf" | "code";
export type StoreSort = "featured" | "price-asc" | "price-desc" | "newest";

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: Exclude<StoreCategory, "all">;
  level: StoreLevel;
  platform: StorePlatform[];
  format: StoreFormat[];
  price: number;
  badge: string;
  meta: string;
  image: string;
  gallery: string[];
  createdAt: string;
  featured: boolean;
  cartProductId: string | null;
  isBundle: boolean;
  isFree: boolean;
  freeHref?: string;
};

export const CATEGORY_TABS: { id: StoreCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "excel-models", label: "Excel models" },
  { id: "trading-tools", label: "Trading tools" },
  { id: "research-packs", label: "Research packs" },
  { id: "finance-systems", label: "Finance systems" },
  { id: "free", label: "Free" },
];

export const LEVEL_OPTIONS: { id: StoreLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const PLATFORM_OPTIONS: { id: StorePlatform; label: string }[] = [
  { id: "excel", label: "Excel" },
  { id: "python", label: "Python" },
  { id: "mt5", label: "MT5" },
  { id: "quantconnect", label: "QuantConnect" },
];

export const FORMAT_OPTIONS: { id: StoreFormat; label: string }[] = [
  { id: "workbook", label: "Workbook" },
  { id: "pdf", label: "PDF guide" },
  { id: "code", label: "Code" },
];

export const PRICE_BUCKETS = [
  { id: "free", label: "Free", test: (p: number) => p === 0 },
  { id: "under30", label: "Under $30", test: (p: number) => p > 0 && p < 30 },
  { id: "30to60", label: "$30–60", test: (p: number) => p >= 30 && p <= 60 },
  { id: "60plus", label: "$60+", test: (p: number) => p > 60 },
] as const;

export type PriceBucketId = (typeof PRICE_BUCKETS)[number]["id"];

export type StoreFilters = {
  q: string;
  category: StoreCategory;
  levels: StoreLevel[];
  platforms: StorePlatform[];
  formats: StoreFormat[];
  prices: PriceBucketId[];
  sort: StoreSort;
};

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  q: "",
  category: "all",
  levels: [],
  platforms: [],
  formats: [],
  prices: [],
  sort: "featured",
};

export function listCatalogProducts(): CatalogProduct[] {
  return STORE_PRODUCTS as unknown as CatalogProduct[];
}

export function getCatalogProduct(slug: string): CatalogProduct | undefined {
  return listCatalogProducts().find((p) => p.slug === slug || p.id === slug);
}

export function getMasterBundle(): ExcelModuleProduct {
  return EXCEL_MODULE_PRODUCTS.find((p) => p.isBundle)!;
}

export function resolveCartExcelProduct(product: CatalogProduct): ExcelModuleProduct | undefined {
  if (!product.cartProductId) return undefined;
  return getExcelModuleProduct(product.cartProductId);
}

export function filterCatalogProducts(products: CatalogProduct[], f: StoreFilters): CatalogProduct[] {
  let list = products.filter((p) => !p.isBundle);

  if (f.category !== "all") {
    list = list.filter((p) => p.category === f.category);
  }
  if (f.levels.length) {
    list = list.filter((p) => f.levels.includes(p.level));
  }
  if (f.platforms.length) {
    list = list.filter((p) => p.platform.some((x) => f.platforms.includes(x)));
  }
  if (f.formats.length) {
    list = list.filter((p) => p.format.some((x) => f.formats.includes(x)));
  }
  if (f.prices.length) {
    list = list.filter((p) =>
      f.prices.some((id) => PRICE_BUCKETS.find((b) => b.id === id)?.test(p.price)),
    );
  }
  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.meta.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q),
    );
  }

  const sorted = [...list];
  if (f.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (f.sort === "newest")
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else
    sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));

  return sorted;
}

/** URL search shape — all optional so `<Link to="/store">` stays valid. */
export type StoreSearchParams = {
  q?: string;
  category?: StoreCategory;
  level?: string;
  platform?: string;
  format?: string;
  price?: string;
  sort?: StoreSort;
};

export function parseStoreSearch(search: Record<string, unknown>): StoreSearchParams {
  const str = (v: unknown) => (typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "");
  const category = str(search.category) as StoreCategory;
  const sort = str(search.sort) as StoreSort;

  return {
    q: str(search.q) || undefined,
    category: CATEGORY_TABS.some((c) => c.id === category) ? category : undefined,
    level: str(search.level) || undefined,
    platform: str(search.platform) || undefined,
    format: str(search.format) || undefined,
    price: str(search.price) || undefined,
    sort: (["featured", "price-asc", "price-desc", "newest"] as StoreSort[]).includes(sort)
      ? sort
      : undefined,
  };
}

export function searchToFilters(search: StoreSearchParams): StoreFilters {
  const list = (v?: string): string[] =>
    v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return {
    q: search.q ?? "",
    category: search.category ?? "all",
    levels: list(search.level).filter((x): x is StoreLevel => LEVEL_OPTIONS.some((o) => o.id === x)),
    platforms: list(search.platform).filter((x): x is StorePlatform =>
      PLATFORM_OPTIONS.some((o) => o.id === x),
    ),
    formats: list(search.format).filter((x): x is StoreFormat =>
      FORMAT_OPTIONS.some((o) => o.id === x),
    ),
    prices: list(search.price).filter((x): x is PriceBucketId =>
      PRICE_BUCKETS.some((o) => o.id === x),
    ),
    sort: search.sort ?? "featured",
  };
}

export function storeSearchToParams(f: StoreFilters): StoreSearchParams {
  return {
    q: f.q || undefined,
    category: f.category !== "all" ? f.category : undefined,
    level: f.levels.length ? f.levels.join(",") : undefined,
    platform: f.platforms.length ? f.platforms.join(",") : undefined,
    format: f.formats.length ? f.formats.join(",") : undefined,
    price: f.prices.length ? f.prices.join(",") : undefined,
    sort: f.sort !== "featured" ? f.sort : undefined,
  };
}

export function countActiveFilters(f: StoreFilters): number {
  return (
    (f.category !== "all" ? 1 : 0) +
    f.levels.length +
    f.platforms.length +
    f.formats.length +
    f.prices.length +
    (f.q ? 1 : 0)
  );
}
