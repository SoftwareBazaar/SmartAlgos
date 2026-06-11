import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { BookOpen, Code, LineChart, BrainCircuit, BarChart, PieChart } from "lucide-react";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [{ title: "Quant Academy — Smart Algos Capital" }, { name: "description", content: "Master quantitative finance, Python for trading, ML and portfolio theory." }] }),
  component: Academy,
});

const courses = [
  { icon: LineChart, title: "Quantitative Finance Foundations", level: "Beginner", lessons: 32, hours: 18 },
  { icon: Code, title: "Python for Trading", level: "Beginner", lessons: 48, hours: 24 },
  { icon: BarChart, title: "MT5 Automation & EAs", level: "Intermediate", lessons: 28, hours: 14 },
  { icon: BrainCircuit, title: "Machine Learning for Markets", level: "Advanced", lessons: 56, hours: 42 },
  { icon: PieChart, title: "Options Trading & Greeks", level: "Intermediate", lessons: 36, hours: 22 },
  { icon: BookOpen, title: "Modern Portfolio Theory", level: "Intermediate", lessons: 24, hours: 12 },
];

const papers = [
  { title: "Alpha Decay in Emerging Markets: A 2026 Update", author: "Dr. K. Mwangi, Y. Tanaka", type: "Internal Research", date: "Feb 2026" },
  { title: "Cross-Sectional Momentum Across African Equities", author: "Smart Algos Research Team", type: "Alpha Paper", date: "Jan 2026" },
  { title: "Q1 2026 Macro Outlook — Rates, FX, Commodities", author: "Macro Desk", type: "Market Report", date: "Jan 2026" },
  { title: "The Sortino-Calmar Tradeoff in High-Sharpe Strategies", author: "Prof. N. Kone", type: "Alpha Paper", date: "Dec 2025" },
];

function Academy() {
  return (
    <PageShell eyebrow="Quant Academy" title="Learning Center" description="From your first Python script to publishing a live alpha — built by the Smart Algos research team.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c.title} className="surface-card rounded-lg p-5 hover:border-gold/40 transition cursor-pointer">
            <c.icon className="h-6 w-6 text-gold mb-4" />
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.level}</div>
            <h3 className="font-display text-lg font-semibold mt-1">{c.title}</h3>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>{c.lessons} lessons</span>
              <span className="font-mono">{c.hours}h</span>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Research Papers" subtitle="Internal research, alpha papers and market reports">
        <div className="space-y-1">
          {papers.map((p) => (
            <div key={p.title} className="flex items-start gap-3 rounded-sm border border-border/60 px-4 py-3 hover:bg-card/30 transition cursor-pointer">
              <BookOpen className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.author} · {p.type} · {p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
