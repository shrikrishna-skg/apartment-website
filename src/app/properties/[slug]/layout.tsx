import type { Metadata } from "next";
import { PROPERTIES, SITE } from "@/data/site-data";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = PROPERTIES.find((p) => p.slug === slug);

  if (!property) {
    return { title: "Property Not Found" };
  }

  const priceRange = property.floorPlans.length
    ? `$${Math.min(...property.floorPlans.map((f) => f.price))}–$${Math.max(...property.floorPlans.map((f) => f.price))}/mo`
    : `from $${property.startingPrice}/mo`;

  const bedroomTypes = [...new Set(property.floorPlans.map((f) => f.name))].join(", ");

  const title = `${property.name} | ${priceRange} — Apartments Near MTSU`;
  const description = `${property.name} at ${property.address}. ${bedroomTypes} available ${priceRange}. ${property.tags.join(", ")}. ${property.amenities.slice(0, 4).join(", ")}. Near MTSU campus in Murfreesboro, TN.`;

  return {
    title,
    description,
    alternates: { canonical: `/properties/${slug}` },
    openGraph: {
      title,
      description,
      url: `/properties/${slug}`,
      images: property.image ? [{ url: property.image, alt: property.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: property.image ? [property.image] : [],
    },
  };
}

export default async function Layout({ params, children }: Props) {
  const { slug } = await params;
  const property = PROPERTIES.find((p) => p.slug === slug);

  if (!property) return children;

  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: property.name,
    description: property.description,
    url: `${SITE.url}/properties/${slug}`,
    image: property.image,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.split(",")[0],
      addressLocality: "Murfreesboro",
      addressRegion: "TN",
      postalCode: "37130",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    telephone: SITE.phone,
    numberOfAvailableAccommodation: {
      "@type": "QuantitativeValue",
      unitText: "units",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.sqft,
      unitCode: "FTK",
    },
    petsAllowed: property.petPolicy.allowed,
    amenityFeature: property.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
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
        name: "Floor Plans",
        item: `${SITE.url}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.name,
        item: `${SITE.url}/properties/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
