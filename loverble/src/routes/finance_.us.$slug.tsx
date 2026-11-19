import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { AnthropicIpoAntValuation } from "@/components/finance/anthropic-ipo-ant-valuation";
import { BuyUsStocksFromKenya } from "@/components/finance/buy-us-stocks-from-kenya";
import { FinanceComments } from "@/components/finance/finance-comments";
import { FinanceNotesSignup } from "@/components/finance/finance-notes-signup";
import {
  US_ANTHROPIC_IPO_SLUG,
  US_BUY_STOCKS_KE_SLUG,
  financeNoteAbsoluteUrl,
  financeNoteLinkTo,
  getFinanceNoteBySlug,
  listRelatedFinanceNotes,
  type FinanceNote,
} from "@/lib/finance-notes";

const OG_BY_SLUG: Record<string, string> = {
  [US_ANTHROPIC_IPO_SLUG]: "https://www.smartalgosts.com/og/anthropic-ipo-ant-nasdaq.jpg",
  [US_BUY_STOCKS_KE_SLUG]: "https://www.smartalgosts.com/og/buy-us-stocks-from-kenya.jpg",
};

const TOC_BY_SLUG: Record<string, Array<{ href: string; label: string }>> = {
  [US_ANTHROPIC_IPO_SLUG]: [
    { href: "#terms", label: "Deal terms" },
    { href: "#control", label: "Control structure" },
    { href: "#financials", label: "S-1 financials" },
    { href: "#compute", label: "Compute bill" },
    { href: "#valuation", label: "Valuation math" },
    { href: "#scenarios", label: "Scenario model" },
    { href: "#how-to-buy", label: "How to buy (Kenya)" },
    { href: "#calendar", label: "Lock-up calendar" },
    { href: "#sources", label: "Sources" },
  ],
  [US_BUY_STOCKS_KE_SLUG]: [
    { href: "#compare", label: "Hisa vs IBKR" },
    { href: "#steps", label: "Step by step" },
    { href: "#hours", label: "Trading hours (EAT)" },
    { href: "#brokers", label: "Other brokers" },
    { href: "#tradingview", label: "TradingView" },
    { href: "#cost", label: "Total cost" },
    { href: "#faq", label: "FAQ" },
    { href: "#sources", label: "Sources" },
  ],
};

export const Route = createFileRoute("/finance_/us/$slug")({
  loader: ({ params }) => {
    const note = getFinanceNoteBySlug(params.slug);
    if (!note || !note.published || note.region !== "us") throw notFound();
    return note;
  },
  head: ({ loaderData }) => {
    const note = loaderData;
    const url = note ? financeNoteAbsoluteUrl(note) : "https://www.smartalgosts.com/finance";
    const ogImage =
      (note?.slug && OG_BY_SLUG[note.slug]) ||
      (note?.coverImage ? `https://www.smartalgosts.com${note.coverImage}` : "https://www.smartalgosts.com/og-image.jpg");
    return {
      meta: [
        {
          title: `${note?.seoTitle ?? note?.shortTitle ?? "Finance"} — Smart Algo STS`,
        },
        { name: "description", content: note?.description ?? "" },
        { property: "og:site_name", content: "Smart Algos Decision Math" },
        { property: "og:title", content: note?.seoTitle ?? note?.title ?? "Decision Math" },
        { property: "og:description", content: note?.cardBlurb ?? note?.description ?? "" },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:secure_url", content: ogImage },
        { property: "og:image:type", content: "image/jpeg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "627" },
        {
          property: "og:image:alt",
          content: note?.seoTitle ?? "Smart Algos Decision Math",
        },
        { property: "article:published_time", content: note?.dateISO ? `${note.dateISO}T12:00:00+03:00` : undefined },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:title", content: note?.seoTitle ?? note?.title ?? "" },
        { name: "twitter:description", content: note?.cardBlurb ?? note?.description ?? "" },
      ].filter((m) => !("content" in m) || m.content != null),
      links: [{ rel: "canonical", href: url }],
      scripts: note?.jsonLd
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify(note.jsonLd),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.smartalgosts.com/",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Decision Math",
                    item: "https://www.smartalgosts.com/finance",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: note.shortTitle,
                    item: url,
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: UsFinanceNotePage,
});

function ArticleBody({ slug }: { slug: string }) {
  if (slug === US_ANTHROPIC_IPO_SLUG) return <AnthropicIpoAntValuation />;
  if (slug === US_BUY_STOCKS_KE_SLUG) return <BuyUsStocksFromKenya />;
  return null;
}

function UsFinanceNotePage() {
  const note = Route.useLoaderData() as FinanceNote;
  const related = listRelatedFinanceNotes(note.slug, 3);
  const toc = TOC_BY_SLUG[note.slug] ?? [];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-16 md:pt-20 pb-16">
      <Link
        to="/finance"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Decision Math
      </Link>

      <div className="grid lg:grid-cols-[minmax(0,760px)_260px] gap-10 lg:gap-14 items-start">
        <article className="min-w-0 space-y-8">
          <header className="space-y-4 border-b border-border/50 pb-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="text-gold font-medium">US · {note.category}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {note.readingMinutes} min read
              </span>
              <span aria-hidden>·</span>
              <span>{note.date}</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[2.65rem] font-semibold text-foreground leading-[1.15]">
              {note.title}
            </h1>

            <p className="text-base text-foreground/85 leading-relaxed max-w-[65ch]">{note.description}</p>

            <div className="flex flex-wrap gap-2">
              {note.stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold text-gold leading-tight">{s.value}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground rounded-md border border-border/50 bg-card/30 px-3 py-2 max-w-[65ch]">
              Educational research under stated assumptions — not personalized investment, tax, or credit advice.{" "}
              <Link to="/financial-disclaimer" className="text-gold hover:underline">
                Full disclaimer
              </Link>
              .
            </p>

            <p className="text-xs text-muted-foreground">
              By <span className="text-foreground">Smart Algos Research</span> · Smart Algos Investment Solution Ltd
            </p>
          </header>

          <div className="finance-article-body space-y-8 text-foreground">
            <ArticleBody slug={note.slug} />
          </div>

          <section className="rounded-xl border border-gold/25 bg-secondary-surface/70 p-5 md:p-6 space-y-3">
            <h2 className="font-display text-lg font-semibold">Get new notes by email</h2>
            <p className="text-sm text-muted-foreground">
              Decision-math models when we publish — no product spam.
            </p>
            <FinanceNotesSignup />
          </section>

          {related.length > 0 ? (
            <section className="space-y-4 pt-2">
              <h2 className="font-display text-lg font-semibold">Related notes</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={financeNoteLinkTo(r)}
                    params={{ slug: r.slug }}
                    className="rounded-lg border border-border/60 bg-card/20 p-4 hover:border-gold/40 transition-colors"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-gold">{r.category}</p>
                    <p className="text-sm font-medium mt-1 leading-snug">{r.shortTitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <FinanceComments slug={`us/${note.slug}`} />
        </article>

        <aside className="hidden lg:block sticky top-24 space-y-4">
          <div className="rounded-lg border border-border/60 bg-card/30 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Key numbers</p>
            {note.stats.map((s) => (
              <div key={s.label} className="border-t border-border/40 pt-2 first:border-0 first:pt-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
          {toc.length > 0 ? (
            <nav className="rounded-lg border border-border/60 bg-card/30 p-4 space-y-2">
              <p className="text-xs font-medium text-foreground">On this page</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {toc.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-gold">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
