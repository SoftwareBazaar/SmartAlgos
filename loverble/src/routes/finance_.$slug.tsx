import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Day01CreditCardMinimumPaymentDecay } from "@/components/finance/day-01-credit-card-minimum-payment-decay";
import { FinanceComments } from "@/components/finance/finance-comments";
import { DAY_01_SLUG, getFinanceNoteBySlug } from "@/lib/finance-notes";

export const Route = createFileRoute("/finance_/$slug")({
  loader: ({ params }) => {
    const note = getFinanceNoteBySlug(params.slug);
    if (!note || !note.published) throw notFound();
    return note;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.shortTitle ?? "Finance"} — Smart Algos Capital`,
      },
      { name: "description", content: loaderData?.description ?? "" },
      {
        property: "og:title",
        content: loaderData?.title ?? "Finance Systems",
      },
      { property: "og:description", content: loaderData?.description ?? "" },
      {
        property: "og:url",
        content: `https://www.smartalgosts.com/finance/${loaderData?.slug ?? ""}`,
      },
      { property: "og:type", content: "article" },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://www.smartalgosts.com/finance/${loaderData?.slug ?? ""}`,
      },
    ],
    scripts: loaderData?.jsonLd
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(loaderData.jsonLd),
          },
        ]
      : [],
  }),
  component: FinanceNotePage,
});

function FinanceNotePage() {
  const note = Route.useLoaderData();

  return (
    <PageShell
      eyebrow={`Day ${note.day} · Smart Algorithmic Financial Systems`}
      title={note.shortTitle}
      description={`${note.date} · Educational systems note`}
      actions={
        <Link
          to="/finance"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Finance notes
        </Link>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(note.jsonLd) }}
      />
      <article className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-gold" />
          <span>Published</span>
          <span>Day {note.day}</span>
        </div>
        <h2 className="font-display text-lg md:text-xl font-semibold text-foreground leading-snug">
          {note.title}
        </h2>
        {note.slug === DAY_01_SLUG ? <Day01CreditCardMinimumPaymentDecay /> : null}
      </article>
      <FinanceComments slug={note.slug} />
    </PageShell>
  );
}
