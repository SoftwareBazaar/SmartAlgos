// Paystack inline helper. Uses public key (safe to expose) and loads the
// Paystack inline script on demand. Falls back to a redirect URL if no key.

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: PaystackSetupOptions) => { openIframe: () => void };
    };
  }
}

export type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number; // in lowest currency unit (kobo / cents)
  currency?: "NGN" | "USD" | "GHS" | "ZAR" | "KES";
  ref?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: { reference: string }) => void;
  onClose?: () => void;
};

// Paystack PUBLIC key — safe to expose in client code.
// Replace with your live key when ready (starts with `pk_live_...`).
export const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

let loaderPromise: Promise<void> | null = null;

export function loadPaystack(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.PaystackPop) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export async function payWithPaystack(opts: Omit<PaystackSetupOptions, "key">) {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error(
      "Paystack public key missing. Set VITE_PAYSTACK_PUBLIC_KEY in your environment.",
    );
  }
  await loadPaystack();
  if (!window.PaystackPop) throw new Error("Paystack not available");
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    currency: "USD",
    ...opts,
  });
  handler.openIframe();
}
