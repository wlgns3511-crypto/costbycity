import type { MetadataRoute } from "next";
import { getAllMetros, getTopComparisons } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://costbycity.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const metros = getAllMetros();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/cities`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.9 },
  ];

  const cityPages: MetadataRoute.Sitemap = metros.map((m) => ({
    url: `${SITE_URL}/cities/${m.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Top comparison pages
  const comparisons = getTopComparisons(44000);
  const comparePages: MetadataRoute.Sitemap = comparisons.map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return {
      url: `${SITE_URL}/compare/${a}-vs-${b}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticPages, ...cityPages, ...comparePages];
}
