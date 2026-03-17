import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resident Reviews | What MTSU Students Say About College Place",
  description:
    "Read real reviews from MTSU students living at College Place Apartments in Murfreesboro, TN. See why students choose our pet-friendly, affordable apartments near campus.",
  alternates: { canonical: "/testimonials" },
  openGraph: {
    title: "Resident Reviews | MTSU Student Housing Reviews",
    description:
      "Real reviews from MTSU students at College Place Apartments. See why students love living near campus in Murfreesboro, TN.",
    url: "/testimonials",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
