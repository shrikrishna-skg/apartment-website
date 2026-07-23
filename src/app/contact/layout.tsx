import type { Metadata } from "next";
import { SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Contact & Leasing Office",
  description:
    "Get in touch with College Place Apartments near MTSU. Call (615) 900-0166, email office@collegeplace.us, or visit us at 1002 Old Lascassas Rd, Murfreesboro, TN 37130. Office open Mon-Sat 9am-5pm.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & Leasing Office",
    description:
      "Call (615) 900-0166 or visit us at 1002 Old Lascassas Rd, Murfreesboro, TN. Student apartments near MTSU. Open Mon-Sat 9-5.",
    url: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Contact & Leasing Office", item: `${SITE.url}/contact` },
    ],
  };

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact College Place Apartments",
    description: "Contact page for College Place Apartments near MTSU in Murfreesboro, TN.",
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "College Place Apartments",
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.zip,
        addressCountry: "US",
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      {children}
    </>
  );
}
