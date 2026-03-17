import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Friend | Earn Rewards at College Place Apartments",
  description:
    "Refer a friend to College Place Apartments near MTSU and earn rewards. Current residents can earn rental credits when their referral signs a lease in Murfreesboro, TN.",
  alternates: { canonical: "/referral" },
  openGraph: {
    title: "Refer a Friend | Earn Rewards at College Place",
    description:
      "Refer a friend to College Place Apartments near MTSU and earn rental credit rewards when they sign a lease.",
    url: "/referral",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
