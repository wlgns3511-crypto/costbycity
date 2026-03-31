import { getMetrosByState } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Cities - Cost of Living Data",
  description: "Browse cost of living data for 380+ US metro areas organized by state.",
  alternates: { canonical: "/cities/" },
  openGraph: { title: "All Cities - Cost of Living Data", description: "Browse cost of living data for 380+ US metro areas organized by state.", url: "/cities/" },
};

export default function CitiesPage() {
  const byState = getMetrosByState();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">All Cities</h1>
      <p className="text-slate-600 mb-8">Cost of living data by US metropolitan area.</p>
      {Object.entries(byState)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([state, metros]) => (
          <section key={state} className="mb-6">
            <h2 className="text-lg font-semibold text-emerald-800 mb-2">{state}</h2>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              {metros.map((m) => (
                <a key={m.fips} href={`/cities/${m.slug}`} className="py-1 text-slate-700 hover:text-emerald-600 hover:underline">
                  {m.short_name}
                </a>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
