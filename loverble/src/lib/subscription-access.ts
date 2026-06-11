export type SubscriptionTier = "free" | "research-pro" | "live-retail" | "live-institutional";

export type StoredSubscription = {
  tier: SubscriptionTier;
  email?: string;
  reference: string;
  amountUsd?: number;
  purchasedAt: string;
  expiresAt: string;
};

const STORAGE_KEY = "capital_subscription";

const TIER_RANK: Record<SubscriptionTier | "quant-pro", number> = {
  free: 0,
  "research-pro": 1,
  "live-retail": 2,
  "live-institutional": 3,
  "quant-pro": 2,
};

export function saveSubscriptionFromPayment(input: {
  product_id?: string;
  email?: string;
  reference: string;
  amount_usd?: number;
}) {
  if (typeof window === "undefined") return;
  const productId = input.product_id || "";
  const tier: SubscriptionTier | null =
    productId === "live-institutional"
      ? "live-institutional"
      : productId === "live-retail" || productId === "quant-pro"
        ? "live-retail"
        : productId === "research-pro"
          ? "research-pro"
          : null;
  if (!tier) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const record: StoredSubscription = {
    tier,
    email: input.email,
    reference: input.reference,
    amountUsd: input.amount_usd,
    purchasedAt: new Date().toISOString(),
    expiresAt: expires.toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getStoredSubscription(): StoredSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSubscription;
    if (!parsed.expiresAt || new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredSubscription() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeTierInput(value?: string | null): SubscriptionTier | null {
  if (!value) return null;
  if (value === "live-institutional" || value === "live_institutional") return "live-institutional";
  if (value === "live-retail" || value === "live_retail") return "live-retail";
  if (value === "quant-pro" || value === "quant_pro") return "live-retail";
  if (value === "research-pro" || value === "research_pro" || value === "active") return "research-pro";
  if (value === "free") return "free";
  return null;
}

export function mergeTiers(...candidates: (SubscriptionTier | string | null | undefined)[]): SubscriptionTier {
  let best: SubscriptionTier = "free";
  for (const c of candidates) {
    const t = typeof c === "string" ? normalizeTierInput(c) : c;
    if (t && TIER_RANK[t] > TIER_RANK[best]) best = t;
  }
  return best;
}

export function resolveTier(profileStatus?: string | null, remoteTier?: string | null): SubscriptionTier {
  const stored = getStoredSubscription();
  return mergeTiers(stored?.tier, remoteTier, normalizeTierInput(profileStatus));
}

export function hasTierAccess(
  current: SubscriptionTier,
  required: "free" | "research-pro" | "live-retail" | "live-institutional",
): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function hasResearchAccess(tier: SubscriptionTier): boolean {
  return hasTierAccess(tier, "research-pro");
}

export function hasLiveAccess(tier: SubscriptionTier): boolean {
  return tier === "live-retail" || tier === "live-institutional";
}

export function tierLabel(tier: SubscriptionTier): string {
  if (tier === "live-institutional") return "Live Strategy — Institutional";
  if (tier === "live-retail") return "Live Strategy — Retail";
  if (tier === "research-pro") return "Research Full Access";
  return "Free";
}
