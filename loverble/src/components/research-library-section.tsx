import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckoutForm } from "@/components/checkout-form";
import { researchPapers } from "@/lib/mock-data";
import { formatUsd, PRICING } from "@/lib/pricing";

const FILTERS = ["All", "Forex", "Commodities", "Equities"] as const;

const SAMPLE_NOTEBOOK = `# Sample QuantConnect algorithm initialization
def Initialize(self):
    self.SetStartDate(2023, 1, 1)
    self.SetCash(100000)
    self.symbol = self.AddForex("EURUSD", Resolution.Minute, Market.OANDA).Symbol
    self.bb = self.BB(self.symbol, 20, 2, MovingAverageType.Simple)
    self.SetWarmUp(20)`;

function assetFilter(category: string): string {
  if (category === "Forex") return "Forex";
  if (category === "Commodities") return "Commodities";
  if (category === "Equities") return "Equities";
  return "Other";
}

export function ResearchLibrarySection() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const reports = researchPapers.filter((paper) => {
    if (filter === "All") return true;
    return assetFilter(paper.category) === filter;
  });

  return (
    <section id="research" className="py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Quant library</div>
            <h2 className="font-display text-section-title text-3xl md:text-4xl">Research & strategy notebooks</h2>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm">
              Methodology notes with Jupyter notebooks, backtest logs, and execution parameters — unlock per report.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                  filter === cat
                    ? "bg-gold text-primary-foreground"
                    : "bg-secondary-surface text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {reports.map((report) => (
            <article
              key={report.id}
              className="p-6 bg-secondary-surface border border-border rounded-xl flex flex-col justify-between hover:border-gold/30 transition-colors duration-200"
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="px-2.5 py-0.5 rounded bg-gold/10 text-gold font-semibold border border-gold/20">
                    {report.category}
                  </span>
                  <span className="text-muted-foreground">{report.date}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.executiveSummary}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/80">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs text-bull font-mono">.ipynb + PDF included</span>
                  {report.tier === "free" ? (
                    <Link
                      to="/research"
                      className="px-4 py-2 bg-gold text-primary-foreground font-bold text-xs rounded-sm hover:bg-gold-soft transition-colors cursor-pointer"
                    >
                      Read free
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-gold">Unlock — {formatUsd(PRICING.researchFull)}</span>
                  )}
                </div>
                {report.tier !== "free" && (
                  <CheckoutForm
                    productType="research_subscription"
                    productId={report.id}
                    amountUsd={PRICING.researchFull}
                    label={`Unlock — ${formatUsd(PRICING.researchFull)}`}
                    variant="primary"
                  />
                )}
              </div>
            </article>
          ))}
          {reports.length === 0 && (
            <p className="text-sm text-muted-foreground md:col-span-2">No notes in this asset class yet.</p>
          )}
        </div>

        <div className="p-6 bg-dominant border border-border rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <span className="text-xs font-mono text-muted-foreground">
              Sample notebook preview: <span className="text-gold">eurusd_mean_reversion.py</span>
            </span>
            <Link to="/research" className="text-xs text-gold hover:underline cursor-pointer">
              Open research library →
            </Link>
          </div>
          <pre className="p-4 bg-secondary-surface rounded-lg text-xs font-mono text-bull overflow-x-auto border border-border">
            {SAMPLE_NOTEBOOK}
          </pre>
        </div>
      </div>
    </section>
  );
}
