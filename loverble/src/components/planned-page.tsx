import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { FutureEcosystem } from "@/components/future-ecosystem";
import { Construction } from "lucide-react";

export function PlannedPage({
  title,
  description,
  phase = "Planning",
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <PageShell
      eyebrow="Future Ecosystem"
      title={title}
      description={description}
      actions={
        <span className="text-xs px-2 py-1 rounded bg-gold/15 text-gold uppercase tracking-wider">{phase}</span>
      }
    >
      <div className="rounded-lg border border-border bg-card/30 p-8 text-center max-w-xl mx-auto">
        <Construction className="h-10 w-10 text-gold mx-auto mb-4" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          This initiative is on our roadmap. We build credibility through research and verified performance first — not by pretending infrastructure already exists.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <FutureEcosystem compact />
    </PageShell>
  );
}
