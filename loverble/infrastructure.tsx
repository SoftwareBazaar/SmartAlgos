import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { Server, Cloud, Code2, Database, Activity } from "lucide-react";

export const Route = createFileRoute("/infrastructure")({
  head: () => ({ meta: [{ title: "Infrastructure — Smart Algos Capital" }, { name: "description", content: "Technology stack and infrastructure powering the Smart Algos platform." }] }),
  component: Infra,
});

const stack = {
  Frontend: ["Next.js", "React", "Tailwind", "TanStack Query"],
  Backend: ["Python", "FastAPI", "PostgreSQL", "Redis"],
  Quant: ["VectorBT", "Backtrader", "QuantConnect API", "MT5 API"],
  Cloud: ["AWS (primary)", "Azure (DR)", "DigitalOcean (edge)"],
};

function Infra() {
  return (
    <PageShell eyebrow="Infrastructure Center" title="Technology Stack" description="The systems and services powering Smart Algos Capital at sub-millisecond scale.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Uptime (90d)" value="99.998%" accent="up" />
        <StatCard label="P99 Latency" value="64ms" accent="up" />
        <StatCard label="Tick Ingestion" value="2.4M/s" accent="up" />
        <StatCard label="Compute Cores" value="1,284" hint="Across 4 regions" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stack).map(([k, items]) => {
          const Icon = k === "Frontend" ? Code2 : k === "Backend" ? Server : k === "Quant" ? Activity : Cloud;
          return (
            <div key={k} className="surface-card rounded-lg p-5">
              <Icon className="h-6 w-6 text-gold mb-3" />
              <div className="font-display text-lg font-semibold mb-3">{k}</div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {items.map((i) => <li key={i} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-gold" />{i}</li>)}
              </ul>
            </div>
          );
        })}
      </div>

      <SectionCard title="System Health" subtitle="Live monitoring · All regions">
        <div className="space-y-2">
          {[
            { service: "Market Data Gateway", region: "us-east-1", status: "Operational", latency: "8ms" },
            { service: "Order Router", region: "us-east-1", status: "Operational", latency: "12ms" },
            { service: "Backtest Engine", region: "eu-west-1", status: "Operational", latency: "—" },
            { service: "Alpha Pipeline", region: "ap-southeast-1", status: "Operational", latency: "24ms" },
            { service: "Risk Engine", region: "us-east-1", status: "Operational", latency: "4ms" },
            { service: "Investor Portal API", region: "global", status: "Operational", latency: "82ms" },
          ].map((s) => (
            <div key={s.service} className="flex items-center gap-3 rounded-sm border border-border/60 px-4 py-3">
              <Database className="h-4 w-4 text-gold" />
              <div className="flex-1">
                <div className="text-sm font-medium">{s.service}</div>
                <div className="text-xs text-muted-foreground font-mono">{s.region}</div>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{s.latency}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-bull/15 text-bull">{s.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
