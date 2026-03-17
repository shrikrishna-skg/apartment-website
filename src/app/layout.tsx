import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { SITE } from "@/data/site-data";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://www.collegeplace.us";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "College Place Apartments | Student Housing Near MTSU in Murfreesboro, TN",
    template: "%s | College Place Apartments",
  },
  description:
    "Affordable student apartments near MTSU starting at $500/mo. Studios, 1, 2 & 4 bedroom floor plans with individual leasing, pet-friendly units, and free parking in Murfreesboro, TN.",
  keywords: [
    "apartments near MTSU",
    "student housing Murfreesboro TN",
    "off-campus housing MTSU",
    "College Place Apartments",
    "Murfreesboro apartments",
    "MTSU apartments",
    "student apartments Murfreesboro",
    "affordable apartments near Middle Tennessee State University",
    "individual lease apartments Murfreesboro",
    "pet-friendly apartments Murfreesboro TN",
    "studio apartments near MTSU",
    "furnished apartments Murfreesboro",
    "apartments near Middle Tennessee State University",
    "cheap apartments Murfreesboro TN",
    "off-campus student living MTSU",
  ],
  authors: [{ name: "College Place Apartments" }],
  creator: "College Place Apartments",
  publisher: "College Place Apartments",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "College Place Apartments",
    title: "College Place Apartments | Student Housing Near MTSU",
    description:
      "Affordable student apartments near MTSU starting at $500/mo. Studios, 1, 2 & 4 bedroom floor plans with individual leasing in Murfreesboro, TN.",
    images: [
      {
        url: SITE.logo,
        width: 800,
        height: 600,
        alt: "College Place Apartments - Student Housing Near MTSU",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "College Place Apartments | Student Housing Near MTSU",
    description:
      "Affordable student apartments near MTSU starting at $500/mo. Individual leasing, pet-friendly, free parking.",
    images: [SITE.logo],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Real Estate",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hide Navbar & Footer for staff portal routes
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isStaffPortal = pathname.startsWith("/website-app");

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: "College Place Apartments",
    description: "Affordable student apartments near MTSU in Murfreesboro, TN. Studios, 1, 2 & 4 bedroom floor plans with individual leasing starting at $500/month.",
    url: SITE_URL,
    logo: SITE.logo,
    image: SITE.logo,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.8553144,
      longitude: -86.3648509,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    sameAs: [SITE.social.instagram, SITE.social.facebook],
    priceRange: "$500 - $900",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Pet-Friendly", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Individual Leasing", value: true },
      { "@type": "LocationFeatureSpecification", name: "High-Speed Internet", value: true },
      { "@type": "LocationFeatureSpecification", name: "On-Site Laundry", value: true },
    ],
    numberOfAvailableAccommodation: {
      "@type": "QuantitativeValue",
      unitText: "units",
    },
    petsAllowed: true,
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased font-sans`}>
        {isStaffPortal ? (
          <>{children}</>
        ) : (
          <>
            <div className="bg-ambient" />
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
            <ChatWidget />
          </>
        )}
      </body>
    </html>
  );
}
