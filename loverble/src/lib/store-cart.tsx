import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getExcelModuleProduct, type ExcelModuleProduct } from "@/lib/excel-module-catalog";

const STORAGE_KEY = "smartalgo_excel_cart_v1";

export type CartLine = {
  productId: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  items: Array<CartLine & { product: ExcelModuleProduct }>;
  count: number;
  subtotalUsd: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l.productId && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadLines());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const addItem = useCallback((productId: string) => {
    const product = getExcelModuleProduct(productId);
    if (!product) return;
    setLines((prev) => {
      if (product.isBundle) {
        return [{ productId: product.id, qty: 1 }];
      }
      const withoutBundle = prev.filter((l) => {
        const p = getExcelModuleProduct(l.productId);
        return p && !p.isBundle;
      });
      if (withoutBundle.some((l) => l.productId === productId)) return withoutBundle;
      return [...withoutBundle, { productId, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const items = useMemo(
    () =>
      lines
        .map((l) => {
          const product = getExcelModuleProduct(l.productId);
          return product ? { ...l, product } : null;
        })
        .filter(Boolean) as Array<CartLine & { product: ExcelModuleProduct }>,
    [lines],
  );

  const count = items.reduce((n, l) => n + l.qty, 0);
  const subtotalUsd = items.reduce((n, l) => n + l.product.priceUsd * l.qty, 0);

  const value = useMemo(
    () => ({
      lines,
      items,
      count,
      subtotalUsd,
      open,
      setOpen,
      addItem,
      removeItem,
      clear,
    }),
    [lines, items, count, subtotalUsd, open, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useStoreCart must be used within StoreCartProvider");
  return ctx;
}

/** Checkout target: prefer master bundle if cart covers all modules or includes bundle. */
export function resolveCartCheckout(items: Array<{ product: ExcelModuleProduct }>): {
  productId: string;
  amountUsd: number;
  label: string;
} | null {
  if (items.length === 0) return null;
  const bundle = items.find((i) => i.product.isBundle);
  if (bundle) {
    return {
      productId: bundle.product.id,
      amountUsd: bundle.product.priceUsd,
      label: `Pay for ${bundle.product.shortTitle}`,
    };
  }
  if (items.length === 1) {
    const p = items[0].product;
    return {
      productId: p.id,
      amountUsd: p.priceUsd,
      label: `Pay for ${p.shortTitle}`,
    };
  }
  // Multiple modules — charge sum using first product id + metadata handled at checkout UI
  // Prefer converting to bundle if all four modules selected
  const ids = new Set(items.map((i) => i.product.id));
  const allModules =
    ids.has("portfolio-monte-carlo-risk-suite") &&
    ids.has("multi-leg-options-greeks-visualizer") &&
    ids.has("fixed-income-yield-curve-duration") &&
    ids.has("multi-factor-quant-stock-selector");
  if (allModules) {
    return {
      productId: "quantitative-finance-master-bundle",
      amountUsd: 129,
      label: "Pay for Master Bundle (cart upgrade)",
    };
  }
  // Mixed carts must checkout one SKU at a time (Paystack unlock is per product).
  return null;
}
