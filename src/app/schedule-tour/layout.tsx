import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule a Tour | Visit Our Apartments Near MTSU Today",
  description:
    "Book a free in-person or virtual tour of College Place Apartments near MTSU. See studios, 1, 2 & 4 bedroom units in Murfreesboro, TN. Same-day tours available Monday–Saturday.",
  alternates: { canonical: "/schedule-tour" },
  openGraph: {
    title: "Schedule a Tour | Visit Our Apartments Near MTSU",
    description:
      "Book a free tour of our student apartments near MTSU. Same-day tours available Monday–Saturday in Murfreesboro, TN.",
    url: "/schedule-tour",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
