import type { Metadata } from "next";

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
  return children;
}
