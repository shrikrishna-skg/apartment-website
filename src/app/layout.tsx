import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import { Analytics } from "@vercel/analytics/next";
import ScrollToTop from "@/components/ScrollToTop";
import { SITE } from "@/data/site-data";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = SITE.url;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "College Place Apartments | Student Housing Near MTSU",
    template: "%s | College Place Apartments",
  },
  description:
    "Explore College Place student apartments near MTSU in Murfreesboro, with studio, one-, two-, and four-bedroom layouts, individual leasing, pet-friendly options, and free parking. Contact the leasing office for current pricing and availability.",
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
    "1 bedroom apartments Murfreesboro",
    "2 bedroom apartments near MTSU",
    "4 bedroom student housing Murfreesboro TN",
    "apartments with free parking Murfreesboro",
    "college apartments Murfreesboro Tennessee",
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
      "Explore student apartments near MTSU with flexible individual leasing, pet-friendly options, and free parking. Contact the leasing office for current pricing and availability.",
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
      "Student apartments near MTSU with individual leasing, pet-friendly options, and free parking. Contact leasing for current pricing and availability.",
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "Real Estate",
  other: {
    "geo.region": "US-TN",
    "geo.placename": "Murfreesboro",
    "geo.position": "35.8553144;-86.3648509",
    "ICBM": "35.8553144, -86.3648509",
  },
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
    description: "Student apartments near MTSU in Murfreesboro, TN, with studio, one-, two-, and four-bedroom floor plans and individual leasing. Contact the leasing office for current pricing and availability.",
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

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "College Place Apartments",
    url: SITE_URL,
    logo: SITE.logo,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      email: SITE.email,
      availableLanguage: ["English"],
      areaServed: "Murfreesboro, TN",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
    sameAs: [SITE.social.instagram, SITE.social.facebook],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "College Place Apartments",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "College Place Apartments",
      logo: { "@type": "ImageObject", url: SITE.logo },
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://qtrypzzcjebvfcihiynt.supabase.co" />
        <link rel="preconnect" href="https://qtrypzzcjebvfcihiynt.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} antialiased font-sans`}>
        <ScrollToTop />
        {isStaffPortal ? (
          <>{children}</>
        ) : (
          <>
            <div className="bg-ambient" />
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
            <ChatWidget />
            <LeadCapturePopup />
          </>
        )}
        <Analytics />
      </body>
    </html>
  );
}
