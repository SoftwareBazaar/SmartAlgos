import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { positions, fmt } from "@/lib/mock-data";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/live-trading")({
  head: () => ({ meta: [{ title: "Live Trading Center — Smart Algos Capital" }, { name: "description", content: "Execution hub with multi-broker connectivity across global markets." }] }),
  component: LiveTrading,
});

const brokers = [
  { name: "Interactive Brokers", status: "Connected", latency: "12ms", orders: 412 },
  { name: "Alpaca Markets", status: "Connected", latency: "28ms", orders: 184 },
  { name: "Tradier", status: "Connected", latency: "34ms", orders: 91 },
  { name: "MetaTrader 5", status: "Connected", latency: "8ms", orders: 624 },
  { name: "NinjaTrader", status: "Idle", latency: "—", orders: 0 },
  { name: "TradeStation", status: "Connected", latency: "41ms", orders: 142 },
];

const orderBook = [
  { time: "14:32:18", ticker: "NVDA", side: "BUY", qty: 1200, price: 478.92, status: "Filled" },
  { time: "14:32:12", ticker: "EURUSD", side: "SELL", qty: 2000000, price: 1.0812, status: "Filled" },
  { time: "14:31:54", ticker: "ES Mar25", side: "BUY", qty: 12, price: 5912.25, status: "Filled" },
  { time: "14:31:41", ticker: "AAPL", side: "BUY", qty: 800, price: 226.81, status: "Working" },
  { time: "14:31:22", ticker: "BTCUSD", side: "SELL", qty: 2.4, price: 71240, status: "Filled" },
  { time: "14:30:58", ticker: "TSLA", side: "SELL", qty: 400, price: 244.30, status: "Partial" },
];

function LiveTrading() {
  return (
    <PageShell eyebrow="Live Trading Center" title="Execution Hub" description="Real-time order routing, broker monitoring and execution quality across global markets."
      actions={<div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-bull animate-pulse" /><span className="text-bull font-mono uppercase tracking-wider">All systems live</span></div>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Orders Today" value="1,453" hint="98.4% fill rate" accent="up" />
        <StatCard label="Avg Latency" value="18ms" hint="P99: 64ms" accent="up" />
        <StatCard label="Slippage (avg)" value="0.8 bps" hint="vs midpoint" />
        <StatCard label="Notional Routed" value="$284M" hint="Today" />
      </div>

      <SectionCard title="Broker Connections" subtitle="Active execution venues">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brokers.map((b) => (
            <div key={b.name} className="rounded-sm border border-border bg-card/30 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${b.status === "Connected" ? "bg-bull/15 text-bull" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Latency: <span className="font-mono text-foreground">{b.latency}</span></span>
                <span>Orders: <span className="font-mono text-foreground">{b.orders}</span></span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Live Order Tape" subtitle="Last 6 orders" action={<Radio className="h-4 w-4 text-bull animate-pulse" />}>
          <div className="space-y-1.5">
            {orderBook.map((o, i) => (
              <div key={i} className="flex items-center gap-3 rounded-sm border border-border/60 bg-background px-3 py-2 text-xs font-mono">
                <span className="text-muted-foreground">{o.time}</span>
                <span className="text-gold w-20">{o.ticker}</span>
                <span className={`w-12 ${o.side === "BUY" ? "text-bull" : "text-bear"}`}>{o.side}</span>
                <span className="flex-1 text-right">{o.qty.toLocaleString()} @ {fmt.num(o.price)}</span>
                <span className={`w-16 text-right ${o.status === "Filled" ? "text-bull" : o.status === "Partial" ? "text-gold" : "text-muted-foreground"}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Open Positions" subtitle="Across all venues">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="text-left py-2">Ticker</th><th className="text-left py-2">Side</th><th className="text-right py-2">Mark</th><th className="text-right py-2">PnL</th>
              </tr></thead>
              <tbody>
                {positions.slice(0, 6).map((p) => (
                  <tr key={p.ticker} className="border-b border-border/40">
                    <td className="py-2.5 font-mono text-gold">{p.ticker}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${p.side === "Long" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"}`}>{p.side}</span></td>
                    <td className="py-2.5 text-right font-mono">{fmt.num(p.mark)}</td>
                    <td className={`py-2.5 text-right font-mono ${p.pnl >= 0 ? "text-bull" : "text-bear"}`}>{p.pnl >= 0 ? "+" : ""}{fmt.usd(p.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
