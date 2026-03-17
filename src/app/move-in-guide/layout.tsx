import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Move-In Guide | Everything You Need for Moving to MTSU Apartments",
  description:
    "Complete move-in checklist and guide for new residents at College Place Apartments near MTSU. What to bring, utility setup, key pickup, parking info, and first-week tips for Murfreesboro, TN.",
  alternates: { canonical: "/move-in-guide" },
  openGraph: {
    title: "Move-In Guide | MTSU Apartment Move-In Checklist",
    description:
      "Everything you need for move-in day at College Place Apartments near MTSU. Checklist, utility setup, and first-week tips.",
    url: "/move-in-guide",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
