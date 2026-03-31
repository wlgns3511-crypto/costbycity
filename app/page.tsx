import type { Metadata } from "next";
import { getMostExpensiveCities, getCheapestCities, getAllCitiesWithRPP, getAllStates } from "@/lib/db";
import { formatIndex, formatPctDiffShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "CostByCity — Cost of Living Comparison by US City",
  description: "Compare cost of living across 387+ US metro areas. Housing, groceries, utilities, transportation — powered by Bureau of Economic Analysis data.",
  alternates: { canonical: "/" },
  openGraph: { title: "CostByCity — Cost of Living Comparison", description: "Compare cost of living across 387+ US metro areas with BEA data.", url: "/" },
};

export default function Home() {
  const expensive = getMostExpensiveCities(10);
  const cheapest = getCheapestCities(10);
  const allCities = getAllCitiesWithRPP();
  const states = getAllStates();

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-3">Cost of Living by US City</h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Compare cost of living across {allCities.length}+ US metro areas.
          Housing, goods, utilities, and services — powered by Bureau of Economic Analysis data.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-red-700">Most Expensive Cities</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {expensive.map((city, i) => (
              <a
                key={city.fips}
                href={`/cities/${city.slug}`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {city.short_name}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {formatPctDiffShort(city.rpp_all)}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-green-700">Most Affordable Cities</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {cheapest.map((city, i) => (
              <a
                key={city.fips}
                href={`/cities/${city.slug}`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {city.short_name}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {formatPctDiffShort(city.rpp_all)}
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Browse by State</h2>
        <div className="flex flex-wrap gap-2">
          {states.map((s) => (
            <a
              key={s}
              href={`/state/${s.toLowerCase()}`}
              className="px-3 py-1 rounded-full text-sm border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
            >
              {s}
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">All Cities</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 text-sm">
          {allCities.map((city) => (
            <div key={city.fips} className="mb-1">
              <a href={`/cities/${city.slug}`} className="text-slate-600 hover:text-emerald-600 hover:underline">
                {city.short_name}
              </a>
              <span className={`ml-1 text-xs ${city.rpp_all > 100 ? 'text-red-400' : 'text-green-400'}`}>
                {formatPctDiffShort(city.rpp_all)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
