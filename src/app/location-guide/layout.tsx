import type { Metadata } from "next";
import { SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Location Guide | How Close Are We to MTSU Campus?",
  description:
    "College Place Apartments is just 0.4 miles from MTSU — an 8-minute walk or 2-minute drive. Explore nearby restaurants, grocery stores, pharmacies, and campus landmarks in Murfreesboro, TN.",
  alternates: { canonical: "/location-guide" },
  openGraph: {
    title: "Location Guide | Apartments 0.4 Miles from MTSU",
    description:
      "Just 0.4 miles from MTSU campus. Explore nearby dining, shopping, and campus landmarks around College Place Apartments in Murfreesboro.",
    url: "/location-guide",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.collegeplace.us",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Location Guide",
        item: "https://www.collegeplace.us/location-guide",
      },
    ],
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "College Place Apartments",
    description: "Student apartments located 0.4 miles from MTSU campus in Murfreesboro, TN.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.8553144,
      longitude: -86.3648509,
    },
    hasMap: SITE.mapsUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      {children}
    </>
  );
}
