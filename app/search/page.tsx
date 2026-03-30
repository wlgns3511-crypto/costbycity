import type { Metadata } from "next";
import { searchMetros, getMostExpensiveCities, getCheapestCities } from "@/lib/db";
import { formatIndex, formatPctDiff } from "@/lib/format";

export const metadata: Metadata = {
  title: "Search Cost of Living — US Metro Area Comparisons",
  description: "Search cost of living data for 380+ US metro areas. Compare RPP indexes, housing costs, and income data.",
  alternates: { canonical: "/search" },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchMetros(query, 40) : [];
  const expensive = !query ? getMostExpensiveCities(6) : [];
  const affordable = !query ? getCheapestCities(6) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Search Cost of Living</h1>
      <p className="text-slate-500 mb-6">Find cost of living data for 380+ US metro areas</p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search metro areas (e.g. San Francisco, Chicago...)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
              : `No results found for "${query}"`}
          </h2>
          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((m) => (
                <a
                  key={m.slug}
                  href={`/cities/${m.slug}`}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <div className="font-semibold text-slate-900 mb-1">{m.short_name}</div>
                  <div className="text-xs text-slate-400">{m.state}</div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-lg text-center text-slate-500">
              <p>Try a different city or metro area name.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-slate-700">Most Expensive Metro Areas</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {expensive.map((m) => (
                <a key={m.slug} href={`/cities/${m.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all flex justify-between items-center">
                  <span className="font-medium text-slate-900">{m.short_name}</span>
                  <span className="text-xs text-red-600 font-medium">{formatIndex(m.rpp_all)} ({formatPctDiff(m.rpp_all)} avg)</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-700">Most Affordable Metro Areas</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {affordable.map((m) => (
                <a key={m.slug} href={`/cities/${m.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all flex justify-between items-center">
                  <span className="font-medium text-slate-900">{m.short_name}</span>
                  <span className="text-xs text-green-600 font-medium">{formatIndex(m.rpp_all)} ({formatPctDiff(m.rpp_all)} avg)</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
