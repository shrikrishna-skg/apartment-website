import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Life Hub | MTSU Off-Campus Living Tips & Guides",
  description:
    "Tips, guides, and local insights for MTSU students living off campus in Murfreesboro, TN. Apartment hunting advice, budgeting tips, roommate guides, and the best local spots near campus.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Student Life Hub | MTSU Off-Campus Living Tips & Guides",
    description:
      "Everything MTSU students need to know about off-campus life in Murfreesboro — apartment tips, budgeting, roommates, and local guides.",
    url: "/blog",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.collegeplace.us" },
      { "@type": "ListItem", position: 2, name: "Student Life Hub", item: "https://www.collegeplace.us/blog" },
    ],
  };

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Student Life Hub",
    description: "Tips, guides, and local insights for MTSU students living off campus in Murfreesboro, TN.",
    url: "https://www.collegeplace.us/blog",
    publisher: {
      "@type": "Organization",
      name: "College Place Apartments",
      url: "https://www.collegeplace.us",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      {children}
    </>
  );
}
