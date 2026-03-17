import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lease Inquiry | Get Pricing for Apartments Near MTSU",
  description:
    "Request lease pricing and availability for student apartments near MTSU. Individual leasing from $500/mo, flexible 6–18 month terms, and move-in specials in Murfreesboro, TN.",
  alternates: { canonical: "/lease-inquiry" },
  openGraph: {
    title: "Lease Inquiry | Apartments Near MTSU Pricing",
    description:
      "Get lease pricing and availability for student apartments near MTSU. Individual leasing from $500/mo in Murfreesboro, TN.",
    url: "/lease-inquiry",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
