import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityData, getAllMetros, getAllCitiesWithRPP, getRPPHistory, getRelatedCities } from "@/lib/db";
import { buildDbPageRobots, buildTrustUpdatedLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from "@/lib/db-page";
import { formatDollar, formatPctDiff, formatIndex } from "@/lib/format";
import { CostBreakdown } from "@/components/CostIndex";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { analyzeCost } from "@/lib/cost-analysis";
import { generateAutoFaqs } from '@/lib/auto-faqs';
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { CostIndexChart } from "@/components/CostIndexChart";
import { EmbedButton } from "@/components/EmbedButton";
import { FreshnessTag } from "@/components/FreshnessTag";
import { RelocationCalculator } from "@/components/RelocationCalculator";
import { CiteButton } from "@/components/CiteButton";
import { AuthorBox } from "@/components/AuthorBox";
import { InsightCards } from "@/components/InsightCards";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { InsightBlock } from "@/components/upgrades/InsightBlock";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { getCostInsights } from "@/lib/insights";
import { RelatedEntities } from "@/components/upgrades/RelatedEntities";
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { AffordabilityCalc } from "@/components/tools/AffordabilityCalc";
import { FeedbackButton } from "@/components/FeedbackButton";
import { getCityFacts } from "@/lib/cost-facts";
import { getCityCommentary, getCityTitle, getCityDescription } from "@/lib/cost-commentary";

interface Props {
  params: Promise<{ slug: string }>;
}

// dynamicParams=false (2026-04-23): unknown city slugs return real HTTP 404.
// All 387 metros prebuilt via generateStaticParams. Avoids Next.js 16 soft-404
// (HTTP 200 + 404 body).
export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllMetros().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) return {};
  const { metro, year } = data;

  // 2026-04-29 HCU 5-chunk patch: title + description now slug-hash diversified
  // by city status. 387 metros render across ~9 status profiles × 3 variants =
  // ~27 distinct title shapes, defeating "{City} Cost of Living {Year}: Index X"
  // template detection. Description gets 4 variants × 9 statuses similarly.
  const facts = getCityFacts(slug);
  const dataVintage = `${year} BEA RPP + ACS data`;
  const title = facts ? getCityTitle(facts) : `${metro.short_name} Cost of Living`;
  const description = facts ? getCityDescription(facts) : `${metro.short_name}, ${metro.state} cost of living per BEA RPP ${year}.`;

  // Peer count for the gate check (kept from previous logic).
  const sameState = getRelatedCities(metro.state, slug, 20);
  const gate = getDbPageGate({
    alternativeLinkCount: Math.max(3, sameState.slice(0, 3).length),
    dataVintage,
    topAnswer: description,
  });

  return {
    title,
    description,
    alternates: { canonical: `/cities/${slug}/` },
    openGraph: { title, description, url: `/cities/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) notFound();

  const { metro, rpp: rppRaw, acs, year } = data;
  const rpp = rppRaw as any;
  const allCities = getAllCitiesWithRPP();
  const history = getRPPHistory(metro.fips);
  const analysis = analyzeCost(metro.short_name, rpp, acs ?? null, history);
  const autoFaqItems = generateAutoFaqs(metro.short_name, rpp, acs, year);
  const faqs = [
    ...autoFaqItems,
    ...(analysis.trendNote ? [{ question: `Is ${metro.short_name} getting more expensive?`, answer: analysis.trendNote }] : []),
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Cities", url: "/cities" },
    { name: metro.short_name, url: `/cities/${slug}/` },
  ];

  // Find nearby RPP cities for comparison suggestions
  const rppAll = rpp.all || 100;
  const compareCities = allCities
    .filter((c) => c.fips !== metro.fips)
    .sort((a, b) => Math.abs(a.rpp_all - rppAll) - Math.abs(b.rpp_all - rppAll))
    .slice(0, 10);
  const dataVintage = `${year} BEA RPP + ACS data`;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `Cost of Living in ${metro.short_name} (${year})`,
            "description": `Cost of living index, housing costs, income, and rent data for the ${metro.short_name} metropolitan area.`,
            "url": `https://costbycity.com/cities/${slug}/`,
            "license": "https://creativecommons.org/publicdomain/zero/1.0/",
            "creator": { "@type": "Organization", "name": "DataPeek Facts", "url": "https://datapeekfacts.com" },
            "temporalCoverage": String(year),
            "distribution": { "@type": "DataDownload", "encodingFormat": "text/html", "contentUrl": `https://costbycity.com/cities/${slug}/` }
          })
        }}
      />
      <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

      <AnswerHero
        title={`Cost of living in ${metro.short_name}`}
        subtitle={`${year} BEA data`}
        tagline={`${metro.short_name} has a cost-of-living index of ${formatIndex(rpp.all || 100)} \u2014 ${formatPctDiff(rpp.all || 100)} the US average. ${analysis.summary}`}
        badges={[
          {
            label: (rpp.all || 100) > 100 ? `${formatPctDiff(rpp.all || 100)} above US` : `${formatPctDiff(rpp.all || 100)} below US`,
            tone: ((rpp.all || 100) > 100 ? "amber" : "emerald") as "amber" | "emerald",
          },
          { label: `BEA RPP ${year}`, tone: "indigo" as const },
        ]}
        alternatives={compareCities.slice(0, 3).map((c) => ({
          label: c.short_name,
          href: `/cities/${c.slug}/`,
          sublabel: formatIndex(c.rpp_all),
        }))}
        alternativesLabel="Comparable-cost metros"
      />

      <FreshnessTag
        source="BEA Regional Price Parities + Census ACS"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={dataVintage}
      />

      <TrustBlock
        sources={[
          {
            name: "BEA Regional Price Parities",
            url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
          },
          {
            name: "Census ACS",
            url: "https://www.census.gov/programs-surveys/acs/",
          },
          {
            name: "BLS CPI",
            url: "https://www.bls.gov/cpi/",
          },
          {
            name: "HUD Fair Market Rents",
            url: "https://www.huduser.gov/portal/datasets/fmr.html",
          },
          {
            name: "MIT Living Wage Calculator",
            url: "https://livingwage.mit.edu/",
          },
        ]}
        updated={buildTrustUpdatedLabel(dataVintage)}
        methodologyUrl={METHODOLOGY_URL}
      />

      <InsightBlock entityName={metro.short_name} insights={getCostInsights(metro.short_name, rpp, acs ?? null)} />

      {/* ── Cost Snapshot — Layer 2 status-aware narrative (HCU 5-chunk, 2026-04-29). */}
      {(() => {
        const facts = getCityFacts(slug);
        if (!facts) return null;
        const c = getCityCommentary(facts);
        return (
          <section className="my-8 p-5 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm" data-status={c.status}>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">{c.headline}</h2>
            <p className="text-slate-700 leading-relaxed mb-3">{c.fact}</p>
            <p className="text-slate-700 leading-relaxed mb-3">{c.context}</p>
            <p className="text-slate-600 leading-relaxed text-sm border-l-4 border-emerald-300 pl-4 py-1 bg-emerald-50/50">
              <strong className="text-emerald-700">What this means:</strong> {c.implication}
            </p>
          </section>
        );
      })()}

      <TableOfContents />

      {/* Hero stat */}
      <div className="bg-emerald-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-500">Cost Index</div>
            <div className={`text-2xl font-bold ${rppAll > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {formatIndex(rppAll)}
            </div>
            <div className="text-xs text-slate-400">{formatPctDiff(rppAll)} avg</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Housing Index</div>
            <div className="text-2xl font-bold">{rpp.housing ? formatIndex(rpp.housing) : 'N/A'}</div>
          </div>
          {acs?.median_income && (
            <div>
              <div className="text-sm text-slate-500">Median Income</div>
              <div className="text-2xl font-bold">{formatDollar(acs.median_income)}</div>
            </div>
          )}
          {acs?.median_rent && (
            <div>
              <div className="text-sm text-slate-500">Median Rent</div>
              <div className="text-2xl font-bold">{formatDollar(acs.median_rent)}/mo</div>
            </div>
          )}
        </div>
      </div>

      <CostIndexChart index={rppAll} cityName={metro.short_name} />

      <AdSlot id="cost-after-chart" />

      <InsightCards rppAll={rppAll} acs={acs ?? null} cityName={metro.short_name} />

      <AffordabilityCalc
        cityName={metro.short_name}
        costIndex={rpp.all || 100}
        housingIndex={rpp.housing || 100}
        groceriesIndex={rpp.goods || 100}
        medianIncome={acs?.median_income ?? null}
      />

      {/* Area Overview */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3">Overview</h2>
        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
          <p className="text-slate-700 text-sm">{analysis.summary}</p>
        </div>
      </section>

      {(analysis.highlights.length > 0 || analysis.concerns.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {analysis.highlights.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-2">Advantages</h3>
              <ul className="space-y-1">
                {analysis.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.concerns.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-amber-700 mb-2">Watch Out For</h3>
              <ul className="space-y-1">
                {analysis.concerns.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">!</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {analysis.budgetTips.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3">Budget Tips for {metro.short_name}</h2>
          <div className="space-y-2">
            {analysis.budgetTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-500 text-sm mt-0.5">💡</span>
                <p className="text-slate-700 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="text-xl font-bold mb-3">Cost Breakdown</h2>
      <CostBreakdown rpp={rpp} />

      {/* Deep-dive cross-links — Tier S HCU expansion 2026-04-21 (+ Batch 9 2026-04-21) */}
      <section className="my-6 grid sm:grid-cols-2 gap-3">
        <a
          href={`/cities/${slug}/housing-breakdown/`}
          className="block p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition"
        >
          <div className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-1">
            Deep Dive · Housing
          </div>
          <div className="text-base font-bold text-slate-900 mb-1">
            {metro.short_name} housing breakdown: rent, buy & affordability →
          </div>
          <div className="text-sm text-slate-700">
            Rent vs. buy math at median home value, what your rent budget
            actually rents, income needed, and category comparison.
          </div>
        </a>
        <a
          href={`/cities/${slug}/utility-bill/`}
          className="block p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition"
        >
          <div className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-1">
            Deep Dive · Utilities
          </div>
          <div className="text-base font-bold text-slate-900 mb-1">
            {metro.short_name} utility bill: electric, gas, water, internet →
          </div>
          <div className="text-sm text-slate-700">
            Monthly bill breakdown, seasonal swing (summer vs. winter), climate
            zone context, and utility-share-of-rent budgeting.
          </div>
        </a>
      </section>

      {history.length > 1 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Cost of Living Trend</h2>
          <div className="space-y-1">
            {history.map((h) => {
              const maxVal = Math.max(...history.map(x => x.value));
              const minVal = Math.min(...history.map(x => x.value));
              const range = maxVal - minVal || 1;
              const width = ((h.value - minVal) / range) * 80 + 20;
              return (
                <div key={h.year} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-10">{h.year}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${h.value > 100 ? 'bg-red-300' : 'bg-green-300'}`} style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">{formatIndex(h.value)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {acs && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Income & Housing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {acs.median_income && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Median Household Income</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_income)}/year</div>
              </div>
            )}
            {acs.median_home_value && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Median Home Price</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_home_value)}</div>
                <div className="text-xs text-slate-400 mt-1">a.k.a. median home value (Census ACS)</div>
              </div>
            )}
            {acs.median_rent && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Median Monthly Rent</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_rent)}/mo</div>
              </div>
            )}
            {acs.per_capita_income && (
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-500">Per Capita Income</div>
                <div className="text-xl font-bold">{formatDollar(acs.per_capita_income)}/year</div>
              </div>
            )}
          </div>
        </section>
      )}

      <RelocationCalculator cityName={metro.short_name} defaultCostIndex={rppAll} />

      {/* Why this matters — US relocator context */}
      <section className="mb-8 mt-10" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why cost of living in {metro.short_name} matters
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>
            The Regional Price Parity (RPP) index from the BEA is the most
            authoritative single number for &ldquo;how much more or less does a
            dollar buy here compared to the average US metro?&rdquo;. {metro.short_name}&apos;s
            index of {formatIndex(rpp.all || 100)} means the same basket of
            goods, services, and housing costs {Math.abs((rpp.all || 100) - 100).toFixed(1)}%
            {(rpp.all || 100) > 100 ? " more " : " less "}
            here than the US average. For relocation decisions, that&apos;s a
            larger lever than most people realize &mdash; a 15% RPP gap on a
            $80,000 budget is $12,000 a year.
          </p>
          <p>
            Cost of living is dominated by housing in most US metros. The BEA
            publishes housing rents separately from goods and other services,
            and the housing component is usually the most volatile across
            metros. If a city&apos;s overall index looks expensive, check
            whether housing is doing all the work &mdash; it usually is.
          </p>
          <p>
            For an actual decision (job offer, move) pair this with three
            things: (1) take-home pay at the new salary and tax jurisdiction,
            (2) the property tax bill if you&apos;re buying, and (3) the
            housing market specifically (median home price or median rent).
            BEA RPP gives you the rough multiplier; the other three give you
            your actual monthly P&amp;L.
          </p>
          <p className="text-sm text-slate-500">
            BEA RPP data lags by 12&ndash;18 months. {metro.short_name}&apos;s
            {" "}{year} figures reflect the most recent complete release.
          </p>
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Salary needed in ${metro.short_name}`,
            blurb: `See actual ${metro.short_name} salaries by occupation \u2014 the other half of the affordability equation.`,
            href: `https://salarybycity.com/locations/${slug}`,
            cta: `Open SalaryByCity`,
            tone: "indigo" as const,
          },
          {
            title: `Take-home pay calculator`,
            blurb: `Convert gross salary to net pay at ${metro.short_name}'s state and local tax rates.`,
            href: `https://netpaypeek.com`,
            cta: `Open NetPayPeek`,
            tone: "emerald" as const,
          },
          {
            title: `Median home price`,
            blurb: `Housing usually drives the cost-of-living gap. See ${metro.short_name} home prices.`,
            href: `https://homepricepeek.com`,
            cta: `Open HomePricePeek`,
            tone: "amber" as const,
          },
        ]}
      />


      <AuthorBox />

      <FreshnessTag source="BEA Regional Price Parities + Census ACS + HUD FMR + BLS CPI" />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`Cost of Living in ${metro.short_name}`} url={`https://costbycity.com/cities/${slug}/`} source="CostByCity (BEA Data)" />
      </div>

          <EmbedButton url="https://costbycity.com" title="Data from CostByCity" site="CostByCity" siteUrl="https://costbycity.com" />

          <DataFeedback />

          <section className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">Moving to {metro.short_name}?</h3>
        <p className="text-emerald-800 text-sm leading-relaxed">
          Find affordable health insurance plans, compare renters insurance quotes, and estimate your mortgage payments before relocating.{" "}
          Check <a href={`https://salarybycity.com/locations/${slug}`} className="underline font-medium">salary data for {metro.short_name}</a> to see how your income compares to the local cost of living.
        </p>
      </section>

      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Explore More About {metro.short_name}</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`https://salarybycity.com/locations/${slug}/`} className="text-blue-600 hover:underline" target="_blank" rel="noopener">Salaries in {metro.short_name}</a>
          <a href={`https://guidebycity.com/city/${slug}/`} className="text-teal-600 hover:underline" target="_blank" rel="noopener">City Guide: {metro.short_name}</a>
        </div>
      </section>

      {/* 2026-04-28 — 'Compare {metro} With' 위젯 제거 (AdSense scaled-content remediation, /compare/* noindex).
          RelatedEntities 위젯이 동일 도시들로 연결되니 사용자 탐색 경로 유지됨. */}

      <RelatedEntities
        entityName={metro.short_name}
        heading={`Similar metros to ${metro.short_name}`}
        statLabel="Cost Index"
        items={getRelatedCities(metro.state, slug, 8).map((c) => ({
          name: c.short_name,
          href: `/cities/${c.slug}/`,
          stat: c.rpp_all.toFixed(1),
        }))}
      />

      <AdSlot id="cost-before-faq" />

      <FeedbackButton pageId={slug} />

      <FAQ items={faqs} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
