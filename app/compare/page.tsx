import { getAllCitiesWithRPP } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Cost of Living Between Cities",
  description: "Compare cost of living between any two US metro areas. Side-by-side housing, goods, utilities, and income data.",
};

export default function ComparePage() {
  const cities = getAllCitiesWithRPP().slice(0, 50); // Top 50 for display

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Compare Cost of Living</h1>
      <p className="text-slate-600 mb-8">Select two cities to compare cost of living side by side.</p>

      <h2 className="text-xl font-bold mb-4">Popular Comparisons</h2>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {cities.slice(0, 20).map((cityA, i) => {
          const cityB = cities[i + 20] || cities[0];
          const [a, b] = [cityA.slug, cityB.slug].sort();
          return (
            <a key={i} href={`/compare/${a}-vs-${b}`} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-emerald-600 hover:underline">
              {cityA.short_name} vs {cityB.short_name}
            </a>
          );
        })}
      </div>
    </div>
  );
}
