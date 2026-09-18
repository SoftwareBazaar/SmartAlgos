import { Link } from "@tanstack/react-router";
import { Lock, Check } from "lucide-react";
import { FREE_NOTE_SLUG } from "@/lib/mock-data";

export function PremiumGate({ items }: { items: string[]; tierId?: string }) {
  return (
    <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
        <Lock className="h-5 w-5 text-gold" />
      </div>
      <h4 className="font-display text-lg font-semibold">Full file not published yet</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        This note is listed as in progress. We are not selling it until a real notebook or PDF is attached.
      </p>
      <ul className="mt-4 space-y-2 text-left max-w-sm mx-auto">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-gold shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        to="/research/$slug"
        params={{ slug: FREE_NOTE_SLUG }}
        className="mt-5 inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-gold text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
      >
        Read the free note instead
      </Link>
    </div>
  );
}
