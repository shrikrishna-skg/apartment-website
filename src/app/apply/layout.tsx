import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply Now | Rent an Apartment Near MTSU in Murfreesboro",
  description:
    "Apply online for student apartments near MTSU. Fast approval, individual leasing, and flexible lease terms from 6–18 months. Studios from $600/mo, 4-bedrooms from $500/mo in Murfreesboro, TN.",
  alternates: { canonical: "/apply" },
  openGraph: {
    title: "Apply Now | Rent an Apartment Near MTSU",
    description:
      "Quick online application for student apartments near MTSU. Individual leasing, flexible terms, fast approval.",
    url: "/apply",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
