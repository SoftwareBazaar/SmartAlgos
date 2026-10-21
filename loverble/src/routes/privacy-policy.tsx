import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Smart Algo STS" },
      {
        name: "description",
        content:
          "Client-side privacy guarantee, data protocols, and AdSense cookie practices for Smart Algo STS (smartalgosts.com).",
      },
      { property: "og:title", content: "Privacy Policy — Smart Algo STS" },
      {
        property: "og:url",
        content: "https://www.smartalgosts.com/privacy-policy",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/privacy-policy" }],
  }),
  component: Privacy,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link
        to="/legal"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shrink-0">
          <Shield className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Smart Algo STS · Effective Date: October 2026 ·{" "}
            <a
              href="https://www.smartalgosts.com"
              className="text-gold hover:underline"
            >
              www.smartalgosts.com
            </a>
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Smart Algo STS operates an open financial intelligence and calculation platform. This
        document outlines our data handling practices, cookie protocols, and advertising compliance
        framework.
      </p>

      <Block title="1. Client-Side Browser Execution & Data Isolation">
        <p>Smart Algo STS prioritizes user privacy through architectural design:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">Local Browser Compute:</strong> All debt optimization
            algorithms, amortization calculators, and mathematical simulations execute 100% locally
            within your client browser.
          </li>
          <li>
            <strong className="text-foreground">Zero Financial Data Storage:</strong> Inputted
            balances, interest rates, salary figures, and monthly debt schedules are never
            transmitted to, logged on, or saved to our external servers.
          </li>
        </ul>
      </Block>

      <Block title="2. Information Collection & Analytics">
        <p>
          We collect non-personally identifiable diagnostic information to maintain platform
          performance and security:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">Usage Data:</strong> Standard web parameters including
            browser type, operating system version, page view durations, and referral pathways.
          </li>
          <li>
            <strong className="text-foreground">Cookies & Local Storage:</strong> Used exclusively to
            store local application settings, theme preferences, and functional session security
            tokens.
          </li>
        </ul>
      </Block>

      <Block title="3. Advertising & Third-Party Cookies (Google AdSense)">
        <p>
          Smart Algo STS displays programmatic advertising provided by Google AdSense and partner ad
          networks:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">Ad Serving Cookies:</strong> Third-party vendors,
            including Google, use cookies to serve ads based on a user&apos;s prior visits to this
            website or other internet locations.
          </li>
          <li>
            <strong className="text-foreground">Personalized Advertising:</strong> Users may manage
            or opt out of personalized advertising preferences by visiting{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Google Ad Settings
            </a>{" "}
            or{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              www.aboutads.info
            </a>
            .
          </li>
        </ul>
      </Block>

      <Block title="4. Regulatory Rights & Data Protection">
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">General Data Protection Regulation (GDPR):</strong>{" "}
            Users retain rights to inspect, update, or request deletion of any collected diagnostic
            usage data.
          </li>
          <li>
            <strong className="text-foreground">California Privacy Rights:</strong> Smart Algo STS
            does not sell, trade, or monetize personal user data to third parties.
          </li>
        </ul>
      </Block>

      <Block title="5. Contact Information">
        <p>For privacy inquiries or technical questions regarding data handling:</p>
        <p>
          <strong className="text-foreground">Website:</strong>{" "}
          <a href="https://www.smartalgosts.com" className="text-gold hover:underline">
            www.smartalgosts.com
          </a>
        </p>
      </Block>
    </div>
  );
}
