export type SubscriptionTier = "free" | "research-pro" | "quant-pro";

export type StoredSubscription = {
  tier: SubscriptionTier;
  email?: string;
  reference: string;
  amountUsd?: number;
  purchasedAt: string;
  expiresAt: string;
};

const STORAGE_KEY = "capital_subscription";

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  "research-pro": 1,
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
    productId === "quant-pro" ? "quant-pro" : productId === "research-pro" ? "research-pro" : null;
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

export function resolveTier(profileStatus?: string | null): SubscriptionTier {
  const stored = getStoredSubscription();
  if (stored?.tier) return stored.tier;
  if (profileStatus === "quant-pro" || profileStatus === "quant_pro") return "quant-pro";
  if (profileStatus === "active" || profileStatus === "research-pro" || profileStatus === "research_pro") {
    return "research-pro";
  }
  return "free";
}

export function hasTierAccess(current: SubscriptionTier, required: "free" | "research-pro" | "quant-pro"): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function tierLabel(tier: SubscriptionTier): string {
  if (tier === "quant-pro") return "Quant Pro";
  if (tier === "research-pro") return "Research Pro";
  return "Free";
}
