import type { Metadata } from "next";
import { TESTIMONIALS, SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Student Reviews",
  description:
    "Read real reviews from MTSU students living at College Place Apartments in Murfreesboro, TN. See why students choose our pet-friendly, affordable apartments near campus.",
  alternates: { canonical: "/testimonials" },
  openGraph: {
    title: "Student Reviews",
    description:
      "Real reviews from MTSU students at College Place Apartments. See why students love living near campus in Murfreesboro, TN.",
    url: "/testimonials",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const avgRating =
    TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length;

  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: "College Place Apartments",
    url: SITE.url,
    image: SITE.logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: TESTIMONIALS.length,
      reviewCount: TESTIMONIALS.length,
    },
    review: TESTIMONIALS.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: "5",
      },
      reviewBody: t.text,
      publisher: { "@type": "Organization", name: t.source },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Student Reviews",
        item: `${SITE.url}/testimonials`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
