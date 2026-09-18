import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, SectionCard } from "@/components/page-shell";
import { useSubscription } from "@/hooks/use-subscription";
import { clearStoredSubscription, getStoredSubscription, hasLiveAccess } from "@/lib/subscription-access";
import { supabase } from "@/integrations/supabase/client";
import { researchPapers, strategies } from "@/lib/mock-data";
import { BookOpen, FlaskConical, LogOut, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Smart Algos Capital" },
      { name: "description", content: "Subscriber portal for research and strategy access." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { tier, tierLabel, email, expiresAt, loading, hasAccess, syncAfterLogin } = useSubscription();
  const [signedIn, setSignedIn] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const stored = getStoredSubscription();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      const isIn = Boolean(data.session);
      setSignedIn(isIn);
      if (!isIn) return;
      setSyncing(true);
      try {
        await syncAfterLogin();
      } catch {
        // Non-fatal — local/payment cache may still apply
      } finally {
        if (!cancelled) setSyncing(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [syncAfterLogin]);

  const accessiblePapers = researchPapers.filter((p) => p.published);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    setSignedIn(false);
  }

  return (
    <PageShell
      eyebrow="Subscriber Portal"
      title="My Account"
      description="Your research subscription, purchases, and unlocked content."
      actions={
        signedIn ? (
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        ) : (
          <Link to="/auth" className="text-xs uppercase tracking-wider text-gold hover:underline">
            Sign in
          </Link>
        )
      }
    >
      <div className="grid sm:grid-cols-3 gap-4">
        <SectionCard title="Current plan">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <div>
              <div className="font-display text-xl font-semibold">{loading ? "…" : tierLabel}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {email || "No email on file"}
                {expiresAt && (
                  <span> · expires {new Date(expiresAt).toLocaleDateString()}</span>
                )}
                {syncing && <span> · syncing…</span>}
              </div>
            </div>
          </div>
          {tier === "free" && (
            <Link to="/research" className="mt-4 inline-block text-sm text-gold hover:underline">
              Upgrade subscription →
            </Link>
          )}
        </SectionCard>

        <SectionCard title="Latest purchase">
          {stored ? (
            <div className="text-sm space-y-1">
              <div><span className="text-muted-foreground">Reference:</span> <span className="font-mono text-xs">{stored.reference}</span></div>
              <div><span className="text-muted-foreground">Purchased:</span> {new Date(stored.purchasedAt).toLocaleDateString()}</div>
              <div><span className="text-muted-foreground">Expires:</span> {new Date(stored.expiresAt).toLocaleDateString()}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active Paystack subscription in this browser.</p>
          )}
        </SectionCard>

        <SectionCard title="Quick links">
          <ul className="text-sm space-y-2">
            <li><Link to="/portal" className="text-gold hover:underline">Client portal</Link></li>
            <li><Link to="/research" className="text-gold hover:underline">Research library</Link></li>
            <li><Link to="/strategies" className="text-gold hover:underline">Strategy catalog</Link></li>
            <li><Link to="/performance" className="text-gold hover:underline">Performance</Link></li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Unlocked research" subtitle={`${accessiblePapers.length} of ${researchPapers.length} papers available`}>
        <div className="space-y-2">
          {accessiblePapers.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-sm border border-border/60 px-4 py-3">
              <BookOpen className="h-4 w-4 text-gold shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.id} · {p.tier === "free" ? "Free" : "Premium"}</div>
              </div>
              <Link to="/research/$slug" params={{ slug: p.slug }} className="text-xs text-gold hover:underline">Open</Link>
            </div>
          ))}
          {accessiblePapers.length === 0 && (
            <p className="text-sm text-muted-foreground">The first free note is on the Research page. Paid notebooks appear here when files are published.</p>
          )}
        </div>
      </SectionCard>

      {hasLiveAccess(tier) && (
        <SectionCard title="Live strategy access" subtitle="Rules summaries and research context for live models">
          <div className="grid sm:grid-cols-2 gap-3">
            {strategies.filter((s) => s.status === "Live").map((s) => (
              <Link
                key={s.slug}
                to="/strategies/$slug"
                params={{ slug: s.slug }}
                className="rounded-sm border border-border bg-card/30 p-4 hover:border-gold/40 transition"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-gold" />
                  <span className="font-medium text-sm">{s.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.thesis}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {import.meta.env.DEV && stored && (
        <button
          onClick={() => {
            clearStoredSubscription();
            toast.message("Cleared local subscription (dev only)");
            window.location.reload();
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear local subscription (dev)
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        Strategy file downloads and prop allocations live in the{" "}
        <Link to="/portal" className="text-gold hover:underline">client portal</Link>
        .{" "}
        <a href="mailto:softwarebazaar.ke@gmail.com" className="text-gold hover:underline inline-flex items-center gap-1">
          Contact support <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </PageShell>
  );
}
