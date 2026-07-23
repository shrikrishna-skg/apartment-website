import type { Metadata } from "next";
import { SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Schedule a Tour",
  description:
    "Book a free in-person or virtual tour of College Place Apartments near MTSU. See studios, 1, 2 & 4 bedroom units in Murfreesboro, TN. Same-day tours available Monday-Saturday.",
  alternates: { canonical: "/schedule-tour" },
  openGraph: {
    title: "Schedule a Tour",
    description:
      "Book a free tour of our student apartments near MTSU. Same-day tours available Monday-Saturday in Murfreesboro, TN.",
    url: "/schedule-tour",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Schedule a Tour", item: `${SITE.url}/schedule-tour` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
