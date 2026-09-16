import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { RoadmapSection } from "@/components/roadmap-section";
import { company } from "@/lib/mock-data";
import { Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Smart Algos Capital" },
      { name: "description", content: `${company.name} — quantitative research and systematic strategies operated by ${company.operator}.` },
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
            An independent quantitative research practice. We develop systematic strategies, publish research, and offer advisory for traders and small teams building a verifiable track record.
          </p>
        </SectionCard>
        <SectionCard title="What We Are Not">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We are not a hedge fund, prop firm, or EA marketplace. We do not inflate AUM or investor counts. Credibility comes from published research and third-party verified performance.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="What We Offer">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: "Research Library", d: "Free previews and paid subscriptions for full notes, notebooks, and PDFs.", link: "/research" },
            { t: "Strategies", d: "Catalog of live and research-stage systematic strategies with verification links.", link: "/strategies" },
            { t: "Performance", d: "Track record connected progressively from QuantConnect and partner platforms.", link: "/performance" },
            { t: "Consultation", d: "Strategy review, system design, and research advisory sessions.", link: "/consultation" },
          ].map((x) => (
            <Link key={x.t} to={x.link} className="rounded-sm border border-border bg-card/30 p-4 hover:border-gold/40 transition block">
              <div className="text-sm font-semibold">{x.t}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{x.d}</div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Roadmap">
        <RoadmapSection />
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
