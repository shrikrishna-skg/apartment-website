import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Request | College Place Apartments",
  description:
    "Submit a maintenance request for your apartment at College Place near MTSU. 24/7 emergency support and fast response times for all repair needs in Murfreesboro, TN.",
  alternates: { canonical: "/maintenance" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
