import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | College Place Apartments Murfreesboro, TN",
  description:
    "Get in touch with College Place Apartments near MTSU. Call (615) 200-0620, email office@collegeplace.us, or visit us at 1023 Old Lascassas Rd, Murfreesboro, TN 37130. Office open Mon–Sat 9am–5pm.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact College Place Apartments | Murfreesboro, TN",
    description:
      "Call (615) 200-0620 or visit us at 1023 Old Lascassas Rd, Murfreesboro, TN. Student apartments near MTSU. Open Mon–Sat 9–5.",
    url: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
