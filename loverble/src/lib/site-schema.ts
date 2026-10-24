import { company } from "@/lib/mock-data";

const SITE = "https://www.smartalgosts.com";

/** Sitewide Schema.org graph for Organization, LocalBusiness, and Service. */
export function getSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: company.name,
        legalName: company.operator,
        url: SITE,
        logo: `${SITE}/apple-touch-icon.png`,
        email: company.emails.info,
        sameAs: [],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: company.emails.support,
            areaServed: "KE",
            availableLanguage: ["en"],
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: company.emails.desk,
            areaServed: "KE",
            availableLanguage: ["en"],
          },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE}/#localbusiness`,
        name: company.operator,
        image: `${SITE}/apple-touch-icon.png`,
        url: SITE,
        email: company.emails.info,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Embu",
          addressCountry: "KE",
        },
        areaServed: [
          { "@type": "Country", name: "Kenya" },
          { "@type": "Continent", name: "Africa" },
        ],
        parentOrganization: { "@id": `${SITE}/#organization` },
        priceRange: "$$",
      },
      {
        "@type": "Service",
        "@id": `${SITE}/#service-financial-systems`,
        name: "Financial Systems Architecture",
        serviceType: "Core banking and SACCO software consulting",
        description:
          "Cloud-native core banking and SACCO software concepts, reference engines, and architecture reviews for banks, SACCOs, and digital finance teams.",
        provider: { "@id": `${SITE}/#organization` },
        areaServed: "KE",
        url: `${SITE}/systems`,
      },
      {
        "@type": "Service",
        "@id": `${SITE}/#service-quant-research`,
        name: "Quantitative Research & Strategy Desk",
        serviceType: "Quantitative research and consultation",
        description:
          "Systematic trading research, strategy documentation, Excel quant models, and booked architecture or strategy desk sessions.",
        provider: { "@id": `${SITE}/#organization` },
        areaServed: "KE",
        url: `${SITE}/strategies`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: company.name,
        description: company.tagline,
        publisher: { "@id": `${SITE}/#organization` },
        inLanguage: "en",
      },
    ],
  };
}
