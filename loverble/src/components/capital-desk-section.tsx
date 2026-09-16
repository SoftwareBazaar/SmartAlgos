import { Link } from "@tanstack/react-router";
import { Shield, Cpu, Gauge } from "lucide-react";

const pillars = [
  {
    icon: Shield,
    title: "Non-custodial security",
    body: "You retain custody of prop accounts and broker credentials. We never hold client funds.",
  },
  {
    icon: Cpu,
    title: "Automated execution",
    body: "Systematic models deploy to client-owned prop accounts and broker APIs you control.",
  },
  {
    icon: Gauge,
    title: "Hard risk controls",
    body: "Stop-loss and daily-loss rails designed around typical prop-firm drawdown rules.",
  },
];

export function CapitalDeskSection() {
  return (
    <section id="capital" className="py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="bg-secondary-surface border border-gold/30 p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Capital allocation</div>
              <h2 className="font-display text-section-title text-3xl md:text-4xl">Prop account automation desk</h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                We can wire verified models to client-owned prop firm accounts and institutional broker endpoints.
                Non-custodial. No pooled fund. Allocation is scoped after a strategy-desk review.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                to="/consultation"
                className="inline-flex items-center justify-center min-h-12 px-5 py-2.5 bg-gold text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-soft transition-colors cursor-pointer"
              >
                Book allocation review
              </Link>
              <Link
                to="/portal"
                className="inline-flex items-center justify-center min-h-12 px-5 py-2.5 bg-background border border-border hover:border-gold text-foreground font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Client portal
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-6">
            {pillars.map((p) => (
              <div key={p.title} className="p-4 bg-dominant/60 rounded-xl border border-border">
                <p.icon className="h-4 w-4 text-gold mb-2" />
                <div className="text-gold font-semibold text-sm mb-1">{p.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
