function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
}

const API_BASE = resolveApiBase();

export type PortalAllocation = {
  id: string;
  prop_firm_name: string;
  account_number: string;
  allocated_strategy: string;
  status: string;
  allocated_equity: number | null;
  current_equity: number | null;
  pnl: number | null;
  max_dd_limit: number | null;
  current_dd: number | null;
  created_at: string;
};

export type PortalDownload = {
  id: string;
  strategyId: string;
  title: string;
  filename: string;
  reference: string;
  date: string;
  amountPaid: number;
};

export type PortalBacktest = {
  id: string;
  asset_class: string;
  strategy_name: string;
  lookback_period: string;
  metrics: { cagr?: string; sharpe?: string; maxDrawdown?: string; winRate?: string };
  created_at: string;
};

export type PortalCatalogItem = {
  id: string;
  title: string;
  filename: string;
  summary: string;
};

export type PortalOverview = {
  profile: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: string | null;
  };
  allocations: PortalAllocation[];
  downloads: PortalDownload[];
  backtests: PortalBacktest[];
  catalog: PortalCatalogItem[];
};

async function authHeaders(): Promise<HeadersInit> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPortalOverview(): Promise<PortalOverview> {
  const res = await fetch(`${API_BASE}/api/portal/overview`, { headers: await authHeaders() });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to load portal");
  return data as PortalOverview;
}

export async function runSandboxBacktest(input: {
  email?: string;
  assetClass: string;
  lookbackPeriod: string;
}) {
  const res = await fetch(`${API_BASE}/api/backtest/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Backtest failed");
  return data as {
    success: true;
    metrics: { cagr: string; sharpe: string; maxDrawdown: string; winRate: string };
    emailed: boolean;
    illustrative: boolean;
  };
}

export function strategyDownloadUrl(reference: string) {
  return `${API_BASE}/api/portal/downloads?ref=${encodeURIComponent(reference)}`;
}
