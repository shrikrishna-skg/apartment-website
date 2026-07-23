import type { Metadata } from "next";
import { SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Move-In Guide | Everything You Need for Moving to MTSU Apartments",
  description:
    "Complete move-in checklist and guide for new residents at College Place Apartments near MTSU. What to bring, utility setup, key pickup, parking info, and first-week tips for Murfreesboro, TN.",
  alternates: { canonical: "/move-in-guide" },
  openGraph: {
    title: "Move-In Guide | MTSU Apartment Move-In Checklist",
    description:
      "Everything you need for move-in day at College Place Apartments near MTSU. Checklist, utility setup, and first-week tips.",
    url: "/move-in-guide",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Move-In Guide", item: `${SITE.url}/move-in-guide` },
    ],
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Move Into College Place Apartments Near MTSU",
    description: "Step-by-step guide for new residents moving into College Place Apartments in Murfreesboro, TN.",
    step: [
      { "@type": "HowToStep", name: "Apply & Sign Lease", text: "Complete your rental application and sign your lease agreement." },
      { "@type": "HowToStep", name: "Pay Deposits", text: "Pay your security deposit and first month's rent." },
      { "@type": "HowToStep", name: "Set Up Utilities", text: "Arrange utility transfers for electric and gas. Internet is included." },
      { "@type": "HowToStep", name: "Schedule Move-In", text: "Confirm your move-in date and time with the leasing office." },
      { "@type": "HowToStep", name: "Pick Up Keys", text: "Visit the office on move-in day to collect keys and access cards." },
      { "@type": "HowToStep", name: "Complete Inspection", text: "Walk through your unit, document condition, and submit your move-in inspection form." },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      {children}
    </>
  );
}
