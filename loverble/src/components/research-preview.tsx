import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FileText, Unlock } from "lucide-react";
import type { ResearchPaper } from "@/lib/mock-data";
import { equityCurve } from "@/lib/mock-data";
import { PremiumGate } from "@/components/premium-gate";
import { useSubscription } from "@/hooks/use-subscription";
import { hasResearchAccess } from "@/lib/subscription-access";
import { formatUsd, PRICING } from "@/lib/pricing";

const PREVIEW_FINDINGS_COUNT = 1;

function previewExcerpt(text: string, maxSentences = 2): string {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= maxSentences) return text;
  return `${parts.slice(0, maxSentences).join(" ")}…`;
}

export function ResearchPreviewCard({ paper }: { paper: ResearchPaper }) {
  const chartData = equityCurve.slice(-90);
  const { tier } = useSubscription();
  const isFree = paper.tier === "free";
  const unlocked = isFree || hasResearchAccess(tier);
  const previewFindings = paper.keyFindings.slice(0, PREVIEW_FINDINGS_COUNT);
  const gatedFindings = paper.keyFindings.slice(PREVIEW_FINDINGS_COUNT);
  const gatedItems = [...gatedFindings, ...paper.lockedContent];

  return (
    <article className="rounded-lg border border-border/60 bg-card/30 overflow-hidden">
      <div className="p-5 border-b border-border/60">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-gold mt-0.5 shrink-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              <span className="font-mono text-gold">{paper.id}</span>
              <span>{paper.category}</span>
              <span>{paper.date}</span>
              {!isFree && !unlocked && <span className="text-gold">Preview</span>}
              {!isFree && unlocked && (
                <span className="text-bull inline-flex items-center gap-1">
                  <Unlock className="h-3 w-3" /> Full access
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-semibold">{paper.title}</h3>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {!isFree && !unlocked && (
          <div className="rounded-sm border border-gold/25 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
            Free preview below — unlock this report for {formatUsd(PRICING.researchFull)} (one-time, per note).
          </div>
        )}

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-2">Executive Summary</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {unlocked || isFree ? paper.executiveSummary : previewExcerpt(paper.executiveSummary)}
          </p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-2">Key Chart — {paper.previewChartLabel}</div>
          <div className="rounded-sm border border-border bg-background/40 p-3 chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`preview-${paper.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={10} tickFormatter={(d) => d.slice(5)} minTickGap={30} />
                <YAxis stroke="oklch(0.70 0.02 90)" fontSize={10} hide />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6, fontSize: 11 }} />
                <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={1.5} fill={`url(#preview-${paper.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-2">Key Findings</div>
          <ul className="space-y-2">
            {(unlocked || isFree ? paper.keyFindings : previewFindings).map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {unlocked && !isFree && paper.lockedContent.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-2">Full content (subscriber)</div>
            <ul className="space-y-2">
              {paper.lockedContent.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                  <Unlock className="h-3.5 w-3.5 text-bull shrink-0" />
                  {item}
                  <span className="text-[10px] text-muted-foreground">— delivery via account portal soon</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!unlocked && gatedItems.length > 0 && (
          <>
            <div className="hairline" />
            <PremiumGate items={gatedItems} />
          </>
        )}
      </div>
    </article>
  );
}
