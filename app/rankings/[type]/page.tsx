import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMostExpensiveCities, getCheapestCities, getCheapestHousing, getMostExpensiveHousing,
} from "@/lib/db";
import {
  rankHiddenGems, rankRentBurden, rankFastestRising, rankFastestFalling,
  rankHousingHeavy, rankIncomeLeaders, rankValueLeaders, rankCheapestUtilities,
  type RankingRow,
} from "@/lib/cost-facts";
import { fmtUSD, fmtIndex } from "@/lib/content-helpers";
import { itemListSchema, datasetSchema } from "@/lib/schema";

/**
 * 2026-04-29 HCU 5-chunk patch — expanded from 4 to 12 ranking types.
 *
 * Original 4 (kept): most-expensive-cities, most-affordable-cities,
 *   cheapest-housing, most-expensive-housing (legacy aliases retained).
 *
 * Added 8: hidden-gems, rent-burden-highest, fastest-rising, fastest-falling,
 *   housing-heavy, income-leaders, value-leaders, cheapest-utilities.
 *
 * State-variants (`-in-{state}`) remain dropped per Step 1b prune (2026-04-23).
 * Per-state breakdowns live in /state/[slug]/ and the /insights/ topics.
 *
 * dynamicParams = false: URLs not in generateStaticParams return real HTTP 404
 * (not Next.js 16 soft-404). Mirror of the salarybycity Phase 2 pattern.
 */

interface RankingDef {
  title: string;
  desc: string;
  hookHeadline: string;        // friendly H2 under the H1
  hook: string;                // 2-3 sentence intro paragraph
  primaryLabel: string;        // table column header for primary value
  secondaryLabel?: string;     // table column header for secondary value (when present)
  formatPrimary: (v: number) => string;
  formatSecondary?: (v: number | null) => string;
  primaryClass: string;        // tailwind text colour for primary numbers
  hoverBg: string;
  getter: () => RankingRow[];  // returns RankingRow shape for new rankings
  legacyGetter?: () => unknown[]; // legacy 4 use a different shape — bridged below
  legacyValueKey?: string;
  legacyLabel?: string;
}

// Bridges the legacy 4 getters (which return Metro & rpp_all/housing) into
// the unified RankingRow shape so we can render uniformly.
function bridgeRow(
  rows: { fips: string; slug: string; short_name: string; state: string }[],
  valueKey: string,
): RankingRow[] {
  return rows.map((r) => {
    const rec = r as unknown as Record<string, number | string>;
    const v = Number(rec[valueKey]);
    return {
      fips: r.fips,
      slug: r.slug,
      short_name: r.short_name,
      state: r.state,
      primary_value: v,
      secondary_value: null,
    };
  });
}

const RANKINGS: Record<string, RankingDef> = {
  // ── ORIGINAL 4 (BRIDGED) ─────────────────────────────────────────
  'most-expensive-cities': {
    title: 'Most Expensive Cities in the US',
    desc: 'US metros with the highest BEA cost-of-living index — top of the national ranking.',
    hookHeadline: 'The Top of the BEA Cost Index',
    hook: 'These are the US metros where the overall BEA Regional Price Parity index sits highest — the cost premium is real but most are paired with high nominal wages. The real-income leaderboard tells a different story; see /insights/real-wages/ for the cost-adjusted view.',
    primaryLabel: 'Cost Index',
    formatPrimary: fmtIndex,
    primaryClass: 'text-red-600',
    hoverBg: 'hover:bg-red-50',
    getter: () => bridgeRow(getMostExpensiveCities(50), 'rpp_all'),
  },
  'most-affordable-cities': {
    title: 'Most Affordable Cities in the US',
    desc: 'US metros with the lowest BEA cost-of-living index — bottom of the national ranking.',
    hookHeadline: 'Bottom of the BEA Cost Index',
    hook: 'The US metros sitting lowest on the overall BEA RPP cost index. Most pair below-100 cost with smaller-metro size and inland geography. Many are also "hidden-value" metros — see /insights/hidden-gems/ for the real-income angle.',
    primaryLabel: 'Cost Index',
    formatPrimary: fmtIndex,
    primaryClass: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
    getter: () => bridgeRow(getCheapestCities(50), 'rpp_all'),
  },
  'cheapest-housing': {
    title: 'Cities With the Cheapest Housing',
    desc: 'US metros with the lowest BEA housing index — most affordable shelter relative to national.',
    hookHeadline: 'Lowest Housing Indices',
    hook: 'BEA decomposes each metro\'s overall cost into housing, goods, utilities, and other services. These metros sit lowest on the housing component specifically — useful for renters and homebuyers who prioritise shelter affordability above all else.',
    primaryLabel: 'Housing Index',
    formatPrimary: fmtIndex,
    primaryClass: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
    getter: () => bridgeRow(getCheapestHousing(50), 'housing'),
  },
  'most-expensive-housing': {
    title: 'Cities With the Most Expensive Housing',
    desc: 'US metros with the highest BEA housing index — costliest shelter markets in the country.',
    hookHeadline: 'Highest Housing Indices',
    hook: 'BEA\'s housing index isolates shelter cost from goods and services. These metros lead the country on housing specifically — typically supply-constrained coastal cities, but a few inland metros with concentrated job markets join the top of the list.',
    primaryLabel: 'Housing Index',
    formatPrimary: fmtIndex,
    primaryClass: 'text-red-600',
    hoverBg: 'hover:bg-red-50',
    getter: () => bridgeRow(getMostExpensiveHousing(50), 'housing'),
  },

  // ── 8 NEW RANKINGS ──────────────────────────────────────────────
  'hidden-gems': {
    title: 'Hidden-Value US Metros (Highest Real Income)',
    desc: 'US metros where below-average cost meets above-average wages — best standard of living per dollar.',
    hookHeadline: 'Below-Average Cost, Above-Average Real Income',
    hook: 'Real income = nominal household income × (100 / cost index). Metros that combine low costs with strong wages deliver the highest real purchasing power — often outperforming famous coastal cities once cost of living is netted out.',
    primaryLabel: 'Real Income',
    secondaryLabel: 'Cost Index',
    formatPrimary: fmtUSD,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    getter: () => rankHiddenGems(50),
  },
  'rent-burden-highest': {
    title: 'US Metros With the Highest Rent Burden',
    desc: 'US metros where median rent consumes the largest share of median household income — HUD\'s 30% line.',
    hookHeadline: 'Where Renters Push the 30% Rule',
    hook: 'Annual median rent divided by median household income. HUD considers households spending more than 30% of income on housing "cost-burdened." These metros put the median renter closest to or past that line.',
    primaryLabel: 'Rent / Income',
    secondaryLabel: 'Median Rent',
    formatPrimary: (v) => `${v.toFixed(1)}%`,
    formatSecondary: (v) => v == null ? '—' : fmtUSD(v),
    primaryClass: 'text-amber-600',
    hoverBg: 'hover:bg-amber-50',
    getter: () => rankRentBurden(50),
  },
  'fastest-rising': {
    title: 'Fastest-Rising Cost Indices (5-Year Change)',
    desc: 'US metros where the BEA cost index has gained the most points over the most recent 5-year window.',
    hookHeadline: 'Sharpest 5-Year Cost Increases',
    hook: 'BEA RPP tracks metro cost indices each year. Most metros drift within ±2 points over five years; these moved sharply — driven by in-migration, housing supply lag, or tourism/anchor-employer pressure.',
    primaryLabel: '5-Year Change',
    secondaryLabel: 'Current Index',
    formatPrimary: (v) => `+${v.toFixed(1)} pts`,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-orange-600',
    hoverBg: 'hover:bg-orange-50',
    getter: () => rankFastestRising(50),
  },
  'fastest-falling': {
    title: 'Fastest-Easing Cost Indices (5-Year Change)',
    desc: 'US metros where the BEA cost index has fallen the most over the most recent 5-year window.',
    hookHeadline: 'Sharpest 5-Year Cost Decreases',
    hook: 'RPP measures cost relative to other US metros — declining values can mean either improved local affordability or other metros simply rising faster. Either way, these are the standout decliners of the most recent 5-year span.',
    primaryLabel: '5-Year Change',
    secondaryLabel: 'Current Index',
    formatPrimary: (v) => `${v.toFixed(1)} pts`,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-sky-600',
    hoverBg: 'hover:bg-sky-50',
    getter: () => rankFastestFalling(50),
  },
  'housing-heavy': {
    title: 'Housing-Heavy US Metros (Biggest Housing Premium)',
    desc: 'US metros where the BEA housing index runs furthest above the metro\'s overall cost index.',
    hookHeadline: 'Where Shelter Drives the Cost Picture',
    hook: 'Two metros can have the same overall cost index but very different sources. These are the metros where housing alone runs 15–30 points above the overall — meaning groceries and services are reasonable, but the cost of a roof is doing all the cost work.',
    primaryLabel: 'Housing Premium',
    secondaryLabel: 'Cost Index',
    formatPrimary: (v) => `+${v.toFixed(1)} pts`,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-violet-600',
    hoverBg: 'hover:bg-violet-50',
    getter: () => rankHousingHeavy(50),
  },
  'income-leaders': {
    title: 'Highest Median Household Income (US Metros)',
    desc: 'US metros with the highest nominal median household income per ACS — before any cost-of-living adjustment.',
    hookHeadline: 'Top US Metros by Nominal Income',
    hook: 'ACS median household income, no cost adjustment applied. The leaderboard skews toward expensive metros — high nominal pay often comes with high cost. The cost-adjusted (real-income) view tells a different story; see /insights/real-wages/.',
    primaryLabel: 'Median Income',
    secondaryLabel: 'Cost Index',
    formatPrimary: fmtUSD,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-indigo-600',
    hoverBg: 'hover:bg-indigo-50',
    getter: () => rankIncomeLeaders(50),
  },
  'value-leaders': {
    title: 'Real-Income Leaders (Cost-Adjusted Median Pay)',
    desc: 'US metros with the highest cost-adjusted median income — the actual purchasing power leaderboard.',
    hookHeadline: 'Top Metros by Real Purchasing Power',
    hook: 'Same data as the nominal-income ranking, divided by the BEA cost index to get real (cost-adjusted) income. This is the "what does the paycheck actually buy" view — not always the same metros that lead on nominal pay.',
    primaryLabel: 'Real Income',
    secondaryLabel: 'Median Income',
    formatPrimary: fmtUSD,
    formatSecondary: (v) => v == null ? '—' : fmtUSD(v),
    primaryClass: 'text-teal-600',
    hoverBg: 'hover:bg-teal-50',
    getter: () => rankValueLeaders(50),
  },
  'cheapest-utilities': {
    title: 'Cities With the Cheapest Utilities',
    desc: 'US metros with the lowest BEA utilities index — cheapest electricity, gas, water, and related services.',
    hookHeadline: 'Lowest Utilities Indices',
    hook: 'BEA RPP separates utilities (electricity, gas, water, etc.) as a distinct category. These metros run lowest on utilities specifically — useful context for renters and homeowners modelling monthly fixed costs.',
    primaryLabel: 'Utilities Index',
    secondaryLabel: 'Cost Index',
    formatPrimary: fmtIndex,
    formatSecondary: (v) => v == null ? '—' : fmtIndex(v),
    primaryClass: 'text-cyan-600',
    hoverBg: 'hover:bg-cyan-50',
    getter: () => rankCheapestUtilities(50),
  },
};

// Legacy slug aliases (old national slugs without -cities suffix)
const LEGACY_NATIONAL: Record<string, string> = {
  'most-expensive': 'most-expensive-cities',
  'most-affordable': 'most-affordable-cities',
};

interface Props { params: Promise<{ type: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

function resolveType(type: string): string | null {
  if (LEGACY_NATIONAL[type]) return LEGACY_NATIONAL[type];
  if (RANKINGS[type]) return type;
  return null;
}

export function generateStaticParams() {
  const params: { type: string }[] = [];
  for (const key of Object.keys(RANKINGS)) params.push({ type: key });
  for (const key of Object.keys(LEGACY_NATIONAL)) params.push({ type: key });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const key = resolveType(type);
  if (!key) return {};
  const r = RANKINGS[key];
  return {
    title: r.title,
    description: r.desc,
    alternates: { canonical: `/rankings/${type}/` },
    openGraph: { title: r.title, description: r.desc, url: `/rankings/${type}/` },
  };
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const key = resolveType(type);
  if (!key) notFound();

  const r = RANKINGS[key];
  const rows = r.getter();
  if (rows.length === 0) notFound();

  const listItems = rows.map((c) => ({
    name: c.short_name,
    url: `/cities/${c.slug}/`,
  }));

  // Nav pills — all 12 ranking types as quick-jumps
  const navItems = Object.entries(RANKINGS).map(([k, def]) => ({
    key: k,
    label: def.title.replace(/^Cities With the |^US Metros With the |^Highest |^Most | in the US$/g, '').replace(/Cost Indices/g, 'Trend'),
    href: `/rankings/${k}/`,
  }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(r.title, `/rankings/${type}/`, listItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(r.title, r.desc, `/rankings/${type}/`)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <a href="/rankings/" className="hover:underline">Rankings</a>
        {' / '}
        <span className="text-slate-800">{r.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{r.title}</h1>
      <p className="text-slate-600 mb-6">{r.desc}</p>

      {/* Hook narrative */}
      <section className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="font-semibold text-slate-800 mb-1">{r.hookHeadline}</h2>
        <p className="text-sm text-slate-600">{r.hook}</p>
      </section>

      {/* Cross-ranking nav pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {navItems.map((item) => (
          <a key={item.key} href={item.href}
            className={`px-3 py-1 rounded-full text-xs border ${item.key === key ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {item.label}
          </a>
        ))}
      </div>

      {/* The ranking table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 p-3 bg-slate-100 text-sm font-semibold">
          <span>#</span>
          <span>City</span>
          <span className="text-right">{r.primaryLabel}</span>
          {r.secondaryLabel && <span className="text-right text-slate-500 hidden sm:block">{r.secondaryLabel}</span>}
        </div>
        {rows.map((c, i) => (
          <a key={c.slug} href={`/cities/${c.slug}/`}
            className={`grid grid-cols-[3rem_1fr_auto_auto] gap-3 items-center p-3 ${r.hoverBg} border-b border-slate-100`}>
            <span className="text-slate-400">{i + 1}.</span>
            <span className="text-sm">{c.short_name}</span>
            <span className={`text-sm font-semibold ${r.primaryClass} text-right`}>
              {r.formatPrimary(c.primary_value)}
            </span>
            {r.secondaryLabel && (
              <span className="text-xs text-slate-500 text-right hidden sm:block">
                {r.formatSecondary ? r.formatSecondary(c.secondary_value) : (c.secondary_value ?? '—')}
              </span>
            )}
          </a>
        ))}
      </div>

      <div className="mt-6 text-sm text-slate-500">
        <a href="/rankings/" className="text-emerald-600 hover:underline">← All ranking lists</a>
        {' · '}
        <a href="/insights/" className="text-emerald-600 hover:underline">Topic-based insights →</a>
      </div>
    </div>
  );
}

// Export the RANKINGS catalog so the /rankings/ index page can iterate
export { RANKINGS };
