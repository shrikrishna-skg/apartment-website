import type { Metadata } from "next";
import { FAQS } from "@/data/site-data";

export const metadata: Metadata = {
  title: "FAQ | Student Apartment Questions Answered — MTSU Housing",
  description:
    "Frequently asked questions about renting at College Place Apartments near MTSU. Learn about individual leasing, pet policy, parking, utilities, lease terms, and move-in requirements in Murfreesboro, TN.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Student Apartment Questions — MTSU Housing",
    description:
      "Answers to common questions about student apartments near MTSU — leasing, pets, parking, utilities, and move-in requirements.",
    url: "/faq",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.flatMap((cat) =>
      cat.questions.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
