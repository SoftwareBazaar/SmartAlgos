import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell, SectionCard } from "@/components/page-shell";
import { strategies, verificationSources } from "@/lib/mock-data";
import { fetchCapitalPerformance } from "@/lib/performance-api";
import { ExternalLink, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Track Record — Smart Algos Capital" },
      {
        name: "description",
        content:
          "Third-party verified strategy track records. Live QuantConnect feeds appear here when configured — no illustrative curves labeled as verified.",
      },
    ],
  }),
  component: Performance,
});

function Performance() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["capital-performance"],
    queryFn: fetchCapitalPerformance,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const liveFromApi = data && !data.illustrative;
  const liveStrategies = strategies.filter((s) => s.status === "Live");
  const apiStrategies = data?.strategies ?? [];
  const sources = data?.verificationSources?.length ? data.verificationSources : verificationSources;

  return (
    <PageShell
      eyebrow="Track Record"
      title="Track Record"
      description="We only show verified third-party performance here. Until a live QuantConnect feed is connected, this page stays honest and empty of illustrative curves."
    >
      {isLoading && (
        <p className="text-sm text-muted-foreground">Checking for a live performance feed…</p>
      )}

      {liveFromApi && data ? (
        <>
          <SectionCard title="Live composite" subtitle={`Updated ${new Date(data.updatedAt).toLocaleString()}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sharpe</div>
                <div className="font-mono text-lg mt-1">{data.metrics.sharpe.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Max drawdown</div>
                <div className="font-mono text-lg mt-1">{(data.metrics.maxDrawdown * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Win rate</div>
                <div className="font-mono text-lg mt-1">{(data.metrics.winRate * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Profit factor</div>
                <div className="font-mono text-lg mt-1">{data.metrics.profitFactor.toFixed(2)}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Metrics from the configured capital performance API. Equity curve embedding from QuantConnect will replace summary cards when listings are linked.
            </p>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Live record status" subtitle="No verified feed published yet">
          <div className="max-w-[70ch] space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Live track record begins when strategy listings are published on QuantConnect and linked from this site.
              We will not show illustrative or placeholder equity curves next to the word “verified.”
            </p>
            {(isError || data?.illustrative) && (
              <p>
                The performance API is not returning a live feed right now. That is expected until third-party URLs are
                configured — visitors will see this honest state instead of mock charts.
              </p>
            )}
            <p>
              Third-party platform:{" "}
              <a
                href="https://www.quantconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline inline-flex items-center gap-1"
              >
                QuantConnect <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </p>
            <p>
              Strategy detail pages:{" "}
              <Link to="/strategies" className="text-gold hover:underline">
                Strategies catalog
              </Link>
            </p>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Strategies awaiting public listings" subtitle="Status from the catalog">
        <div className="space-y-3">
          {(apiStrategies.length > 0 ? apiStrategies : liveStrategies.map((s) => ({
            slug: s.slug,
            name: s.name,
            status: s.status,
            platform: s.platform,
            verificationUrl: s.verificationUrl ?? "https://www.quantconnect.com",
            hasDirectLink: false,
          }))).map((s) => (
            <div
              key={s.slug}
              className="flex flex-wrap items-center gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-[180px]">
                <Link to="/strategies/$slug" params={{ slug: s.slug }} className="font-medium text-sm hover:text-gold">
                  {s.name}
                </Link>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.platform} · {s.status}
                </div>
              </div>
              <a
                href={s.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                {s.hasDirectLink ? "View listing" : "QuantConnect"} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Verification" subtitle="Third-party platforms" action={<ShieldCheck className="h-5 w-5 text-gold" />}>
        <div className="grid sm:grid-cols-3 gap-3">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-sm border border-border bg-card/30 px-4 py-3 hover:border-gold/40 transition"
            >
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <span
                  className={`text-[10px] uppercase tracking-wider ${
                    s.status === "Connected" ? "text-bull" : "text-muted-foreground"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 max-w-[70ch]">
          Past results are not indicative of future returns. Educational research and strategy discussion only — not a
          licensed investment adviser.
        </p>
      </SectionCard>
    </PageShell>
  );
}
