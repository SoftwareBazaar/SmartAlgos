function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (import.meta.env.PROD && typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
}

const API_BASE = resolveApiBase();

export type CapitalProductType = "research_subscription" | "research_donation" | "consultation";

export type InitializePaymentInput = {
  email: string;
  product_type: CapitalProductType;
  product_id: string;
  amount_usd?: number;
  metadata?: Record<string, unknown>;
};

export type PaymentInitResult = {
  reference: string;
  amount_usd: number;
  amount_kobo: number;
  publicKey: string;
  currency: string;
  authorization_url?: string;
};

export async function fetchPaystackConfig() {
  const res = await fetch(`${API_BASE}/api/payments/capital/config`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to load Paystack config");
  return data as { publicKey: string; currency: string; kesRate: number };
}

export async function initializeCapitalPayment(input: InitializePaymentInput): Promise<PaymentInitResult> {
  const res = await fetch(`${API_BASE}/api/payments/capital/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Payment initialization failed");
  return data.payment;
}

export async function verifyCapitalPayment(reference: string) {
  const res = await fetch(`${API_BASE}/api/payments/capital/verify/${encodeURIComponent(reference)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Payment verification failed");
  return data;
}
