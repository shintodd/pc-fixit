import type { MetadataRoute } from "next";
import { ISSUES } from "@/lib/mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pcfix-tech.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const issueUrls: MetadataRoute.Sitemap = Object.keys(ISSUES).map((slug) => ({
    url: `${BASE_URL}/issues/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/troubleshoot`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/wizard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tips`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...issueUrls,
  ];
}
