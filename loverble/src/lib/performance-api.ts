import type { Strategy } from "@/lib/mock-data";

export type PerformanceStrategy = {
  slug: string;
  name: string;
  status: string;
  platform: string;
  verificationUrl: string;
  hasDirectLink: boolean;
  metrics?: {
    sharpe?: number;
    maxDrawdown?: number;
    winRate?: number;
  };
};

export type PerformancePayload = {
  source: "configured" | "live";
  illustrative: boolean;
  updatedAt: string;
  metrics: {
    avgMonthlyReturn: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    sharpe: number;
    sortino: number;
    recoveryDays: number;
  };
  monthlyReturns: { month: string; return: number }[];
  strategies: PerformanceStrategy[];
  verificationSources: { name: string; url: string; status: string }[];
};

function apiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (import.meta.env.PROD && typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
}

export async function fetchCapitalPerformance(): Promise<PerformancePayload> {
  const res = await fetch(`${apiBase()}/api/payments/capital/performance`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to load performance");
  return data.performance as PerformancePayload;
}
