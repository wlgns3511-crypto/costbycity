import { getMetroBySlug, getTopComparisons } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Cost of Living Between Cities",
  description: "Compare cost of living between any two US metro areas. Side-by-side housing, goods, utilities, and income data.",
  alternates: { canonical: "/compare/" },
  openGraph: { title: "Compare Cost of Living Between Cities", description: "Compare cost of living between any two US metro areas. Side-by-side housing, goods, utilities, and income data.", url: "/compare/" },
};

export default function ComparePage() {
  const comparisons = getTopComparisons(20)
    .map(({ slugA, slugB }) => {
      const cityA = getMetroBySlug(slugA);
      const cityB = getMetroBySlug(slugB);
      if (!cityA || !cityB) return null;
      return {
        href: `/compare/${slugA}-vs-${slugB}`,
        label: `${cityA.short_name} vs ${cityB.short_name}`,
      };
    })
    .filter((item): item is { href: string; label: string } => item !== null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Compare Cost of Living</h1>
      <p className="text-slate-600 mb-8">Select two cities to compare cost of living side by side.</p>

      <h2 className="text-xl font-bold mb-4">Popular Comparisons</h2>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {comparisons.map((item) => {
          return (
            <a key={item.href} href={item.href} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-emerald-600 hover:underline">
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
