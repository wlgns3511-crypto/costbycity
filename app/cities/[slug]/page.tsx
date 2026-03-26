import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityData, getAllMetros, getAllCitiesWithRPP, getRPPHistory } from "@/lib/db";
import { formatDollar, formatPctDiff, formatIndex } from "@/lib/format";
import { CostBreakdown } from "@/components/CostIndex";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";
import { breadcrumbSchema, faqSchema, generateCityFAQs } from "@/lib/schema";
import { analyzeCost } from "@/lib/cost-analysis";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllMetros().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) return {};
  const diff = formatPctDiff(data.rpp.all || 100);
  return {
    title: `Cost of Living in ${data.metro.short_name} (${data.year})`,
    description: `Cost of living in ${data.metro.short_name} is ${diff} the national average. See housing, goods, utilities breakdown and compare with other cities.`,
    alternates: { canonical: `/cities/${slug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) notFound();

  const { metro, rpp, acs, year } = data;
  const allCities = getAllCitiesWithRPP();
  const history = getRPPHistory(metro.fips);
  const analysis = analyzeCost(metro.short_name, rpp, acs ?? null, history);
  const baseFaqs = generateCityFAQs(metro.short_name, rpp, acs);
  const faqs = [
    ...baseFaqs,
    { question: `Is ${metro.short_name} affordable to live in?`, answer: analysis.affordabilityVerdict || analysis.summary },
    ...(analysis.salaryNeeded ? [{ question: `What salary do you need to live in ${metro.short_name}?`, answer: analysis.salaryNeeded }] : []),
    ...(analysis.trendNote ? [{ question: `Is ${metro.short_name} getting more expensive?`, answer: analysis.trendNote }] : []),
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Cities", url: "/cities" },
    { name: metro.short_name, url: `/cities/${slug}` },
  ];

  // Find nearby RPP cities for comparison suggestions
  const rppAll = rpp.all || 100;
  const compareCities = allCities
    .filter((c) => c.fips !== metro.fips)
    .sort((a, b) => Math.abs(a.rpp_all - rppAll) - Math.abs(b.rpp_all - rppAll))
    .slice(0, 10);

  return (
    <div>
      <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

      <h1 className="text-3xl font-bold mb-2">Cost of Living in {metro.short_name}</h1>
      <p className="text-slate-500 mb-6">{year} data from the Bureau of Economic Analysis</p>

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
                <div className="text-sm text-slate-500">Median Home Value</div>
                <div className="text-xl font-bold">{formatDollar(acs.median_home_value)}</div>
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

      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Explore More About {metro.short_name}</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`https://salarybycity.com/locations/${slug}/`} className="text-blue-600 hover:underline" target="_blank" rel="noopener">Salaries in {metro.short_name}</a>
          <a href={`https://guidebycity.com/city/${slug}/`} className="text-teal-600 hover:underline" target="_blank" rel="noopener">City Guide: {metro.short_name}</a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Compare {metro.short_name} With</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {compareCities.map((c) => {
            const [a, b] = [slug, c.slug].sort();
            return (
              <a key={c.fips} href={`/compare/${a}-vs-${b}`} className="text-emerald-600 hover:underline p-2 border border-slate-100 rounded">
                {metro.short_name} vs {c.short_name}
              </a>
            );
          })}
        </div>
      </section>

      <FAQ items={faqs} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
