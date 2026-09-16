import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Download,
  FlaskConical,
  FolderDown,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Shield,
  Webhook,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand-logo";
import { BacktestEngineSection } from "@/components/backtest-engine-section";
import { CheckoutForm } from "@/components/checkout-form";
import { supabase } from "@/integrations/supabase/client";
import { STRATEGY_FILE_PRODUCTS } from "@/lib/strategy-catalog";
import { formatUsd, PRICING } from "@/lib/pricing";
import {
  fetchPortalOverview,
  strategyDownloadUrl,
  type PortalAllocation,
  type PortalDownload,
  type PortalOverview,
} from "@/lib/portal-api";
import { cn } from "@/lib/utils";

type TabId = "allocations" | "sandbox" | "downloads" | "api" | "settings";

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "allocations", label: "Prop Allocations", icon: BarChart3 },
  { id: "sandbox", label: "Backtest Sandbox", icon: FlaskConical },
  { id: "downloads", label: "Source Code Downloads", icon: FolderDown },
  { id: "api", label: "API & Webhooks", icon: Webhook },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const LAYOUT_PREVIEW: PortalAllocation[] = [
  {
    id: "preview-1",
    prop_firm_name: "FTMO $100k Challenge",
    account_number: "#482019",
    allocated_strategy: "EUR/USD Mean Reversion",
    current_equity: 104250,
    pnl: 4250,
    max_dd_limit: 5,
    current_dd: 1.2,
    allocated_equity: 100000,
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "preview-2",
    prop_firm_name: "FundedNext $50k",
    account_number: "#883102",
    allocated_strategy: "Gold Momentum",
    current_equity: 51800,
    pnl: 1800,
    max_dd_limit: 5,
    current_dd: 0.8,
    allocated_equity: 50000,
    status: "active",
    created_at: new Date().toISOString(),
  },
];

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toFixed(1)}%`;
}

function roleLabel(role: string) {
  if (role === "investor") return "Investor";
  if (role === "admin") return "Admin";
  return "Retail";
}

function parseTab(value: string | undefined): TabId {
  if (value === "sandbox" || value === "downloads" || value === "api" || value === "settings") return value;
  return "allocations";
}

export function ClientPortal({ initialTab, initialRef }: { initialTab?: string; initialRef?: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>(parseTab(initialTab));
  const [drawer, setDrawer] = useState(false);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.assign("/auth?redirect=/portal");
        return;
      }
      setBooting(false);
      setEmail(data.session.user.email ?? null);
      try {
        const payload = await fetchPortalOverview();
        if (!cancelled) setOverview(payload);
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message || "Could not load portal data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTab(parseTab(initialTab));
  }, [initialTab]);

  const allocations = overview?.allocations ?? [];
  const liveAllocations = allocations.length > 0;
  const rows = liveAllocations ? allocations : showPreview ? LAYOUT_PREVIEW : [];
  const totals = useMemo(() => {
    const allocated = rows.reduce((sum, row) => sum + Number(row.allocated_equity || 0), 0);
    const pnl = rows.reduce((sum, row) => sum + Number(row.pnl || 0), 0);
    const cushion = rows.length
      ? Math.max(
          0,
          rows.reduce((sum, row) => sum + Number(row.max_dd_limit || 5) - Number(row.current_dd || 0), 0) / rows.length,
        )
      : 0;
    return { allocated, pnl, cushion, count: rows.length };
  }, [rows]);

  function openTab(next: TabId) {
    setTab(next);
    setDrawer(false);
    navigate({ to: "/portal", search: { tab: next, ref: initialRef } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const profile = overview?.profile;
  const displayEmail = profile?.email || email || "signed in";

  if (booting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Opening portal…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {drawer && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close portal menu"
          onClick={() => setDrawer(false)}
        />
      )}

      <aside
        className={cn(
          "z-50 w-72 shrink-0 bg-secondary-surface border-r border-border p-6 flex flex-col justify-between",
          "fixed inset-y-0 left-0 transition-transform md:static md:translate-x-0",
          drawer ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <BrandLogo variant="sidebar" />
            </Link>
            <span className="text-[10px] bg-gold/20 text-gold font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Portal
            </span>
            <button type="button" className="md:hidden p-1 text-muted-foreground" onClick={() => setDrawer(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5 text-sm font-semibold">
            {TABS.map((item) => {
              const active = tab === item.id;
              const count = item.id === "allocations" ? allocations.length : item.id === "downloads" ? overview?.downloads.length : undefined;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer",
                    active ? "bg-gold text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground hover:bg-dominant",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {typeof count === "number" && (
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", active ? "bg-black/20" : "bg-dominant")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            <span className="text-foreground font-medium">Non-custodial API linked</span>
          </div>
          <div>
            Logged in as <span className="text-muted-foreground break-all">{displayEmail}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto min-w-0">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="md:hidden mt-1 p-2 rounded-lg border border-border"
              onClick={() => setDrawer(true)}
              aria-label="Open portal menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">Investor & Client Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor automated execution across client-owned broker and prop firm accounts.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-bull border border-bull/30 rounded-full px-3 py-1">
              <Activity className="h-3 w-3" /> QuantConnect feed active
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gold border border-gold/30 rounded-full px-3 py-1">
              {roleLabel(profile?.role || "retail")} tier
            </span>
            <Link
              to="/consultation"
              className="px-4 py-2 bg-secondary-surface border border-border hover:border-gold text-xs font-bold rounded-lg text-foreground transition-colors"
            >
              + Connect new prop account
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading portal…
          </div>
        ) : (
          <>
            {tab === "allocations" && (
              <div className="space-y-6">
                {!liveAllocations && (
                  <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 text-sm">
                    <p className="font-semibold text-foreground">No live allocations yet</p>
                    <p className="text-muted-foreground mt-1">
                      Prop accounts appear here after a strategy-desk review. Figures below, if shown, are a layout preview — not live balances.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link to="/consultation" className="px-3 py-2 rounded-lg bg-gold text-primary-foreground text-xs font-bold uppercase tracking-wider">
                        Book allocation review
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowPreview((v) => !v)}
                        className="px-3 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-wider"
                      >
                        {showPreview ? "Hide layout preview" : "Show layout preview"}
                      </button>
                    </div>
                  </div>
                )}

                {rows.length > 0 && (
                  <>
                    {!liveAllocations && (
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Illustrative layout — not live account balances</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary-surface border border-border rounded-xl">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Total allocated capital</span>
                        <div className="text-2xl font-extrabold text-foreground mt-1">{money(totals.allocated)}</div>
                        <span className="text-xs text-bull font-medium">Across {totals.count} account{totals.count === 1 ? "" : "s"}</span>
                      </div>
                      <div className="p-4 bg-secondary-surface border border-border rounded-xl">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Combined P&L</span>
                        <div className={cn("text-2xl font-extrabold mt-1", totals.pnl >= 0 ? "text-bull" : "text-bear")}>
                          {totals.pnl >= 0 ? "+" : ""}
                          {money(totals.pnl)}
                        </div>
                        <span className="text-xs text-muted-foreground">Reported on linked accounts</span>
                      </div>
                      <div className="p-4 bg-secondary-surface border border-border rounded-xl">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Max drawdown cushion</span>
                        <div className="text-2xl font-extrabold text-gold mt-1">{pct(totals.cushion)}</div>
                        <span className="text-xs text-muted-foreground">Average room under typical 5% rails</span>
                      </div>
                    </div>

                    <div className="bg-secondary-surface border border-border rounded-xl overflow-x-auto">
                      <div className="p-4 border-b border-border font-bold text-sm text-foreground">Active automated accounts</div>
                      <table className="w-full text-left text-xs text-muted-foreground min-w-[720px]">
                        <thead className="bg-dominant text-[11px] uppercase font-semibold border-b border-border">
                          <tr>
                            <th className="p-3.5">Prop firm / account</th>
                            <th className="p-3.5">Deployed strategy</th>
                            <th className="p-3.5">Current balance</th>
                            <th className="p-3.5">Total P&L</th>
                            <th className="p-3.5">Drawdown</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {rows.map((acc) => (
                            <tr key={acc.id} className="hover:bg-dominant/40 transition-colors">
                              <td className="p-3.5 font-bold text-foreground">
                                {acc.prop_firm_name}{" "}
                                <span className="block text-[10px] text-muted-foreground font-mono font-normal">{acc.account_number}</span>
                              </td>
                              <td className="p-3.5">{acc.allocated_strategy}</td>
                              <td className="p-3.5 font-mono text-foreground">{money(acc.current_equity)}</td>
                              <td className={cn("p-3.5 font-mono font-bold", Number(acc.pnl) >= 0 ? "text-bull" : "text-bear")}>
                                {Number(acc.pnl) >= 0 ? "+" : ""}
                                {money(acc.pnl)}
                              </td>
                              <td className="p-3.5 font-mono text-gold">
                                {pct(acc.current_dd)} / {pct(acc.max_dd_limit)}
                                <div className="mt-1 h-1.5 rounded-full bg-dominant overflow-hidden w-24">
                                  <div
                                    className="h-full bg-gold"
                                    style={{
                                      width: `${Math.min(100, (Number(acc.current_dd || 0) / Number(acc.max_dd_limit || 5)) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded bg-bull/10 text-bull border border-bull/20 text-[10px] font-bold uppercase">
                                  {acc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "sandbox" && (
              <div className="-mx-6 md:mx-0">
                <BacktestEngineSection compact />
                {overview?.backtests && overview.backtests.length > 0 && (
                  <div className="px-6 md:px-0 mt-6 space-y-3">
                    <h2 className="text-lg font-bold">Saved sandbox runs</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {overview.backtests.map((run) => (
                        <div key={run.id} className="p-4 rounded-xl border border-border bg-secondary-surface">
                          <div className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleString()}</div>
                          <div className="font-semibold text-sm mt-1">{run.asset_class}</div>
                          <div className="text-xs text-muted-foreground">{run.lookback_period}</div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                            <span>CAGR {run.metrics.cagr ?? "—"}</span>
                            <span>Sharpe {run.metrics.sharpe ?? "—"}</span>
                            <span>Max DD {run.metrics.maxDrawdown ?? "—"}</span>
                            <span>Win {run.metrics.winRate ?? "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "downloads" && (
              <DownloadsPanel
                downloads={overview?.downloads ?? []}
                catalog={
                  overview?.catalog?.length
                    ? overview.catalog
                    : STRATEGY_FILE_PRODUCTS.map(({ source: _source, ...rest }) => rest)
                }
                highlightRef={initialRef}
                userId={profile?.id}
              />
            )}

            {tab === "api" && (
              <div className="max-w-2xl space-y-4">
                <h2 className="text-lg font-bold">API & webhooks</h2>
                <p className="text-sm text-muted-foreground">
                  Direct execution webhooks are provisioned after an institutional subscribe or a strategy-desk review.
                  Paystack already posts to <code className="text-gold">/api/webhooks/paystack</code> for purchases.
                </p>
                <div className="p-4 rounded-xl border border-border bg-secondary-surface text-sm">
                  <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4 text-gold" /> Non-custodial</div>
                  <p className="text-muted-foreground mt-2">Broker keys never sit in this portal. Routing stays on accounts you own.</p>
                </div>
                <Link to="/" hash="pricing" className="inline-flex text-sm text-gold hover:underline">
                  View institutional webhook access →
                </Link>
              </div>
            )}

            {tab === "settings" && (
              <div className="max-w-xl space-y-4">
                <h2 className="text-lg font-bold">Account settings</h2>
                <div className="p-5 rounded-xl border border-border bg-secondary-surface space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Email</span> · {displayEmail}</div>
                  <div><span className="text-muted-foreground">Role</span> · {roleLabel(profile?.role || "retail")}</div>
                  <div><span className="text-muted-foreground">Plan</span> · {profile?.subscriptionStatus || "free"}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/account" className="px-4 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-wider">
                    Research library
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-primary-foreground text-xs font-bold uppercase tracking-wider"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function DownloadsPanel({
  downloads,
  catalog,
  highlightRef,
  userId,
}: {
  downloads: PortalDownload[];
  catalog: { id: string; title: string; filename: string; summary: string }[];
  highlightRef?: string;
  userId?: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Purchased source code & parameter files</h2>
        {downloads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No unlocked files yet. Purchase a research skeleton below — it is emailed and listed here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-5 bg-secondary-surface border rounded-xl flex flex-col justify-between",
                  highlightRef && highlightRef === item.reference ? "border-gold" : "border-border",
                )}
              >
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Ref: {item.reference} · {new Date(item.date).toLocaleDateString()}
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-1 mb-2">{item.title}</h3>
                  <div className="p-2 bg-dominant rounded font-mono text-xs text-gold border border-border mb-4">{item.filename}</div>
                </div>
                <a
                  href={strategyDownloadUrl(item.reference)}
                  className="w-full py-2 bg-gold text-primary-foreground font-bold text-xs rounded-lg hover:bg-gold-soft transition-colors text-center inline-flex items-center justify-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" /> Download code file (.py)
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold mb-3">
          Unlock live signal execution rules — {formatUsd(PRICING.strategyFile)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalog.map((item) => {
            const owned = downloads.some((d) => d.strategyId === item.id);
            return (
              <div key={item.id} className="p-5 bg-secondary-surface border border-border rounded-xl">
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-3">{item.summary}</p>
                <div className="p-2 bg-dominant rounded font-mono text-xs text-gold border border-border mb-4">{item.filename}</div>
                {owned ? (
                  <p className="text-xs text-bull font-semibold">Already unlocked</p>
                ) : (
                  <CheckoutForm
                    productType="strategy_file"
                    productId={item.id}
                    amountUsd={PRICING.strategyFile}
                    metadata={{ strategy_id: item.id, user_id: userId }}
                    label={`Unlock ${formatUsd(PRICING.strategyFile)}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
