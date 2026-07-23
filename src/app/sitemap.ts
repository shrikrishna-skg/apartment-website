import type { MetadataRoute } from "next";
import { PROPERTIES, BLOG_POSTS, SITE } from "@/data/site-data";

const SITE_URL = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  // ─── High-Priority Pages (conversion-focused) ───
  const highPriority: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/properties`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/schedule-tour`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/apply`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/apply/student`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/apply/general`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/virtual-tour`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/lease-inquiry`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // ─── Content & Informational Pages ───
  const contentPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/testimonials`,
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/location-guide`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/move-in-guide`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/referral`,
      lastModified: new Date("2026-03-27"),
      changeFrequency: "monthly",
      priority: 0.55,
    },
  ];

  // ─── Dynamic Property Pages ───
  const propertyPages: MetadataRoute.Sitemap = PROPERTIES.map((property) => ({
    url: `${SITE_URL}/properties/${property.slug}`,
    lastModified: new Date("2026-03-27"),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ─── Dynamic Blog Post Pages ───
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => {
    const postDate = new Date(post.date);
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: isNaN(postDate.getTime()) ? new Date("2026-03-01") : postDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  // ─── Legal Pages (low priority) ───
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  return [
    ...highPriority,
    ...propertyPages,
    ...contentPages,
    ...blogPages,
    ...legalPages,
  ];
}
