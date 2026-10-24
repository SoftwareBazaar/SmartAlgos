import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileCode2,
  Layers,
  ListChecks,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { company } from "@/lib/mock-data";
import { getSystemsEngine, SYSTEMS_ENGINES } from "@/lib/systems-engines";
import { SystemsDownloadGate } from "@/components/systems/systems-download-gate";

export const Route = createFileRoute("/systems_/$slug")({
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
      {
        property: "og:title",
        content: `${loaderData?.engine.name ?? "Engine"} — ${company.name}`,
      },
      {
        property: "og:description",
        content: loaderData?.engine.summary ?? "",
      },
      {
        property: "og:url",
        content: `https://www.smartalgosts.com/systems/${loaderData?.engine.slug ?? ""}`,
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
      <div className="mx-auto max-w-[1100px] px-6 pt-8 md:pt-10 pb-16">
        <Link
          to="/systems"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All financial systems engines
        </Link>

        {/* Hero */}
        <header className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-gold">{engine.category}</p>
            <h1 className="mt-2 font-display text-[1.85rem] md:text-[2.4rem] font-semibold tracking-tight leading-[1.15]">
              {engine.name}
              <span className="ml-2 align-middle text-base font-normal text-muted-foreground">
                {engine.version}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gold/90 font-medium">{engine.codename}</p>
            <p className="mt-4 text-sm md:text-[15px] text-muted-foreground leading-relaxed max-w-[58ch]">
              {engine.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-md border border-gold/35 bg-gold/10 px-2.5 py-1 font-mono text-[9px] tracking-wider text-gold">
                {engine.status}
              </span>
              <span className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                {engine.audience}
              </span>
              {engine.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border/70 bg-card/40 px-2.5 py-1 text-[11px] text-foreground/85"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#download"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
              >
                <Download className="h-3.5 w-3.5" /> Download reference pack
              </a>
              <Link
                to="/consultation"
                search={{ track: "systems" }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-5 text-xs font-semibold hover:border-gold/50 hover:text-gold transition"
              >
                Book architecture review
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-border/80 bg-[#0d121c] p-5 md:p-6">
            <p className="font-mono text-[9px] tracking-[0.14em] text-gold">PACK CONTENTS</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {engine.files.length} file{engine.files.length === 1 ? "" : "s"} · email unlock below
            </p>
            <ul className="mt-4 space-y-2">
              {engine.files.map((f) => (
                <li
                  key={f.filename}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-black/30 px-3 py-2.5"
                >
                  <FileCode2 className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">{f.label}</span>
                    <span className="block text-[10px] text-muted-foreground font-mono truncate">
                      {f.filename}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className="mt-4 inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg border border-gold/40 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition"
            >
              Unlock downloads <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </aside>
        </header>

        {/* Problem */}
        <section className="mt-12 rounded-2xl border border-border/70 bg-card/20 p-6 md:p-7">
          <div className="flex items-center gap-2 text-gold">
            <ShieldAlert className="h-4 w-4" />
            <p className="font-mono text-[9px] tracking-[0.14em]">THE PROBLEM IT ADDRESSES</p>
          </div>
          <p className="mt-3 text-sm md:text-[15px] text-foreground/90 leading-relaxed max-w-[70ch]">
            {engine.problem}
          </p>
        </section>

        {/* How it works */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="h-4 w-4 text-gold" />
            <h2 className="font-display text-lg md:text-xl font-semibold tracking-tight">How it works</h2>
          </div>
          <ol className="grid md:grid-cols-2 gap-3">
            {engine.howItWorks.map((step, i) => (
              <li
                key={step}
                className="rounded-xl border border-border/70 bg-[#0d121c]/80 p-4 flex gap-3"
              >
                <span className="font-mono text-[10px] text-gold shrink-0 mt-0.5">0{i + 1}</span>
                <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* I/O */}
        <section className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card/20 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-gold" />
              <h2 className="text-base font-semibold tracking-tight">Inputs</h2>
            </div>
            <ul className="space-y-2">
              {engine.inputs.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-gold mt-1.5">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/20 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-4 w-4 text-gold" />
              <h2 className="text-base font-semibold tracking-tight">Outputs</h2>
            </div>
            <ul className="space-y-2">
              {engine.outputs.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-gold mt-1.5">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mt-8">
          <h2 className="font-display text-lg md:text-xl font-semibold tracking-tight mb-4">
            Capabilities in this pack
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {engine.capabilities.map((c) => (
              <div
                key={c}
                className="rounded-xl border border-border/70 bg-[#0d121c]/60 px-4 py-3.5 text-sm text-foreground/90"
              >
                <span className="text-gold mr-2">—</span>
                {c}
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section className="mt-8 rounded-2xl border border-border/60 bg-secondary-surface/30 p-5 md:p-6">
          <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">LIMITATIONS · READ BEFORE USE</p>
          <ul className="mt-3 space-y-2">
            {engine.limitations.map((l) => (
              <li key={l} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="text-gold/70 mt-1.5">·</span>
                {l}
              </li>
            ))}
          </ul>
        </section>

        {/* Download */}
        <section className="mt-10">
          <SystemsDownloadGate engine={engine} />
        </section>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
            Back to all engines
          </Link>
        </div>

        {others.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-8">
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground mb-4">
              OTHER REFERENCE ENGINES
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {others.map((e) => (
                <Link
                  key={e.slug}
                  to="/systems/$slug"
                  params={{ slug: e.slug }}
                  className="rounded-xl border border-border/70 bg-card/20 p-5 hover:border-gold/40 transition group"
                >
                  <p className="font-mono text-[8px] tracking-wider text-gold">{e.category}</p>
                  <h3 className="mt-1.5 text-base font-semibold group-hover:text-gold transition-colors">
                    {e.name} <span className="text-muted-foreground font-normal text-sm">{e.version}</span>
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{e.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                    View details <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
