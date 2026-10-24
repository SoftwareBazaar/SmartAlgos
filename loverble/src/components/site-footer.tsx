import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { DonateButton } from "@/components/donate-button";
import { company } from "@/lib/mock-data";

const doorLinks = [
  { label: "Financial systems", to: "/systems" as const },
  { label: "Quant strategies", to: "/strategies" as const },
  { label: "Store", to: "/store" as const },
  { label: "Book a desk", to: "/consultation" as const },
];

const researchLinks = [
  { label: "Decision Math", to: "/finance" as const },
  { label: "Research", to: "/research" as const },
  { label: "About", to: "/about" as const },
  { label: "Portal", to: "/portal" as const },
];

const legalLinks = [
  { label: "Privacy", to: "/privacy-policy" as const },
  { label: "Financial disclaimer", to: "/financial-disclaimer" as const },
  { label: "Terms", to: "/terms" as const },
  { label: "Security", to: "/security-policy" as const },
  { label: "Support research", to: "/support" as const },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-[linear-gradient(180deg,rgba(17,24,39,0.55),rgba(7,10,16,0.92))]">
      <div className="mx-auto max-w-[1160px] px-6 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <BrandLogo variant="footer" className="opacity-95" />
            <p className="mt-4 text-sm font-medium text-foreground/90">{company.operator}</p>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              Financial systems and quantitative research. Educational research only — not a licensed investment
              adviser. Past results are not indicative of future returns.
            </p>
            <div className="mt-4 space-y-1 text-[12px]">
              <a href={`mailto:${company.emails.info}`} className="block text-muted-foreground hover:text-gold transition">
                {company.emails.info}
              </a>
              <a href={`mailto:${company.emails.support}`} className="block text-muted-foreground hover:text-gold transition">
                {company.emails.support}
              </a>
              <a href={`mailto:${company.emails.desk}`} className="block text-muted-foreground hover:text-gold transition">
                {company.emails.desk}
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-[9px] tracking-[0.16em] text-gold">DOORS</p>
            <ul className="space-y-2.5">
              {doorLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-[9px] tracking-[0.16em] text-gold">RESEARCH</p>
            <ul className="space-y-2.5">
              {researchLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-[9px] tracking-[0.16em] text-gold">LEGAL</p>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            Checkout pages use Paystack (PCI-DSS Level 1) · Site served over HTTPS
          </p>
          <DonateButton footer />
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-border/40 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-foreground/75">
            © 2026 {company.operator}. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Educational research only · not a licensed investment adviser
          </p>
        </div>
      </div>
    </footer>
  );
}
