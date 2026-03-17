import type { Metadata } from "next";
import { PROPERTIES } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Floor Plans & Pricing | Apartments Near MTSU from $500/mo",
  description:
    "Browse studio, 1, 2 & 4 bedroom apartment floor plans near MTSU in Murfreesboro, TN. Starting at $500/month with individual leasing, pet-friendly units, free parking, and on-site laundry. Compare layouts and photos.",
  alternates: { canonical: "/properties" },
  openGraph: {
    title: "Floor Plans & Pricing | Student Apartments Near MTSU",
    description:
      "Studio, 1, 2 & 4 bedroom apartments near MTSU from $500/mo. Individual leasing, pet-friendly, free parking in Murfreesboro, TN.",
    url: "/properties",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.collegeplace.us" },
      { "@type": "ListItem", position: 2, name: "Floor Plans & Pricing", item: "https://www.collegeplace.us/properties" },
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
      url: `https://www.collegeplace.us/properties/${p.slug}`,
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
