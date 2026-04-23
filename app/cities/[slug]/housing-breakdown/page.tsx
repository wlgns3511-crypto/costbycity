import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityData, getAllMetros, getRelatedCities } from "@/lib/db";
import { formatDollar, formatIndex, formatPctDiff } from "@/lib/format";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FreshnessTag } from "@/components/FreshnessTag";
import { AuthorBox } from "@/components/AuthorBox";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { EditorNote } from "@/components/EditorNote";
import { AdSlot } from "@/components/AdSlot";

export const dynamicParams = false;

const SITE_URL = "https://costbycity.com";

// US baselines (same as lib/cost-analysis.ts — keep in sync)
const US_MEDIAN_RENT = 1163;
const US_MEDIAN_HOME = 281900;
const US_MEDIAN_INCOME = 75149;

export async function generateStaticParams() {
  return getAllMetros().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) return {};
  const { metro, rpp, acs, year } = data;
  const housing = rpp.housing ?? rpp.all ?? 100;
  const rent = acs?.median_rent ?? 0;

  return {
    title: `${metro.short_name} Housing Cost Breakdown ${year} — Rent ${rent ? formatDollar(rent) : "Data"} · Index ${formatIndex(housing)}`,
    description: `${metro.short_name}, ${metro.state} housing cost deep-dive. Housing RPP index ${formatIndex(housing)} (${formatPctDiff(housing)} US). Median rent, home price, mortgage affordability, and renter/buyer math. ${year} BEA + ACS data.`,
    alternates: { canonical: `/cities/${slug}/housing-breakdown/` },
    openGraph: { url: `/cities/${slug}/housing-breakdown/` },
  };
}

export default async function HousingBreakdownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) notFound();

  const { metro, rpp, acs, year } = data;
  const overall = rpp.all ?? 100;
  const housing = rpp.housing ?? overall;
  const goods = rpp.goods ?? overall;
  const utilities = rpp.utilities ?? overall;
  const services = rpp.other_services ?? overall;

  const medianRent = acs?.median_rent ?? Math.round((US_MEDIAN_RENT * housing) / 100);
  const medianHome = acs?.median_home_value ?? Math.round((US_MEDIAN_HOME * housing) / 100);
  const medianIncome = acs?.median_income ?? null;

  // Housing-to-income ratio (30% rule — higher = less affordable)
  const annualRent = medianRent * 12;
  const rentBurden = medianIncome ? (annualRent / medianIncome) * 100 : null;

  // Back-of-envelope mortgage PITI on median home
  // 20% down, 30-yr fixed @ 7.25% (2026 approx), plus 1.2% prop tax, 0.5% insurance, 0.5% PMI avoided (20%)
  const loanAmt = medianHome * 0.8;
  const monthlyRate = 0.0725 / 12;
  const months = 360;
  const principalInterest =
    (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const monthlyTax = (medianHome * 0.012) / 12;
  const monthlyIns = (medianHome * 0.005) / 12;
  const totalPITI = Math.round(principalInterest + monthlyTax + monthlyIns);
  const incomeForPITI = Math.round(totalPITI * 3.33); // 30% rule reversed

  // Income required for 30% rent burden
  const incomeForRent = Math.round(annualRent / 0.3);

  // Peers within same state for compare cards (up to 4)
  const related = getRelatedCities(metro.state, slug, 12);
  const peers = related.slice(0, 4);

  // Rent-vs-buy crossover (simple):
  // If buy monthly (PITI) > rent × 1.25, renting wins short-term
  // If PITI < rent × 1.05, buying wins
  const pitiVsRent = totalPITI / medianRent;
  const verdict =
    pitiVsRent > 1.35
      ? "rent-favored"
      : pitiVsRent < 1.05
      ? "buy-favored"
      : "neutral";
  const verdictText =
    verdict === "rent-favored"
      ? `Renting looks favored short-term — PITI on a median home (${formatDollar(totalPITI)}) runs ${Math.round((pitiVsRent - 1) * 100)}% more than median rent (${formatDollar(medianRent)}).`
      : verdict === "buy-favored"
      ? `Buying is competitive — the PITI-to-rent ratio is only ${pitiVsRent.toFixed(2)}× in ${metro.short_name}, meaning owning costs roughly the same as renting before long-term equity gains.`
      : `The rent-vs-buy decision is close in ${metro.short_name} — PITI is about ${pitiVsRent.toFixed(2)}× median rent. Ownership wins modestly over 7+ years, renting wins for shorter stays.`;

  const faqs: { q: string; a: string }[] = [
    {
      q: `What is the median rent in ${metro.short_name}?`,
      a: acs?.median_rent
        ? `The median gross rent in ${metro.short_name} is ${formatDollar(acs.median_rent)}/month (${year} ACS 5-year estimates). This covers all bedroom counts combined; 1-bedroom rents typically run 15–25% below median, 3-bedroom 20–40% above.`
        : `ACS does not report a metro-level median rent for ${metro.short_name}. Based on the housing cost index of ${formatIndex(housing)} relative to US average rent of ${formatDollar(US_MEDIAN_RENT)}, the modeled rent is ${formatDollar(medianRent)}/month.`,
    },
    {
      q: `What is the median home price in ${metro.short_name}?`,
      a: acs?.median_home_value
        ? `Owner-occupied median home value in ${metro.short_name} is ${formatDollar(acs.median_home_value)} (${year} ACS). This reflects all existing owner homes, not current listings — market listings typically run 15–25% above ACS median.`
        : `${metro.short_name} ACS home value data is not available. Using the housing index, modeled median home value is ${formatDollar(medianHome)}.`,
    },
    {
      q: `How much do I need to earn to afford a home in ${metro.short_name}?`,
      a: `Applying the 28/36 rule to an 80%-LTV mortgage on the ${formatDollar(medianHome)} median home at current 7.25% rates, monthly PITI is roughly ${formatDollar(totalPITI)}. To keep housing at 30% of gross income, you would need about ${formatDollar(incomeForPITI)}/year. Renting the median requires roughly ${formatDollar(incomeForRent)}/year.`,
    },
    {
      q: `Is it cheaper to rent or buy in ${metro.short_name}?`,
      a: verdictText + " This ignores maintenance (1% of home value/year), closing costs, and long-term appreciation. For stays under 5 years renting usually wins; over 10 years buying usually wins unless prices fall.",
    },
    {
      q: `How does ${metro.short_name} housing compare to the US average?`,
      a: `${metro.short_name}'s BEA housing RPP is ${formatIndex(housing)}, meaning housing costs are ${formatPctDiff(housing)} the US average. The overall cost-of-living index is ${formatIndex(overall)} (${formatPctDiff(overall)} US) — the gap between housing and overall COL tells you whether housing is the main cost driver here.`,
    },
    {
      q: `What is rent burden in ${metro.short_name}?`,
      a: rentBurden
        ? `Median rent (${formatDollar(medianRent)}/mo) divided by median household income (${formatDollar(medianIncome)}/yr) works out to a ${rentBurden.toFixed(1)}% rent burden. ${rentBurden > 30 ? "This is above the 30% cost-burdened threshold HUD tracks — typical for coastal and high-growth metros." : "This is below the 30% cost-burdened threshold, indicating housing is relatively affordable relative to local wages."}`
        : `Rent burden requires median household income data, which is not reported for ${metro.short_name}. For the US overall, the median rent-to-income ratio is roughly 18.6% (${formatDollar(US_MEDIAN_RENT)} / ${formatDollar(US_MEDIAN_INCOME)}).`,
    },
    {
      q: `Are utilities included in ${metro.short_name} housing costs?`,
      a: `BEA's housing RPP (${formatIndex(housing)}) covers shelter only (rent or owner-equivalent). ${metro.short_name}'s utility RPP is ${formatIndex(utilities)} (${formatPctDiff(utilities)} US) — tracked separately. Most rental listings in the ${metro.short_name} metro quote rent without utilities; budget an additional ${formatDollar(Math.round(200 * (utilities / 100)))}–${formatDollar(Math.round(350 * (utilities / 100)))}/mo for electricity, gas, water, and internet.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/cities/` },
              { "@type": "ListItem", position: 3, name: metro.short_name, item: `${SITE_URL}/cities/${slug}/` },
              { "@type": "ListItem", position: 4, name: "Housing Breakdown", item: `${SITE_URL}/cities/${slug}/housing-breakdown/` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/cities/" },
          { label: metro.short_name, href: `/cities/${slug}/` },
          { label: "Housing Breakdown" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          {metro.short_name} Housing Cost Breakdown — {year}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Housing in {metro.short_name}, {metro.state} runs at a BEA index of{" "}
          <strong>{formatIndex(housing)}</strong> — {formatPctDiff(housing)} the
          US average. Median rent{" "}
          <strong>{formatDollar(medianRent)}/month</strong>, median home value{" "}
          <strong>{formatDollar(medianHome)}</strong>, and a 20%-down PITI of
          about <strong>{formatDollar(totalPITI)}/month</strong> at 7.25% rates.
        </p>
        <FreshnessTag source={`BEA RPP ${year} + ACS 5-year`} />
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-1">
            Housing Index
          </div>
          <div className="text-2xl font-bold text-emerald-900 mb-2">
            {formatIndex(housing)}
          </div>
          <div className="text-xs text-emerald-800 leading-snug">
            {formatPctDiff(housing)} US average (100)
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-1">
            Median Rent
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-2">
            {formatDollar(medianRent)}
            <span className="text-sm font-normal text-amber-700">/mo</span>
          </div>
          <div className="text-xs text-amber-800 leading-snug">
            {acs?.median_rent ? `${year} ACS gross rent` : "Modeled from housing index"}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <div className="text-xs text-indigo-700 uppercase tracking-wider font-semibold mb-1">
            Median Home Value
          </div>
          <div className="text-2xl font-bold text-indigo-900 mb-2">
            {formatDollar(medianHome)}
          </div>
          <div className="text-xs text-indigo-800 leading-snug">
            {acs?.median_home_value ? `${year} ACS owner-occupied` : "Modeled from housing index"}
          </div>
        </div>
      </section>

      <EditorNote
        note={`Housing RPP measures the cost of shelter — rent for renters, owner-equivalent rent for owners. It does not include utilities (tracked separately at ${formatIndex(utilities)} here) or property taxes. Market listings often diverge from ACS median values by 15–25% in either direction.`}
      />

      <AdSlot id="4567890123" />

      {/* Category comparison table */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {metro.short_name} Housing vs. Other Cost Categories
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          BEA Regional Price Parities (RPPs) measure each category&apos;s local
          cost relative to the US average (100). Comparing housing to other
          categories tells you <em>where</em> the cost-of-living pressure
          concentrates.
        </p>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">Category</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">Index</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">vs US</th>
                <th className="px-4 py-2 font-medium text-slate-600">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-blue-50">
                <td className="px-4 py-2 font-bold">Housing (shelter)</td>
                <td className="px-4 py-2 text-right font-bold">{formatIndex(housing)}</td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatPctDiff(housing)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Rent and owner-equivalent rent
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Utilities</td>
                <td className="px-4 py-2 text-right">{formatIndex(utilities)}</td>
                <td className="px-4 py-2 text-right">{formatPctDiff(utilities)}</td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Electricity, gas, water, trash
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Goods</td>
                <td className="px-4 py-2 text-right">{formatIndex(goods)}</td>
                <td className="px-4 py-2 text-right">{formatPctDiff(goods)}</td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Groceries, apparel, durable goods
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Other services</td>
                <td className="px-4 py-2 text-right">{formatIndex(services)}</td>
                <td className="px-4 py-2 text-right">{formatPctDiff(services)}</td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Healthcare, education, recreation
                </td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-4 py-2 font-medium">Overall</td>
                <td className="px-4 py-2 text-right font-medium">{formatIndex(overall)}</td>
                <td className="px-4 py-2 text-right font-medium">{formatPctDiff(overall)}</td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Weighted composite
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          A housing index well above the overall index means shelter is the
          primary reason this metro feels expensive. A housing index below
          overall means goods, utilities, or services are the main cost
          drivers.
        </p>
      </section>

      {/* Rent vs Buy math */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Rent vs. Buy in {metro.short_name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Renting (Median Unit)
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Monthly rent</dt>
                <dd className="font-medium">{formatDollar(medianRent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Annual rent</dt>
                <dd className="font-medium">{formatDollar(annualRent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Income needed (30% rule)</dt>
                <dd className="font-medium">{formatDollar(incomeForRent)}/yr</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">5-year total</dt>
                <dd className="font-medium">{formatDollar(annualRent * 5)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Build-equity</dt>
                <dd className="font-medium text-red-600">None</dd>
              </div>
            </dl>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Buying (Median Home, 20% Down)
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Down payment (20%)</dt>
                <dd className="font-medium">{formatDollar(Math.round(medianHome * 0.2))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Principal + interest</dt>
                <dd className="font-medium">{formatDollar(Math.round(principalInterest))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Property tax (1.2%/yr)</dt>
                <dd className="font-medium">{formatDollar(Math.round(monthlyTax))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Insurance (0.5%/yr)</dt>
                <dd className="font-medium">{formatDollar(Math.round(monthlyIns))}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <dt className="text-slate-700 font-medium">Monthly PITI</dt>
                <dd className="font-bold">{formatDollar(totalPITI)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Income needed (30% rule)</dt>
                <dd className="font-medium">{formatDollar(incomeForPITI)}/yr</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className={`mt-4 p-4 rounded-lg ${
          verdict === "rent-favored"
            ? "bg-amber-50 border border-amber-200"
            : verdict === "buy-favored"
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-slate-50 border border-slate-200"
        }`}>
          <div className="text-sm text-slate-700 leading-relaxed">
            <strong>
              {verdict === "rent-favored"
                ? "Rent-favored market."
                : verdict === "buy-favored"
                ? "Buy-competitive market."
                : "Neutral market."}
            </strong>{" "}
            {verdictText}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Assumes 7.25% 30-year fixed mortgage rate, 20% down payment, 1.2%
          annual property tax, 0.5% annual insurance. PMI avoided at 20% down.
          Excludes HOA fees (typical $0–$500/mo condo/townhome), maintenance
          (~1%/yr of home value), and closing costs (~3% on buy).
        </p>
      </section>

      <AdSlot id="5678901234" />

      {/* What $X rent buys — anchoring to recognizable budget buckets */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          What Your Rent Budget Actually Rents in {metro.short_name}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Rough size-class mapping using {metro.short_name}&apos;s{" "}
          {formatDollar(medianRent)}/mo median as the anchor. Bedroom counts are
          approximations from ACS micro-data trends; specific unit listings
          vary ±20%.
        </p>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">Budget</th>
                <th className="px-4 py-2 font-medium text-slate-600">Typical Unit</th>
                <th className="px-4 py-2 font-medium text-slate-600">vs. Median</th>
              </tr>
            </thead>
            <tbody>
              {[
                { mult: 0.65, label: "Studio / small 1BR, older building, limited amenities" },
                { mult: 0.85, label: "1-bedroom, solid building, typical commute" },
                { mult: 1.0, label: "Median unit — ~2-bed mixed location" },
                { mult: 1.25, label: "2-bedroom, newer building or better neighborhood" },
                { mult: 1.6, label: "3-bedroom or luxury 2-bed, central location" },
                { mult: 2.0, label: "Family 3-4 bedroom, premium area, full amenities" },
              ].map((row, i) => {
                const budget = Math.round(medianRent * row.mult);
                const diff = Math.round((row.mult - 1) * 100);
                return (
                  <tr
                    key={i}
                    className={`border-t border-slate-100 ${
                      row.mult === 1.0 ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-bold">
                      {formatDollar(budget)}/mo
                    </td>
                    <td className="px-4 py-2 text-slate-700">{row.label}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {diff === 0 ? "median" : diff > 0 ? `+${diff}%` : `${diff}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Peer cities compare */}
      {peers.length > 0 && (
        <section className="my-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Compare {metro.short_name} Housing to Same-State Peers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {peers.map((p) => (
              <a
                key={p.slug}
                href={`/cities/${p.slug}/housing-breakdown/`}
                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition"
              >
                <div className="text-base font-bold text-slate-900 mb-1">
                  {p.short_name}
                </div>
                <div className="text-xs text-slate-500">
                  Overall index {formatIndex(p.rpp_all)}
                </div>
                <div className="text-xs text-blue-600 mt-1">Housing detail →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Parent cross-link + relocation calc */}
      <section className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`/cities/${slug}/`}
          className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition"
        >
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Full Cost Overview
          </div>
          <div className="text-base font-bold text-slate-900 mb-1">
            {metro.short_name} full cost of living →
          </div>
          <div className="text-sm text-slate-600">
            Full RPP category breakdown, relocation calculator, rankings
            context.
          </div>
        </a>
        <a
          href="/compare/"
          className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition"
        >
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Metro vs. Metro
          </div>
          <div className="text-base font-bold text-slate-900 mb-1">
            Compare {metro.short_name} to another city →
          </div>
          <div className="text-sm text-slate-600">
            Side-by-side housing, utilities, goods, and services for any two
            metros.
          </div>
        </a>
      </section>

      {/* FAQ */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Frequently Asked Questions: {metro.short_name} Housing
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group bg-white border border-slate-200 rounded-xl p-4 open:border-blue-300"
            >
              <summary className="cursor-pointer font-semibold text-slate-900 text-sm list-none flex items-start gap-2">
                <span className="text-blue-500 group-open:rotate-90 transition-transform">
                  ▸
                </span>
                <span>{f.q}</span>
              </summary>
              <p className="mt-3 ml-5 text-sm text-slate-700 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <DataSourceBadge
          sources={[
            {
              name: "BEA Regional Price Parities",
              url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
            },
            {
              name: "Census ACS 5-Year",
              url: "https://www.census.gov/programs-surveys/acs/",
            },
            {
              name: "HUD Rent Burden Standard",
              url: "https://www.hud.gov/topics/rental_assistance",
            },
          ]}
          updatedAt="2026-04"
        />
      </div>

      <AuthorBox />
    </>
  );
}
