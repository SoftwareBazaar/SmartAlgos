import {
  fetchPaystackConfig,
  initializeCapitalPayment,
  verifyCapitalPayment,
  type CapitalProductType,
  type InitializePaymentInput,
} from "./payments-api";

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
  amount: number;
  currency?: "NGN" | "USD" | "GHS" | "ZAR" | "KES";
  ref?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: { reference: string }) => void;
  onClose?: () => void;
};

let loaderPromise: Promise<void> | null = null;
let cachedPublicKey: string | null = null;

export async function getPaystackPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;
  const envKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (envKey) {
    cachedPublicKey = envKey;
    return envKey;
  }
  const config = await fetchPaystackConfig();
  cachedPublicKey = config.publicKey;
  if (!cachedPublicKey) throw new Error("Paystack public key not configured on server");
  return cachedPublicKey;
}

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

/** Legacy direct Paystack call — prefer checkoutCapitalPayment */
export async function payWithPaystack(opts: Omit<PaystackSetupOptions, "key">) {
  const key = await getPaystackPublicKey();
  await loadPaystack();
  if (!window.PaystackPop) throw new Error("Paystack not available");
  window.PaystackPop.setup({ key, currency: "KES", ...opts }).openIframe();
}

/** Initialize via backend, then redirect to Paystack hosted checkout (reliable in modals). */
export async function checkoutCapitalPayment(
  input: InitializePaymentInput,
  callbacks?: {
    onSuccess?: (reference: string) => void;
    onClose?: () => void;
    onBeforeRedirect?: () => void;
  },
) {
  const payment = await initializeCapitalPayment(input);

  // Hosted checkout avoids Paystack inline iframe hiding behind dialog overlays.
  if (payment.authorization_url) {
    callbacks?.onBeforeRedirect?.();
    window.location.assign(payment.authorization_url);
    return;
  }

  const publicKey = payment.publicKey || (await getPaystackPublicKey());
  await loadPaystack();
  if (!window.PaystackPop) throw new Error("Paystack not available");

  return new Promise<void>((resolve, reject) => {
    let completed = false;
    const handler = window.PaystackPop!.setup({
      key: publicKey,
      email: input.email,
      amount: payment.amount_kobo,
      currency: "KES",
      ref: payment.reference,
      metadata: { product_type: input.product_type, product_id: input.product_id, ...input.metadata },
      callback: async (response) => {
        completed = true;
        try {
          await verifyCapitalPayment(response.reference);
          callbacks?.onSuccess?.(response.reference);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      onClose: () => {
        callbacks?.onClose?.();
        if (!completed) reject(new Error("Payment window closed"));
      },
    });
    handler.openIframe();
  });
}

export type { CapitalProductType };
