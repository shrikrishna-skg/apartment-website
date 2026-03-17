import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Virtual Tours | Walk Through MTSU Apartments Online",
  description:
    "Take immersive Matterport 3D virtual tours of our apartments near MTSU. Explore studio, 1-bedroom, 2-bedroom, and 4-bedroom floor plans from anywhere. See every room before you visit in person.",
  alternates: { canonical: "/virtual-tour" },
  openGraph: {
    title: "3D Virtual Tours | Walk Through MTSU Apartments Online",
    description:
      "Explore our Murfreesboro apartments with immersive 3D Matterport tours. Walk through every floor plan from your phone or computer.",
    url: "/virtual-tour",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
