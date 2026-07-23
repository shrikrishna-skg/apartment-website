import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lease Inquiry | Get Pricing for Apartments Near MTSU",
  description:
    "Request current lease pricing and availability for student apartments near MTSU, with individual leasing and flexible terms in Murfreesboro, TN.",
  alternates: { canonical: "/lease-inquiry" },
  openGraph: {
    title: "Lease Inquiry | Apartments Near MTSU Pricing",
    description:
      "Get current lease pricing and availability for student apartments near MTSU in Murfreesboro, TN.",
    url: "/lease-inquiry",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
