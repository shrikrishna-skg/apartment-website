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
  return children;
}
