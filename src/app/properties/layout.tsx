import type { Metadata } from "next";
import { PROPERTIES, SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Floor Plans & Pricing Near MTSU",
  description:
    "Compare studio, one-, two-, and four-bedroom floor plans near MTSU with individual leasing, pet-friendly options, free parking, and on-site laundry. Contact leasing for current pricing and availability.",
  alternates: { canonical: "/properties" },
  openGraph: {
    title: "Floor Plans & Pricing Near MTSU",
    description:
      "Compare student apartment layouts near MTSU and contact leasing for current pricing and availability.",
    url: "/properties",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Floor Plans & Pricing", item: `${SITE.url}/properties` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Available Apartments Near MTSU",
    description: "Browse all apartment floor plans and pricing near MTSU campus.",
    numberOfItems: PROPERTIES.length,
    itemListElement: PROPERTIES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE.url}/properties/${p.slug}`,
      image: p.image,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {children}
    </>
  );
}
