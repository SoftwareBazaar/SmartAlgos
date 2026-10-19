import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { DonateButton } from "@/components/donate-button";
import { company } from "@/lib/mock-data";
import { PRIMARY_NAV } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-border bg-dominant mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="max-w-sm">
            <BrandLogo variant="footer" className="opacity-90" />
            <p className="text-sm text-muted-foreground mt-2">{company.operator}</p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Quantitative research and systematic strategies. Performance figures reference third-party verification where noted; past results are not indicative of future returns.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to + item.label}>
                <Link to={item.to} className="text-muted-foreground hover:text-gold transition-colors duration-200 cursor-pointer">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-8 pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bull" />
            </span>
            <span className="text-sm font-medium text-foreground/80">
              Track records via{" "}
              <a
                href="https://www.quantconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline cursor-pointer"
              >
                QuantConnect
              </a>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Secured by Paystack (PCI-DSS Level 1)</span>
            <span aria-hidden>•</span>
            <span>256-bit SSL encrypted</span>
          </div>
        </div>

        <div className="hairline mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">© 2026 {company.operator}. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors cursor-pointer">Privacy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors cursor-pointer">Terms</Link>
            <Link to="/disclaimers" className="hover:text-gold transition-colors cursor-pointer">Disclaimers</Link>
            <Link to="/security-policy" className="hover:text-gold transition-colors cursor-pointer">Security</Link>
            <span>Not investment advice · Kenya</span>
            <DonateButton footer />
          </div>
        </div>
      </div>
    </footer>
  );
}
