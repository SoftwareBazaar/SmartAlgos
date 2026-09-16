import { createFileRoute } from "@tanstack/react-router";
import { ConsultationPageContent } from "@/components/consultation-page";

const SHARE_URL = "https://www.smartalgosts.com/book";
const SHARE_TITLE = "Book a Free 20-Min Advisory Session — Smart Algos Capital";
const SHARE_DESC =
  "Pick your topic and a time (7–9 PM EAT). Free intro consultation with our quant desk — meeting link by email.";

/** Short share link — same booking page as /consultation, no app sidebar. */
export const Route = createFileRoute("/book")({
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
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/consultation" }],
  }),
  component: Book,
});

function Book() {
  return <ConsultationPageContent />;
}
