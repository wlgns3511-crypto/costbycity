import type { MetadataRoute } from "next";
import { getAllMetros, getAllStates, getComparisonCount, getComparisonsPage } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://costbycity.com";
const MAX_PER_SITEMAP = 45000;

export async function generateSitemaps() {
  const totalComparisons = getComparisonCount();
  const sitemapCount = Math.ceil(totalComparisons / MAX_PER_SITEMAP) + 1;
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  if (id === 0) {
    // Static + metros + states + blog
    const now = new Date();
    const metros = getAllMetros();
    const states = getAllStates();
    const posts = getAllPosts();

    return [
      { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
      { url: `${SITE_URL}/cities/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
      { url: `${SITE_URL}/compare/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
      { url: `${SITE_URL}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...metros.map((m) => ({
        url: `${SITE_URL}/cities/${m.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...states.map((s) => ({
        url: `${SITE_URL}/state/${s.toLowerCase()}/`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  }

  // Sitemap 1+: city comparison pages
  const offset = (id - 1) * MAX_PER_SITEMAP;
  const comparisons = getComparisonsPage(offset, MAX_PER_SITEMAP);
  return comparisons.map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return {
      url: `${SITE_URL}/compare/${a}-vs-${b}/`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });
}
