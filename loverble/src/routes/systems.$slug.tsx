import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { company } from "@/lib/mock-data";
import { getSystemsEngine, SYSTEMS_ENGINES } from "@/lib/systems-engines";
import { SystemsDownloadGate } from "@/components/systems/systems-download-gate";

export const Route = createFileRoute("/systems/$slug")({
  loader: ({ params }) => {
    const engine = getSystemsEngine(params.slug);
    if (!engine) throw notFound();
    return { engine };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.engine.name ?? "Engine"} — Financial Systems · ${company.name}`,
      },
      {
        name: "description",
        content: loaderData?.engine.summary ?? "Financial systems reference engine.",
      },
    ],
  }),
  component: SystemsEnginePage,
});

function SystemsEnginePage() {
  const { engine } = Route.useLoaderData();
  const others = SYSTEMS_ENGINES.filter((e) => e.slug !== engine.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[960px] px-6 pt-20 pb-16 space-y-10">
        <Link
          to="/systems"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Financial systems
        </Link>

        <header>
          <p className="font-mono text-[10px] tracking-[0.14em] text-gold">{engine.category}</p>
          <h1 className="mt-2 font-display text-[1.85rem] md:text-[2.35rem] font-semibold tracking-tight leading-snug">
            {engine.name}{" "}
            <span className="text-muted-foreground font-normal text-[0.65em] align-middle">{engine.version}</span>
          </h1>
          <p className="mt-1 text-sm text-gold/90">{engine.codename}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-[62ch]">{engine.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded border border-border px-2 py-1 font-mono text-[9px] tracking-wider text-muted-foreground">
              {engine.status}
            </span>
            <span className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground">
              {engine.audience}
            </span>
            {engine.stack.map((s) => (
              <span key={s} className="rounded border border-gold/25 bg-gold/5 px-2 py-1 text-[11px] text-gold">
                {s}
              </span>
            ))}
          </div>
        </header>

        <section className="grid sm:grid-cols-2 gap-3">
          {engine.capabilities.map((c) => (
            <div key={c} className="rounded-xl border border-border/70 bg-card/25 px-4 py-3.5 text-sm text-foreground/90">
              <span className="text-gold mr-2">—</span>
              {c}
            </div>
          ))}
        </section>

        <SystemsDownloadGate engine={engine} />

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/consultation"
            search={{ track: "systems" }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
          >
            Discuss production scope <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/systems"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-xs font-semibold hover:border-gold/50 hover:text-gold transition"
          >
            All engines
          </Link>
        </div>

        {others.length > 0 && (
          <section className="border-t border-border/60 pt-8">
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground mb-4">RELATED ENGINES</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {others.map((e) => (
                <Link
                  key={e.slug}
                  to="/systems/$slug"
                  params={{ slug: e.slug }}
                  className="rounded-xl border border-border/70 bg-card/20 p-4 hover:border-gold/40 transition"
                >
                  <p className="font-mono text-[8px] tracking-wider text-gold">{e.category}</p>
                  <h3 className="mt-1 text-sm font-semibold">{e.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{e.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
