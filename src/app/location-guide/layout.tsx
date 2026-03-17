import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location Guide | How Close Are We to MTSU Campus?",
  description:
    "College Place Apartments is just 0.4 miles from MTSU — an 8-minute walk or 2-minute drive. Explore nearby restaurants, grocery stores, pharmacies, and campus landmarks in Murfreesboro, TN.",
  alternates: { canonical: "/location-guide" },
  openGraph: {
    title: "Location Guide | Apartments 0.4 Miles from MTSU",
    description:
      "Just 0.4 miles from MTSU campus. Explore nearby dining, shopping, and campus landmarks around College Place Apartments in Murfreesboro.",
    url: "/location-guide",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
