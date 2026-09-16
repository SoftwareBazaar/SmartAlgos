import { createFileRoute } from "@tanstack/react-router";
import { ClientPortal } from "@/components/client-portal";

type PortalSearch = {
  tab?: string;
  ref?: string;
};

export const Route = createFileRoute("/portal")({
  validateSearch: (search: Record<string, unknown>): PortalSearch => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Client Portal — Smart Algos Capital" },
      { name: "description", content: "Client and investor portal for prop allocations, sandbox backtests, and unlocked strategy files." },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { tab, ref } = Route.useSearch();
  return <ClientPortal initialTab={tab} initialRef={ref} />;
}
