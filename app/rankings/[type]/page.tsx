import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMostExpensiveCities, getCheapestCities, getCheapestHousing, getMostExpensiveHousing } from "@/lib/db";
import { formatIndex, formatPctDiffShort } from "@/lib/format";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RANKINGS: Record<string, {
  title: string; desc: string; color: string; hoverBg: string;
  getter: (n: number) => any[];
  valueKey: string; valueLabel: string;
}> = {
  'most-expensive': {
    title: 'Most Expensive Cities in the US', desc: 'Cities with the highest cost of living.',
    color: 'text-red-600', hoverBg: 'hover:bg-red-50',
    getter: (n) => getMostExpensiveCities(n), valueKey: 'rpp_all', valueLabel: 'Cost Index',
  },
  'most-affordable': {
    title: 'Most Affordable Cities in the US', desc: 'Cities with the lowest cost of living.',
    color: 'text-green-600', hoverBg: 'hover:bg-green-50',
    getter: (n) => getCheapestCities(n), valueKey: 'rpp_all', valueLabel: 'Cost Index',
  },
  'cheapest-housing': {
    title: 'Cities with Cheapest Housing', desc: 'Most affordable housing markets in the US.',
    color: 'text-green-600', hoverBg: 'hover:bg-green-50',
    getter: (n) => getCheapestHousing(n), valueKey: 'housing', valueLabel: 'Housing Index',
  },
  'most-expensive-housing': {
    title: 'Cities with Most Expensive Housing', desc: 'Most expensive housing markets in the US.',
    color: 'text-red-600', hoverBg: 'hover:bg-red-50',
    getter: (n) => getMostExpensiveHousing(n), valueKey: 'housing', valueLabel: 'Housing Index',
  },
};

interface Props { params: Promise<{ type: string }> }

export function generateStaticParams() {
  return Object.keys(RANKINGS).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const r = RANKINGS[type];
  if (!r) return {};
  return { title: r.title, description: r.desc };
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const r = RANKINGS[type];
  if (!r) notFound();

  const cities = r.getter(50);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">{r.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{r.title}</h1>
      <p className="text-slate-600 mb-6">{r.desc}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(RANKINGS).map(([key, val]) => (
          <a key={key} href={`/rankings/${key}`}
            className={`px-3 py-1 rounded-full text-sm border ${key === type ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {val.title.replace(' in the US', '')}
          </a>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="flex justify-between p-3 bg-slate-100 text-sm font-semibold">
          <span>City</span>
          <span>{r.valueLabel}</span>
        </div>
        {cities.map((c, i) => (
          <a key={c.slug} href={`/cities/${c.slug}`}
            className={`flex justify-between items-center p-3 ${r.hoverBg} border-b border-slate-100`}>
            <span className="text-sm">
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {c.short_name}
            </span>
            <span className={`text-sm font-semibold ${r.color}`}>
              {formatIndex((c as Record<string, unknown>)[r.valueKey] as number)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
