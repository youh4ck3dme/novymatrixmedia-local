import type { MetadataRoute } from "next";

import { getAllPublicSlugs } from "@/lib/wp-queries";
import { getPublicSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  const slugs = await getAllPublicSlugs();
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/reakcie`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...slugs.map((slug) => ({
      url: `${siteUrl}/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
