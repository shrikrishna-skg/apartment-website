import type { Metadata } from "next";
import { SITE } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Apply Now",
  description:
    "Apply online for student apartments near MTSU with individual leasing and flexible lease terms in Murfreesboro, TN.",
  alternates: { canonical: "/apply" },
  openGraph: {
    title: "Apply Now",
    description:
      "Quick online application for student apartments near MTSU. Individual leasing, flexible terms, fast approval.",
    url: "/apply",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Apply Now", item: `${SITE.url}/apply` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
