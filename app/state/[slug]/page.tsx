import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMetrosByStateCode, getAllStates } from "@/lib/db";
import { buildDbPageRobots, buildTrustUpdatedLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from "@/lib/db-page";
import { formatIndex, formatPctDiffShort, getDataYear } from "@/lib/format";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { StateRich } from '@/components/state/StateRich';
import { FreshnessTag } from "@/components/FreshnessTag";
import { TrustBlock } from "@/components/upgrades/TrustBlock";

interface Props { params: Promise<{ slug: string }> }

function buildStateTopAnswer({
  cheapestCity,
  cityCount,
  mostExpensiveCity,
  state,
}: {
  cheapestCity: { short_name: string; rpp_all: number } | undefined;
  cityCount: number;
  mostExpensiveCity: { short_name: string; rpp_all: number } | undefined;
  state: string;
}) {
  if (!cheapestCity || !mostExpensiveCity) {
    return `This page compares ${cityCount} metro areas in ${state} so you can see where the state's living costs sit above or below the national baseline of 100. The useful next step is checking whether the gap between the cheapest and priciest metros is large enough to change a relocation or housing decision.`;
  }

  return `${state} includes ${cityCount} metro areas, ranging from ${cheapestCity.short_name} at an index of ${formatIndex(cheapestCity.rpp_all)} to ${mostExpensiveCity.short_name} at ${formatIndex(mostExpensiveCity.rpp_all)}. That spread shows whether moving within the state could materially change housing and daily living costs before you even compare states.`;
}

// dynamicParams=false (2026-04-23): unknown state slugs return real HTTP 404.
// All states prebuilt via generateStaticParams. Avoids Next.js 16 soft-404
// (HTTP 200 + 404 body) that was happening when root layout was dynamic.
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = slug.toUpperCase();
  const cities = getMetrosByStateCode(state);
  if (cities.length === 0) return {};
  const rankedCities = [...cities].sort((a, b) => a.rpp_all - b.rpp_all);
  const description = buildStateTopAnswer({
    cheapestCity: rankedCities[0],
    cityCount: cities.length,
    mostExpensiveCity: rankedCities[rankedCities.length - 1],
    state,
  });
  const dataVintage = `${getDataYear()} BEA RPP data`;
  const gate = getDbPageGate({
    alternativeLinkCount: Math.max(3, Math.min(cities.length, 3)),
    dataVintage,
    topAnswer: description,
  });
  const title = `Cost of Living in ${state} - City Comparison`;
  return {
    title,
    description,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: { title, description, url: `/state/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = slug.toUpperCase();
  const cities = getMetrosByStateCode(state);
  if (cities.length === 0) notFound();
  const dataYear = getDataYear();
  const rankedCities = [...cities].sort((a, b) => a.rpp_all - b.rpp_all);
  const cheapestCity = rankedCities[0];
  const mostExpensiveCity = rankedCities[rankedCities.length - 1];
  const topAnswer = buildStateTopAnswer({
    cheapestCity,
    cityCount: cities.length,
    mostExpensiveCity,
    state,
  });
  const dataVintage = `${dataYear} BEA RPP data`;

  const states = getAllStates();

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Cost of Living in {state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Cost of Living in {state}</h1>
      <p className="text-slate-600 mb-3">{cities.length} metro areas ranked by cost of living</p>
      <p className="max-w-3xl text-sm leading-6 text-slate-600 mb-4">{topAnswer}</p>

      <FreshnessTag
        source="BEA Regional Price Parities"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={dataVintage}
      />
      <TrustBlock
        sources={[
          { name: "BEA Regional Price Parities", url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area" },
          { name: "BLS CPI", url: "https://www.bls.gov/cpi/" },
          { name: "Census Bureau", url: "https://www.census.gov" },
        ]}
        updated={buildTrustUpdatedLabel(dataVintage)}
        methodologyUrl={METHODOLOGY_URL}
      />

      <EditorNote note={`Cost of living in ${state} varies widely across metro areas. Indices above 100 mean higher than the national average, while below 100 means more affordable. These figures reflect regional price parities from the BLS.`} />

      <section className="grid gap-4 md:grid-cols-2 mb-6">
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">What the statewide spread means</h2>
          <p className="text-sm leading-6 text-slate-600">
            State pages are useful because most relocation decisions start at the state level, then narrow to one or two metros. In {state}, the distance between the cheapest and priciest metro is a quick way to judge whether moving within the same state can materially change your housing and daily spending.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">How to use this page</h2>
          <p className="text-sm leading-6 text-slate-600">
            Start with the statewide ranking to find the outliers, then click into the cheapest and most expensive metros to inspect housing, rent, and income context. That gives you a faster read on whether the state has one unusually expensive hub or broad cost pressure across most metros.
          </p>
        </article>
      </section>

      {cheapestCity && mostExpensiveCity && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">Compare Next</h2>
          <div className="flex flex-wrap gap-2">
            <a href={`/cities/${cheapestCity.slug}/`} className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-emerald-50">
              Cheapest: {cheapestCity.short_name}
            </a>
            <a href={`/cities/${mostExpensiveCity.slug}/`} className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-emerald-50">
              Priciest: {mostExpensiveCity.short_name}
            </a>
            <a href="/cities/" className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-emerald-50">
              Browse all metros
            </a>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {states.map((s) => (
          <a key={s} href={`/state/${s.toLowerCase()}/`}
            className={`px-3 py-1 rounded-full text-sm border ${s === state ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        {cities.map((c, i) => (
          <a key={c.fips} href={`/cities/${c.slug}/`}
            className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100">
            <span className="text-sm">
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {c.short_name}
            </span>
            <span className={`text-sm font-semibold ${c.rpp_all > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPctDiffShort(c.rpp_all)}
            </span>
          </a>
        ))}
      </div>

      <DidYouKnow fact="Housing typically accounts for the largest share of cost-of-living differences between metro areas. A city with an overall index of 110 may have housing costs 30-40% above the national average while groceries differ by only 5-10%." />

      <DataSourceBadge sources={[
        { name: "BLS CPI", url: "https://www.bls.gov/cpi/" },
        { name: "Census Bureau", url: "https://www.census.gov" },
      ]} />

      <CrossSiteLinks current="CostByCity" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `Cost of Living in ${state}`,
          description: `Compare cost of living across ${cities.length} metro areas in ${state}. Regional price parities, housing costs, and income data.`,
          url: `https://costbycity.com/state/${slug}/`,
          license: "https://creativecommons.org/publicdomain/zero/1.0/",
          creator: { "@type": "Organization", name: "DataPeek Facts", url: "https://datapeekfacts.com" },
          author: { "@type": "Organization", name: "DataPeek" },
          temporalCoverage: String(dataYear),
          distribution: { "@type": "DataDownload", encodingFormat: "text/html", contentUrl: `https://costbycity.com/state/${slug}/` },
        }) }}
      />

      <StateRich slug={slug} state={state} />

    </div>
  );
}
