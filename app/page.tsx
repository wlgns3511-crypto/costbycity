import type { Metadata } from "next";
import {
  getMostExpensiveCities, getCheapestCities, getAllCitiesWithRPP, getAllStates,
} from "@/lib/db";
import {
  rankHiddenGems, rankRentBurden, rankFastestRising, rankFastestFalling,
  rankHousingHeavy,
} from "@/lib/cost-facts";
import { formatPctDiffShort } from "@/lib/format";
import { fmtUSD, fmtIndex } from "@/lib/content-helpers";
import { PopularEntities } from "@/components/upgrades/PopularEntities";

export const metadata: Metadata = {
  title: "CostByCity — US Cost of Living, Six Different Ways",
  description: "Compare cost of living across 387 US metros. BEA RPP + ACS data shows hidden-value cities, rent burden, fastest-changing metros, real income leaders — not just the cheapest list.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "CostByCity — US Cost of Living, Six Different Ways",
    description: "BEA RPP + ACS analysis of 387 US metros: hidden gems, rent burden, real wages, 5-year trends, housing-vs-goods split.",
    url: "/",
  },
};

// Card colors keyed off topic semantics — kept in one spot for tweaking.
const CARD = {
  exp: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", value: "text-red-600" },
  aff: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", value: "text-green-600" },
  gem: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", value: "text-emerald-600" },
  rent: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", value: "text-amber-600" },
  rise: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", value: "text-orange-600" },
  fall: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", value: "text-sky-600" },
  house: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", value: "text-violet-600" },
} as const;

export default function Home() {
  const expensive = getMostExpensiveCities(5);
  const cheapest = getCheapestCities(5);
  const allCities = getAllCitiesWithRPP();
  const states = getAllStates();
  const gems = rankHiddenGems(5);
  const rentBurdened = rankRentBurden(5);
  const rising = rankFastestRising(5);
  const falling = rankFastestFalling(5);
  const housing = rankHousingHeavy(5);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Cost of Living Across {allCities.length} US Metros
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          BEA Regional Price Parities and ACS household data, six different ways: hidden-value
          metros, rent burden, real income leaders, fastest-changing cost indices, dollar-stretch,
          and the housing-vs-goods cost split. Pick a question — every list links to per-metro
          detail with full breakdowns.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <a href="/insights/" className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            Explore all 6 insight topics →
          </a>
          <a href="/rankings/" className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
            12 ranking lists
          </a>
          <a href="/state/" className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
            By state
          </a>
        </div>
      </section>

      {/* ── 7-CARD INSIGHT GRID ─────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Seven Cuts of US Cost-of-Living Data</h2>
        <p className="text-slate-600 mb-6 max-w-3xl">
          Each card surfaces the headline answer for one question. Click through for the full
          ranked table with paired analysis (e.g. fastest-rising paired with fastest-falling).
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hidden Gems */}
          <article className={`rounded-lg border ${CARD.gem.border} ${CARD.gem.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.gem.text}`}>Hidden-Value Metros</h3>
            <p className="text-sm text-slate-600 mb-3">Below-average cost, above-average real income — the best standard-of-living-per-dollar locations.</p>
            <ol className="text-sm space-y-1.5">
              {gems.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.gem.value}`}>
                    {fmtUSD(c.primary_value)}
                  </span>
                </li>
              ))}
            </ol>
            <a href="/insights/hidden-gems/" className={`mt-3 inline-block text-sm ${CARD.gem.text} hover:underline`}>
              Full hidden-value analysis →
            </a>
          </article>

          {/* Rent Burden */}
          <article className={`rounded-lg border ${CARD.rent.border} ${CARD.rent.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.rent.text}`}>Heaviest Rent Burden</h3>
            <p className="text-sm text-slate-600 mb-3">Rent as a share of median income. HUD&apos;s 30% line is the affordability red zone.</p>
            <ol className="text-sm space-y-1.5">
              {rentBurdened.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.rent.value}`}>
                    {c.primary_value.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ol>
            <a href="/insights/rent-burden/" className={`mt-3 inline-block text-sm ${CARD.rent.text} hover:underline`}>
              Full rent-burden analysis →
            </a>
          </article>

          {/* Fastest Rising */}
          <article className={`rounded-lg border ${CARD.rise.border} ${CARD.rise.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.rise.text}`}>Fastest-Rising Cost Indices</h3>
            <p className="text-sm text-slate-600 mb-3">Biggest 5-year cost increases. Most metros drift; these moved sharply.</p>
            <ol className="text-sm space-y-1.5">
              {rising.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.rise.value}`}>
                    +{c.primary_value.toFixed(1)} pts
                  </span>
                </li>
              ))}
            </ol>
            <a href="/insights/fastest-changing/" className={`mt-3 inline-block text-sm ${CARD.rise.text} hover:underline`}>
              Full 5-year change analysis →
            </a>
          </article>

          {/* Fastest Falling */}
          <article className={`rounded-lg border ${CARD.fall.border} ${CARD.fall.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.fall.text}`}>Fastest-Easing Cost Indices</h3>
            <p className="text-sm text-slate-600 mb-3">Biggest 5-year cost drops. RPP is relative — these eased while peers rose.</p>
            <ol className="text-sm space-y-1.5">
              {falling.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.fall.value}`}>
                    {c.primary_value.toFixed(1)} pts
                  </span>
                </li>
              ))}
            </ol>
            <a href="/insights/fastest-changing/" className={`mt-3 inline-block text-sm ${CARD.fall.text} hover:underline`}>
              Full 5-year change analysis →
            </a>
          </article>

          {/* Housing-Heavy */}
          <article className={`rounded-lg border ${CARD.house.border} ${CARD.house.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.house.text}`}>Housing-Driven Cost Profiles</h3>
            <p className="text-sm text-slate-600 mb-3">Where shelter pulls cost above the metro&apos;s overall index by the largest margin.</p>
            <ol className="text-sm space-y-1.5">
              {housing.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.house.value}`}>
                    +{c.primary_value.toFixed(0)} pts
                  </span>
                </li>
              ))}
            </ol>
            <a href="/insights/housing-vs-goods/" className={`mt-3 inline-block text-sm ${CARD.house.text} hover:underline`}>
              Full housing-vs-goods analysis →
            </a>
          </article>

          {/* Most Expensive */}
          <article className={`rounded-lg border ${CARD.exp.border} ${CARD.exp.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.exp.text}`}>Most Expensive Metros</h3>
            <p className="text-sm text-slate-600 mb-3">Top of the BEA cost-index ranking. Often paired with high pay (real income table tells the rest).</p>
            <ol className="text-sm space-y-1.5">
              {expensive.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.exp.value}`}>
                    {formatPctDiffShort(c.rpp_all)}
                  </span>
                </li>
              ))}
            </ol>
            <a href="/rankings/most-expensive-cities/" className={`mt-3 inline-block text-sm ${CARD.exp.text} hover:underline`}>
              Full ranking →
            </a>
          </article>

          {/* Most Affordable */}
          <article className={`rounded-lg border ${CARD.aff.border} ${CARD.aff.bg} p-5`}>
            <h3 className={`font-bold mb-1 ${CARD.aff.text}`}>Most Affordable Metros</h3>
            <p className="text-sm text-slate-600 mb-3">Bottom of the cost index. Real-income leaders are often hidden in this list (see Hidden Gems).</p>
            <ol className="text-sm space-y-1.5">
              {cheapest.map((c, i) => (
                <li key={c.fips} className="flex justify-between gap-2">
                  <a href={`/cities/${c.slug}/`} className="hover:underline truncate">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>{c.short_name}
                  </a>
                  <span className={`font-semibold whitespace-nowrap ${CARD.aff.value}`}>
                    {formatPctDiffShort(c.rpp_all)}
                  </span>
                </li>
              ))}
            </ol>
            <a href="/rankings/most-affordable-cities/" className={`mt-3 inline-block text-sm ${CARD.aff.text} hover:underline`}>
              Full ranking →
            </a>
          </article>
        </div>
      </section>

      {/* ── METHODOLOGY EXPLAINER ───────────────────────────────────── */}
      <section className="mb-12 p-5 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How These Numbers Are Built</h2>
        <p className="text-sm text-slate-600 mb-2">
          <strong>Cost index</strong> = BEA Regional Price Parities — 100 means national average, 110 means 10% more expensive than the US baseline.
          The dataset decomposes each metro&apos;s cost into housing, goods, utilities, and other services so we can see which category does the work.
        </p>
        <p className="text-sm text-slate-600 mb-2">
          <strong>Real income</strong> = nominal median household income × (100 / cost index). It captures actual purchasing power — a $90K paycheck in a 110-cost metro buys roughly the same as $82K at the national average.
        </p>
        <p className="text-sm text-slate-600">
          <strong>Rent burden</strong> = annual median rent ÷ median household income. HUD considers above 30% &ldquo;cost-burdened.&rdquo; Source: ACS via Census, paired with BEA RPP per metro FIPS.
        </p>
      </section>

      {/* ── POPULAR ENTITIES ────────────────────────────────────────── */}
      <PopularEntities
        heading="Most Searched Metros"
        subheading="Top 12 by population & search interest"
        items={allCities.slice(0, 12).map(c => ({
          name: c.short_name,
          href: `/cities/${c.slug}/`,
          stat: `Index ${fmtIndex(c.rpp_all)}`,
        }))}
        viewAllHref="/rankings/"
        viewAllLabel="View all rankings →"
      />

      {/* ── BROWSE BY STATE ─────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Browse by State</h2>
        <div className="flex flex-wrap gap-2">
          {states.map((s) => (
            <a
              key={s}
              href={`/state/${s.toLowerCase()}/`}
              className="px-3 py-1 rounded-full text-sm border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
            >
              {s}
            </a>
          ))}
        </div>
      </section>

      {/* ── ALL CITIES (multi-column) ───────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold mb-4">All {allCities.length} Metros</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 text-sm">
          {allCities.map((city) => (
            <div key={city.fips} className="mb-1">
              <a href={`/cities/${city.slug}/`} className="text-slate-600 hover:text-emerald-600 hover:underline">
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
