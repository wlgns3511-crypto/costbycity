import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMostExpensiveCities, getCheapestCities, getCheapestHousing, getMostExpensiveHousing,
  getMostExpensiveCitiesInState, getCheapestCitiesInState, getCheapestHousingInState, getMostExpensiveHousingInState,
} from "@/lib/db";
import { formatIndex } from "@/lib/format";
import { itemListSchema, datasetSchema } from "@/lib/schema";
import { stateCodeToSlug } from "@/lib/us-states";

/**
 * 2026-04-23 Step 1b prune — state variants removed.
 *
 * Previously: `/rankings/[type]-in-[state]/` generated 4 × 42 = 168 URLs.
 * Same template as national rankings, just state-filtered. Classic HCU
 * "scaled list template" signal. GSC 28d: zero appearances in top-20
 * pages; avg site pos 32.7, CTR 0.12% — state variants almost certainly
 * dead weight.
 *
 * Kept: 4 national slugs + 2 legacy national aliases. Invalid state-form
 * URLs now return 404. Browse-by-state link block removed.
 *
 * Depth upgrade plan (Step 3c, separate session): fold per-state rankings
 * into `/state/[slug]/` as inline sections so one richer page replaces
 * 4 thin templates. Keeps the data accessible without cardinality bloat.
 *
 * State-filtered getters (…InState) are retained — reused by `/state/[slug]/`.
 */
const RANKING_TYPES = ['most-expensive-cities', 'most-affordable-cities', 'cheapest-housing', 'most-expensive-housing'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RankingDef {
  title: (stateName?: string) => string;
  desc: (stateName?: string) => string;
  color: string;
  hoverBg: string;
  nationalGetter: (n: number) => any[];
  stateGetter: (state: string, n: number) => any[];
  valueKey: string;
  valueLabel: string;
  baseSlug: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RANKINGS: Record<string, RankingDef> = {
  'most-expensive-cities': {
    title: (s) => s ? `Most Expensive Cities in ${s}` : 'Most Expensive Cities in the US',
    desc: (s) => s ? `Cities with the highest cost of living in ${s}.` : 'Cities with the highest cost of living.',
    color: 'text-red-600', hoverBg: 'hover:bg-red-50',
    nationalGetter: (n) => getMostExpensiveCities(n),
    stateGetter: (state, n) => getMostExpensiveCitiesInState(state, n),
    valueKey: 'rpp_all', valueLabel: 'Cost Index', baseSlug: 'most-expensive-cities',
  },
  'most-affordable-cities': {
    title: (s) => s ? `Most Affordable Cities in ${s}` : 'Most Affordable Cities in the US',
    desc: (s) => s ? `Cities with the lowest cost of living in ${s}.` : 'Cities with the lowest cost of living.',
    color: 'text-green-600', hoverBg: 'hover:bg-green-50',
    nationalGetter: (n) => getCheapestCities(n),
    stateGetter: (state, n) => getCheapestCitiesInState(state, n),
    valueKey: 'rpp_all', valueLabel: 'Cost Index', baseSlug: 'most-affordable-cities',
  },
  'cheapest-housing': {
    title: (s) => s ? `Cheapest Housing in ${s}` : 'Cities with Cheapest Housing',
    desc: (s) => s ? `Most affordable housing markets in ${s}.` : 'Most affordable housing markets in the US.',
    color: 'text-green-600', hoverBg: 'hover:bg-green-50',
    nationalGetter: (n) => getCheapestHousing(n),
    stateGetter: (state, n) => getCheapestHousingInState(state, n),
    valueKey: 'housing', valueLabel: 'Housing Index', baseSlug: 'cheapest-housing',
  },
  'most-expensive-housing': {
    title: (s) => s ? `Most Expensive Housing in ${s}` : 'Cities with Most Expensive Housing',
    desc: (s) => s ? `Most expensive housing markets in ${s}.` : 'Most expensive housing markets in the US.',
    color: 'text-red-600', hoverBg: 'hover:bg-red-50',
    nationalGetter: (n) => getMostExpensiveHousing(n),
    stateGetter: (state, n) => getMostExpensiveHousingInState(state, n),
    valueKey: 'housing', valueLabel: 'Housing Index', baseSlug: 'most-expensive-housing',
  },
};

// Legacy slug mapping (old national slugs without -cities suffix)
const LEGACY_NATIONAL: Record<string, string> = {
  'most-expensive': 'most-expensive-cities',
  'most-affordable': 'most-affordable-cities',
};

interface Props { params: Promise<{ type: string }> }

export const dynamicParams = true;
export const revalidate = 86400;

function parseSlug(type: string): { rankingKey: string; stateCode?: string; stateName?: string } | null {
  // Check legacy national slugs first
  if (LEGACY_NATIONAL[type]) {
    return { rankingKey: LEGACY_NATIONAL[type] };
  }

  // Check national rankings (exact match)
  if (RANKINGS[type]) {
    return { rankingKey: type };
  }

  // State-form slugs (e.g. "most-expensive-cities-in-texas") return null → 404.
  // 2026-04-23 Step 1b prune: see file-level comment.
  return null;
}

export function generateStaticParams() {
  // 2026-04-23 Step 1b: national only. State variants dropped — see file header.
  const params: { type: string }[] = [];
  for (const key of Object.keys(RANKINGS)) params.push({ type: key });
  for (const key of Object.keys(LEGACY_NATIONAL)) params.push({ type: key });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const parsed = parseSlug(type);
  if (!parsed) return {};
  const r = RANKINGS[parsed.rankingKey];
  const title = r.title(parsed.stateName);
  const desc = r.desc(parsed.stateName);
  return {
    title,
    description: desc,
    alternates: { canonical: `/rankings/${type}/` },
    openGraph: { title, description: desc, url: `/rankings/${type}/` },
  };
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const parsed = parseSlug(type);
  if (!parsed) notFound();

  const r = RANKINGS[parsed.rankingKey];
  const isState = !!parsed.stateCode;
  const title = r.title(parsed.stateName);
  const desc = r.desc(parsed.stateName);

  const cities = isState
    ? r.stateGetter(parsed.stateCode!, 50)
    : r.nationalGetter(50);

  if (cities.length === 0) notFound();

  const listItems = cities.map((c: { short_name: string; slug: string }) => ({
    name: c.short_name,
    url: `/cities/${c.slug}/`,
  }));

  // Build nav pills: national rankings + state rankings if on a state page
  const navItems: { key: string; label: string; href: string }[] = [];
  for (const [key, def] of Object.entries(RANKINGS)) {
    if (isState) {
      const slug = `${key}-in-${stateCodeToSlug(parsed.stateCode!)}`;
      navItems.push({ key: slug, label: def.title(parsed.stateName).replace(` in ${parsed.stateName}`, ''), href: `/rankings/${slug}/` });
    } else {
      navItems.push({ key, label: def.title().replace(' in the US', ''), href: `/rankings/${key}/` });
    }
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(title, `/rankings/${type}/`, listItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(title, desc, `/rankings/${type}/`)) }} />
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        {isState ? (
          <>
            <a href={`/rankings/${parsed.rankingKey}/`} className="hover:underline">{r.title()}</a>
            {' / '}
            <span className="text-slate-800">{parsed.stateName}</span>
          </>
        ) : (
          <span className="text-slate-800">{title}</span>
        )}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-slate-600 mb-6">{desc}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {navItems.map((item) => (
          <a key={item.key} href={item.href}
            className={`px-3 py-1 rounded-full text-sm border ${item.key === type ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {item.label}
          </a>
        ))}
      </div>

      {isState && (
        <p className="text-sm text-slate-500 mb-4">
          <a href={`/rankings/${parsed.rankingKey}/`} className="text-emerald-600 hover:underline">View national rankings</a>
          {' | '}
          <a href={`/state/${parsed.stateCode!.toLowerCase()}/`} className="text-emerald-600 hover:underline">All cities in {parsed.stateName}</a>
        </p>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="flex justify-between p-3 bg-slate-100 text-sm font-semibold">
          <span>City</span>
          <span>{r.valueLabel}</span>
        </div>
        {cities.map((c: any, i: number) => (
          <a key={c.slug} href={`/cities/${c.slug}/`}
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

      {/*
        2026-04-23 Step 1b: removed "Browse by State" link cloud
        (was seeding 42 state-variant links that now 404). Per-state
        rankings will be folded into /state/[slug]/ in a later pass.
      */}
    </div>
  );
}
