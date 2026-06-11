import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { Building2, Briefcase, Handshake, FileText } from "lucide-react";

export const Route = createFileRoute("/institutional")({
  head: () => ({ meta: [{ title: "Institutional Portal — Smart Algos Capital" }, { name: "description", content: "Family office and institutional capital — custom mandates, bespoke strategies, fund allocation." }] }),
  component: Institutional,
});

function Institutional() {
  return (
    <PageShell eyebrow="Institutional" title="Family Office & Allocation Programs" description="Bespoke mandates and capital partnerships for serious institutional capital.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mandate Status" value="Pre-Launch" hint="Onboarding partners" />
        <StatCard label="Partner Conversations" value="Active" hint="Family offices & advisors" />
        <StatCard label="Strategy Tracks" value="3" hint="Forex · Commodities · Equities" />
        <StatCard label="Target Ticket" value="Custom" hint="Tailored mandates" />

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Family Office Portal" subtitle="White-glove mandate management">
          <div className="space-y-4">
            {[
              { icon: Briefcase, t: "Capital Allocation", d: "Tactical and strategic allocation across Smart Algos's strategy set, customized per mandate." },
              { icon: FileText, t: "Custom Mandates", d: "Risk-budget, exposure, ESG and concentration constraints defined per family office." },
              { icon: Handshake, t: "Bespoke Strategies", d: "Co-developed strategies for sole investor — full transparency, segregated account." },
            ].map((i) => (
              <div key={i.t} className="flex gap-3 rounded-sm border border-border bg-card/30 p-4">
                <i.icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{i.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{i.d}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Fund Allocation Program" subtitle="Capital raising for external managers">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Smart Algos allocates institutional capital to vetted external managers with proven track records (Sharpe &gt; 1.5, audited 3-year history).</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-sm border border-border bg-card/30 p-3">
                <div className="font-display text-2xl text-gold">$24M</div>
                <div className="text-xs text-muted-foreground mt-1">Avg allocation</div>
              </div>
              <div className="rounded-sm border border-border bg-card/30 p-3">
                <div className="font-display text-2xl text-gold">90d</div>
                <div className="text-xs text-muted-foreground mt-1">Due diligence</div>
              </div>
              <div className="rounded-sm border border-border bg-card/30 p-3">
                <div className="font-display text-2xl text-gold">8</div>
                <div className="text-xs text-muted-foreground mt-1">Current managers</div>
              </div>
            </div>
            <button className="w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
              Apply as External Manager
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Investor Relations" subtitle="Direct line to the GP">
        <div className="flex flex-wrap gap-3">
          <button className="rounded-sm border border-gold/40 text-gold bg-gold/5 px-5 py-3 text-sm hover:bg-gold/10 transition flex items-center gap-2"><Building2 className="h-4 w-4" />Schedule Due Diligence</button>
          <button className="rounded-sm border border-border bg-card/30 px-5 py-3 text-sm hover:bg-card/50 transition">Request DDQ Pack</button>
          <button className="rounded-sm border border-border bg-card/30 px-5 py-3 text-sm hover:bg-card/50 transition">Subscribe to Quarterly Letter</button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
