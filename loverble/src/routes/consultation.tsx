import { createFileRoute } from "@tanstack/react-router";
import { ConsultationPageContent } from "@/components/consultation-page";

const SHARE_URL = "https://www.smartalgosts.com/consultation";
const SHARE_TITLE = "Book a Strategy Desk Session — Smart Algos Capital";
const SHARE_DESC =
  "Free 20-minute intro or optional 90-minute deep-dive. Daily 7–9 PM EAT. Educational research discussion — not investment advice.";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: SHARE_TITLE },
      { name: "description", content: SHARE_DESC },
      { property: "og:title", content: SHARE_TITLE },
      { property: "og:description", content: SHARE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SHARE_URL },
      { property: "og:image", content: "https://www.smartalgosts.com/apple-touch-icon.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: SHARE_TITLE },
      { name: "twitter:description", content: SHARE_DESC },
    ],
    links: [{ rel: "canonical", href: SHARE_URL }],
  }),
  component: Consultation,
});

function Consultation() {
  return <ConsultationPageContent />;
}
