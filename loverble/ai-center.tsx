import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { Bot, Sparkles, Send, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/ai-center")({
  head: () => ({ meta: [{ title: "AI Command Center — Smart Algos Capital" }, { name: "description", content: "AI quant assistant and research copilot for alpha generation, optimization and risk." }] }),
  component: AICenter,
});

const conversation = [
  { role: "user", text: "Find 3 alpha ideas combining sector momentum and earnings revisions in Africa-listed equities." },
  { role: "ai", text: "Generated 3 candidate alphas. ALPHA-DRAFT-001 ranks highest with simulated Sharpe 2.14, IC 0.062. Notable: sector-neutral construction reduces Egypt/Nigeria currency drag. Want me to run a 5-year out-of-sample test?" },
  { role: "user", text: "Yes — and check for overfitting." },
  { role: "ai", text: "Walk-forward IS/OOS ratio = 0.84 (healthy). Deflated Sharpe = 1.92. No look-ahead bias detected. Top exposure: South African industrials. Recommend deploying with 0.5% portfolio weight." },
];

const insights = [
  { icon: TrendingUp, type: "Opportunity", text: "Momentum signal in semiconductors strengthening (z=2.4). 3 alphas pre-positioned, suggest +2% allocation." },
  { icon: AlertTriangle, type: "Risk Warning", text: "EM-FX volatility regime shift detected. Recommend reducing Savanna FX Reversion exposure by 15%." },
  { icon: Lightbulb, type: "Idea", text: "Cross-asset signal: oil futures + airlines short showing 0.71 correlation. Pair trade candidate identified." },
];

function AICenter() {
  const [prompt, setPrompt] = useState("");
  return (
    <PageShell eyebrow="AI Command Center" title="AI Quant Assistant" description="A GPT-class research copilot trained on 14 years of Smart Algos proprietary data and the broader quant literature.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Alpha Ideas Generated" value="1,284" hint="This month" accent="up" />
        <StatCard label="Overfitting Detected" value="142" hint="Auto-flagged" accent="down" />
        <StatCard label="Optimizations Run" value="3,841" />
        <StatCard label="Avg Response" value="1.8s" accent="up" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Chat with Smart Algos AI" subtitle="Quant copilot · Connected to live data" action={<Bot className="h-5 w-5 text-gold" />}>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {conversation.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "ai" && <div className="h-7 w-7 rounded-sm bg-gold/20 text-gold flex items-center justify-center shrink-0"><Bot className="h-4 w-4" /></div>}
                <div className={`rounded-md px-4 py-2.5 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card/60 border border-border"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything — alpha ideas, optimizations, risk..." className="flex-1 bg-background border border-border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60" />
            <button className="rounded-sm bg-primary px-4 text-primary-foreground hover:bg-gold-soft transition"><Send className="h-4 w-4" /></button>
          </div>
        </SectionCard>

        <SectionCard title="Live Insights" subtitle="Continuous market scanning">
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="rounded-sm border border-border bg-card/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <ins.icon className={`h-4 w-4 ${ins.type === "Risk Warning" ? "text-bear" : ins.type === "Opportunity" ? "text-bull" : "text-gold"}`} />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{ins.type}</span>
                </div>
                <p className="text-xs leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Sparkles, label: "Generate Alpha Ideas" },
          { icon: TrendingUp, label: "Optimize Strategy" },
          { icon: AlertTriangle, label: "Detect Overfitting" },
          { icon: Lightbulb, label: "Portfolio Recs" },
        ].map((q) => (
          <button key={q.label} className="surface-card rounded-lg p-4 text-left hover:border-gold/40 transition">
            <q.icon className="h-5 w-5 text-gold mb-2" />
            <div className="text-sm font-medium">{q.label}</div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
