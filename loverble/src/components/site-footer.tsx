import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { DonateButton } from "@/components/donate-button";
import { company } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-border bg-dominant mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 max-w-sm">
            <BrandLogo variant="footer" className="opacity-90" />
            <p className="text-sm text-muted-foreground mt-3">{company.operator}</p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Financial systems and quantitative research. Educational research only — not a licensed investment
              adviser. Past results are not indicative of future returns.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Track records: public QuantConnect listings pending. Until then we do not claim third-party verification.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Product</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/systems" className="text-muted-foreground hover:text-gold transition-colors">
                  Financial systems
                </Link>
              </li>
              <li>
                <Link to="/strategies" className="text-muted-foreground hover:text-gold transition-colors">
                  Strategies
                </Link>
              </li>
              <li>
                <Link to="/performance" className="text-muted-foreground hover:text-gold transition-colors">
                  Track Record
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-muted-foreground hover:text-gold transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link to="/consultation" className="text-muted-foreground hover:text-gold transition-colors">
                  Strategy Desk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Research</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/insights" className="text-muted-foreground hover:text-gold transition-colors">
                  Insights
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-muted-foreground hover:text-gold transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link to="/finance" className="text-muted-foreground hover:text-gold transition-colors">
                  Decision Math
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/portal" className="text-muted-foreground hover:text-gold transition-colors">
                  Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Legal</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-gold transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/financial-disclaimer" className="text-muted-foreground hover:text-gold transition-colors">
                  Financial disclaimer
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-gold transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/security-policy" className="text-muted-foreground hover:text-gold transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-gold transition-colors">
                  Support research
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-muted-foreground">
          <span>
            Checkout pages use Paystack (PCI-DSS Level 1) · Site served over HTTPS
          </span>
          <DonateButton footer />
        </div>

        <div className="hairline mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">© 2026 {company.operator}. All rights reserved.</span>
          <span>Educational research only · not a licensed investment adviser</span>
        </div>
      </div>
    </footer>
  );
}
