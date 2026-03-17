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
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/staff/", "/website-app/", "/maintenance"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/api/", "/staff/", "/website-app/"],
      },
    ],
    sitemap: "https://www.collegeplace.us/sitemap.xml",
    host: "https://www.collegeplace.us",
  };
}
