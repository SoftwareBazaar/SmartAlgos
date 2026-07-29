import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, FileText, Lock, AlertTriangle, Scale, Mail } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal — Smart Algos Capital" },
      { name: "description", content: "Privacy Policy, Terms of Service, Disclaimers, and Security Policy for Smart Algos Capital." },
    ],
  }),
  component: Legal,
});

const sections = [
  { icon: Shield, href: "/legal/privacy", label: "Privacy Policy", desc: "How we collect, use, and protect your personal data." },
  { icon: FileText, href: "/legal/terms", label: "Terms of Service", desc: "The rules and conditions governing use of this platform." },
  { icon: AlertTriangle, href: "/legal/disclaimers", label: "Disclaimers", desc: "Risk warnings and important disclosures about trading." },
  { icon: Lock, href: "/legal/security", label: "Security Policy", desc: "How we keep your data and payments safe." },
];

function Legal() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">Legal</div>
      <h1 className="font-display text-4xl font-semibold mb-3">Legal &amp; Policies</h1>
      <p className="text-muted-foreground mb-10">
        Operated by <span className="text-foreground font-medium">{company.operator}</span>
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, href, label, desc }) => (
          <Link
            key={href}
            to={href}
            className="flex items-start gap-4 rounded-lg border border-border/60 bg-card/30 p-5 hover:border-gold/40 hover:bg-card/50 transition group"
          >
            <Icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
            <div>
              <div className="font-display text-base font-semibold group-hover:text-gold transition">{label}</div>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-lg border border-gold/20 bg-gold/5 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Risk Warning:</strong> Trading financial instruments involves substantial
        risk of loss. Past performance does not guarantee future results. Only engage with capital you can afford
        to lose. This platform does not provide personalised investment advice.
      </div>
    </div>
  );
}
