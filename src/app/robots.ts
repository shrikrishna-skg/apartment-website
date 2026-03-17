import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/staff/",
          "/website-app/",
          "/maintenance",
          "/privacy-policy",
          "/terms",
        ],
      },
    ],
    sitemap: "https://www.collegeplace.us/sitemap.xml",
  };
}
