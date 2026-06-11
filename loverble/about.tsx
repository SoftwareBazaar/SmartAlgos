import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { company } from "@/lib/mock-data";
import { Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Smart Algos Capital" },
      { name: "description", content: `${company.name} — quantitative research and investment technology operated by ${company.operator}.` },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell
      eyebrow="About"
      title={company.name}
      description={`${company.tagline}. Operated by ${company.operator}.`}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="What We Are">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A quantitative research and investment technology firm. We develop strategies, publish research, build financial technology, and create systems that support modern investment and financial institutions.
          </p>
        </SectionCard>
        <SectionCard title="What We Are Not">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We do not pretend to be a billion-dollar hedge fund. We do not inflate AUM, investor counts, or infrastructure claims. We build credibility through honest research and verified performance first.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="What We Do Today">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: "Quantitative Research", d: "Research notes, white papers, and strategy studies across Forex, Commodities, and Equities." },
            { t: "Alpha Portfolio", d: "Design, validate, and deploy systematic strategies on QuantConnect and partner platforms." },
            { t: "Consultation", d: "Quant strategy review, trading system design (MT5/Python), and financial systems advisory." },
            { t: "Technology Division", d: "Portfolio analytics, quant tools, and future banking/risk systems." },
          ].map((x) => (
            <div key={x.t} className="rounded-sm border border-border bg-card/30 p-4">
              <div className="text-sm font-semibold">{x.t}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{x.d}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Vision">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Grow from research and verified strategy performance today into a full quantitative investment and financial intelligence ecosystem. The hedge fund vision is part of the roadmap — built sequentially, with credibility ahead of scale.
        </p>
      </SectionCard>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/contact" className="inline-flex items-center gap-2 text-gold hover:underline">
          <Mail className="h-4 w-4" /> Contact
        </Link>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" /> Kenya
        </span>
      </div>
    </PageShell>
  );
}
