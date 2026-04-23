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
import { FeedbackButton } from "@/components/FeedbackButton";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";

export const dynamicParams = false;
export const revalidate = false;

const SITE_URL = "https://costbycity.com";

// US baseline monthly utility costs (EIA 2024 residential averages + industry 2025 refs).
// Keep in sync with any future centralized utility-cost module.
const US_ELECTRIC = 137; // EIA 2024 residential avg bill ~$135/mo, rounded.
const US_GAS = 72; // EIA 2024 residential natural gas winter average.
const US_WATER = 73; // Circle of Blue 2023 Water Survey median ~$70.
const US_INTERNET = 78; // Broadband Now 2024 typical 200Mbps plan.
const US_TOTAL = US_ELECTRIC + US_GAS + US_WATER + US_INTERNET;

// Climate-zone heuristic by state code. Used for seasonal bill context only.
const STATE_CLIMATE: Record<string, { zone: string; desc: string; electricSkew: number; gasSkew: number }> = {
  AL: { zone: "Hot-Humid", desc: "Summer-cooling dominates; electric bills peak Jun–Sep.", electricSkew: 1.15, gasSkew: 0.75 },
  AK: { zone: "Arctic/Subarctic", desc: "Heating dominates 8+ months; natural-gas or fuel-oil bills very high.", electricSkew: 0.95, gasSkew: 1.55 },
  AZ: { zone: "Hot-Dry", desc: "Extreme summer cooling; electric Jun–Sep bills 2–3× winter.", electricSkew: 1.25, gasSkew: 0.6 },
  AR: { zone: "Mixed-Humid", desc: "Balanced cooling + heating; moderate seasonal swings.", electricSkew: 1.05, gasSkew: 0.9 },
  CA: { zone: "Varies (Marine/Hot-Dry)", desc: "Coastal metros mild (low electric); inland valleys high summer cooling.", electricSkew: 0.95, gasSkew: 0.85 },
  CO: { zone: "Cold-Dry", desc: "Long heating season; gas bills elevated Nov–Mar.", electricSkew: 0.9, gasSkew: 1.2 },
  CT: { zone: "Cold-Humid", desc: "High winter heating; oil and gas mix; some of the highest US electric rates.", electricSkew: 1.25, gasSkew: 1.25 },
  DC: { zone: "Mixed-Humid", desc: "Moderate year-round; four-season utilities.", electricSkew: 1.0, gasSkew: 1.0 },
  DE: { zone: "Mixed-Humid", desc: "Moderate year-round; four-season utilities.", electricSkew: 1.0, gasSkew: 1.0 },
  FL: { zone: "Hot-Humid", desc: "Extreme summer cooling; essentially no gas heating in south FL.", electricSkew: 1.25, gasSkew: 0.4 },
  GA: { zone: "Hot-Humid", desc: "Summer cooling dominates; mild winters.", electricSkew: 1.15, gasSkew: 0.8 },
  HI: { zone: "Tropical", desc: "Year-round mild; among highest US electric rates (imported oil).", electricSkew: 1.45, gasSkew: 0.5 },
  ID: { zone: "Cold-Dry", desc: "Long heating season; relatively cheap hydro electric.", electricSkew: 0.8, gasSkew: 1.2 },
  IL: { zone: "Cold-Humid", desc: "Strong seasonal swing — winter gas + summer electric both high.", electricSkew: 1.05, gasSkew: 1.25 },
  IN: { zone: "Cold-Humid", desc: "Winter gas heating + summer cooling; balanced high bills.", electricSkew: 1.05, gasSkew: 1.2 },
  IA: { zone: "Cold-Humid", desc: "Long winters; gas bills significantly elevated.", electricSkew: 0.95, gasSkew: 1.3 },
  KS: { zone: "Mixed-Dry", desc: "Hot summers + cold winters; high utility swing.", electricSkew: 1.05, gasSkew: 1.15 },
  KY: { zone: "Mixed-Humid", desc: "Four-season mixed; gas and electric both moderate.", electricSkew: 1.0, gasSkew: 1.05 },
  LA: { zone: "Hot-Humid", desc: "Extreme summer cooling; mild winters.", electricSkew: 1.2, gasSkew: 0.75 },
  ME: { zone: "Cold-Humid", desc: "Very long heating season; fuel oil common; gas bills high.", electricSkew: 1.15, gasSkew: 1.4 },
  MD: { zone: "Mixed-Humid", desc: "Four-season utilities; above-average electric rates.", electricSkew: 1.1, gasSkew: 1.05 },
  MA: { zone: "Cold-Humid", desc: "Long winter heating; among highest US electric rates.", electricSkew: 1.3, gasSkew: 1.3 },
  MI: { zone: "Cold-Humid", desc: "Winter-heating dominant; high gas bills.", electricSkew: 1.0, gasSkew: 1.3 },
  MN: { zone: "Cold-Humid", desc: "Extreme winters; gas bills significantly elevated Nov–Mar.", electricSkew: 0.9, gasSkew: 1.4 },
  MS: { zone: "Hot-Humid", desc: "Summer cooling dominant; mild winters.", electricSkew: 1.15, gasSkew: 0.75 },
  MO: { zone: "Mixed-Humid", desc: "Hot summers + cold winters.", electricSkew: 1.05, gasSkew: 1.1 },
  MT: { zone: "Cold-Dry", desc: "Long winters; cheap electric (hydro); high gas.", electricSkew: 0.8, gasSkew: 1.3 },
  NE: { zone: "Cold-Dry", desc: "Extreme swings — hot summers, cold winters.", electricSkew: 1.05, gasSkew: 1.2 },
  NV: { zone: "Hot-Dry", desc: "Extreme summer cooling in south NV; mild in north.", electricSkew: 1.2, gasSkew: 0.7 },
  NH: { zone: "Cold-Humid", desc: "Long winters; oil heat common in older homes.", electricSkew: 1.15, gasSkew: 1.3 },
  NJ: { zone: "Mixed-Humid", desc: "Four-season utilities; above-average rates.", electricSkew: 1.15, gasSkew: 1.1 },
  NM: { zone: "Mixed-Dry", desc: "Hot summers in south; cool winters in north.", electricSkew: 1.0, gasSkew: 0.9 },
  NY: { zone: "Cold-Humid", desc: "Long winters; NYC metro has among highest electric rates.", electricSkew: 1.2, gasSkew: 1.25 },
  NC: { zone: "Mixed-Humid", desc: "Balanced summer cooling + winter heating.", electricSkew: 1.05, gasSkew: 0.95 },
  ND: { zone: "Cold-Dry", desc: "Extreme winters; gas bills very elevated.", electricSkew: 0.9, gasSkew: 1.45 },
  OH: { zone: "Cold-Humid", desc: "Long winters; mixed gas and electric heating.", electricSkew: 1.0, gasSkew: 1.2 },
  OK: { zone: "Mixed-Dry", desc: "Hot summers + variable winters.", electricSkew: 1.05, gasSkew: 1.0 },
  OR: { zone: "Marine/Mixed", desc: "Mild year-round; cheap hydro electric.", electricSkew: 0.75, gasSkew: 0.95 },
  PA: { zone: "Mixed-Humid", desc: "Four-season; varied gas/oil/electric heating.", electricSkew: 1.05, gasSkew: 1.15 },
  RI: { zone: "Cold-Humid", desc: "Long winters; high electric rates in New England.", electricSkew: 1.25, gasSkew: 1.25 },
  SC: { zone: "Hot-Humid", desc: "Summer cooling dominant; mild winters.", electricSkew: 1.15, gasSkew: 0.85 },
  SD: { zone: "Cold-Dry", desc: "Extreme winters; high gas bills.", electricSkew: 0.95, gasSkew: 1.3 },
  TN: { zone: "Mixed-Humid", desc: "Balanced cooling + heating.", electricSkew: 1.05, gasSkew: 0.95 },
  TX: { zone: "Hot-Humid (mostly)", desc: "Extreme summer cooling; mild winters; ERCOT grid variable pricing.", electricSkew: 1.2, gasSkew: 0.7 },
  UT: { zone: "Cold-Dry", desc: "Long heating season; cheap electric.", electricSkew: 0.85, gasSkew: 1.1 },
  VT: { zone: "Cold-Humid", desc: "Long winters; oil heat common.", electricSkew: 1.1, gasSkew: 1.3 },
  VA: { zone: "Mixed-Humid", desc: "Four-season utilities; moderate rates.", electricSkew: 1.05, gasSkew: 1.0 },
  WA: { zone: "Marine/Mixed", desc: "Mild year-round; cheap hydro electric.", electricSkew: 0.75, gasSkew: 0.9 },
  WV: { zone: "Mixed-Humid", desc: "Four-season; gas and electric both moderate.", electricSkew: 1.0, gasSkew: 1.1 },
  WI: { zone: "Cold-Humid", desc: "Long winters; high gas bills Nov–Mar.", electricSkew: 0.95, gasSkew: 1.3 },
  WY: { zone: "Cold-Dry", desc: "Extreme winters; cheap coal-fired electric.", electricSkew: 0.75, gasSkew: 1.25 },
};

function climateFor(state: string) {
  return (
    STATE_CLIMATE[state] || {
      zone: "Mixed",
      desc: "Balanced four-season utilities typical of the US continental climate.",
      electricSkew: 1.0,
      gasSkew: 1.0,
    }
  );
}

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
  const { metro, rpp, year } = data;
  const utilities = rpp.utilities ?? rpp.all ?? 100;
  const totalBill = Math.round((US_TOTAL * utilities) / 100);

  return {
    title: `${metro.short_name} Utility Bill Breakdown ${year} — ~${formatDollar(totalBill)}/mo · Index ${formatIndex(utilities)}`,
    description: `${metro.short_name}, ${metro.state} monthly utility costs. Utilities RPP ${formatIndex(utilities)} (${formatPctDiff(utilities)} US). Electric, gas, water, internet breakdown with climate-zone seasonal context. BEA + EIA data.`,
    alternates: { canonical: `/cities/${slug}/utility-bill/` },
    openGraph: { url: `/cities/${slug}/utility-bill/` },
  };
}

export default async function UtilityBillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCityData(slug);
  if (!data) notFound();

  const { metro, rpp, acs, year } = data;
  const overall = rpp.all ?? 100;
  const utilities = rpp.utilities ?? overall;
  const housing = rpp.housing ?? overall;
  const goods = rpp.goods ?? overall;
  const services = rpp.other_services ?? overall;

  const climate = climateFor(metro.state);

  // Each utility gets RPP multiplier × any climate skew (electric/gas only).
  const electric = Math.round((US_ELECTRIC * utilities * climate.electricSkew) / 100);
  const gas = Math.round((US_GAS * utilities * climate.gasSkew) / 100);
  const water = Math.round((US_WATER * utilities) / 100);
  const internet = Math.round((US_INTERNET * utilities) / 100);
  const total = electric + gas + water + internet;
  const annualBill = total * 12;

  // Summer/winter swings for seasonal table.
  const summerElectric = Math.round(electric * (climate.electricSkew >= 1.15 ? 1.55 : 1.3));
  const winterElectric = Math.round(electric * (climate.electricSkew >= 1.15 ? 0.75 : 0.85));
  const summerGas = Math.round(gas * 0.45);
  const winterGas = Math.round(gas * (climate.gasSkew >= 1.2 ? 2.0 : 1.6));

  const summerTotal = summerElectric + summerGas + water + internet;
  const winterTotal = winterElectric + winterGas + water + internet;

  // Rent-to-utility ratio (housing is the main cost, but utilities are a budget buffer).
  const medianRent = acs?.median_rent ?? Math.round((1163 * housing) / 100);
  const utilityShareOfRent = ((total / medianRent) * 100).toFixed(1);

  // Income needed context (use median income or US baseline).
  const medianIncome = acs?.median_income ?? null;
  const annualAsPercentOfIncome = medianIncome
    ? ((annualBill / medianIncome) * 100).toFixed(1)
    : null;

  // Peer same-state metros for compare (up to 4)
  const related = getRelatedCities(metro.state, slug, 12);
  const peers = related.slice(0, 4);

  // Verdict for "high" vs "low" utility-cost metro.
  const verdict: "high" | "low" | "avg" =
    utilities >= 108 ? "high" : utilities <= 92 ? "low" : "avg";

  const verdictText = {
    high: `${metro.short_name} is a high-utility-cost metro — expect to budget ~${formatDollar(total)}/mo (roughly ${utilityShareOfRent}% of median rent). Climate context: ${climate.desc.toLowerCase()}`,
    low: `${metro.short_name} runs below-average for utilities at ~${formatDollar(total)}/mo (${formatPctDiff(utilities)} US). Climate: ${climate.desc.toLowerCase()}`,
    avg: `${metro.short_name} utility costs sit near US average at ~${formatDollar(total)}/mo. Climate: ${climate.desc.toLowerCase()}`,
  }[verdict];

  const faqs: { q: string; a: string }[] = [
    {
      q: `What's the average monthly utility bill in ${metro.short_name}?`,
      a: `Based on BEA's utilities RPP of ${formatIndex(utilities)} (${formatPctDiff(utilities)} US average), total residential utilities run approximately ${formatDollar(total)}/month: ${formatDollar(electric)} electric, ${formatDollar(gas)} gas, ${formatDollar(water)} water/sewer, and ${formatDollar(internet)} internet. These are smoothed annual averages — monthly bills swing ±30–50% by season depending on climate zone (${climate.zone} here).`,
    },
    {
      q: `Why is electric higher in summer or winter in ${metro.short_name}?`,
      a: `${metro.short_name} is in the ${climate.zone} climate zone. ${climate.desc} Summer peak-cooling bills run around ${formatDollar(summerElectric)}/mo while winter low-cooling bills drop to ~${formatDollar(winterElectric)}/mo. The gap narrows with efficient HVAC and widens with older buildings.`,
    },
    {
      q: `Is natural gas the main heating source in ${metro.short_name}?`,
      a: `${climate.gasSkew >= 1.2 ? `Yes — ${metro.short_name} winters are long enough that gas heating dominates. Expect gas bills to roughly double from summer (~${formatDollar(summerGas)}) to winter (~${formatDollar(winterGas)}).` : climate.gasSkew <= 0.75 ? `Less so — ${metro.short_name}'s mild winters mean many homes use electric-only heating or heat pumps. Gas bills stay low year-round.` : `Mixed — ${metro.short_name} uses a combination of gas heating, electric heat pumps, and (in older buildings) oil. Gas bills show moderate seasonal swings.`}`,
    },
    {
      q: `How much is water and sewer in ${metro.short_name}?`,
      a: `Residential water + sewer averages about ${formatDollar(water)}/month in ${metro.short_name}, tracking the utilities RPP. Water bills depend heavily on lot size (lawn watering), household size, and whether sewer is billed separately. City-specific rates vary — this is a metro-average estimate.`,
    },
    {
      q: `What internet speed does ${formatDollar(internet)}/mo buy in ${metro.short_name}?`,
      a: `At the ${formatDollar(internet)}/month price point, ${metro.short_name} residents typically get 200–500 Mbps cable or fiber from incumbent ISPs. Fiber markets (Google Fiber, AT&T, Verizon FiOS) get 1 Gbps at the same price; DSL-only rural areas pay similar money for 25–100 Mbps. Metro averages understate rural variation.`,
    },
    {
      q: `What percentage of rent is utilities in ${metro.short_name}?`,
      a: `Utilities (~${formatDollar(total)}/mo) run about ${utilityShareOfRent}% of median rent (${formatDollar(medianRent)}/mo) in ${metro.short_name}. This ratio is useful for budget planning: most renters target 3–5% of gross income for utilities. A high utility-to-rent ratio (above 15%) usually signals an older building or extreme climate; a low ratio (below 8%) typically means the building includes some utilities.`,
    },
    {
      q: `Why does ${metro.short_name} have ${verdict === "high" ? "high" : verdict === "low" ? "low" : "average"} utility costs?`,
      a: `Utility costs depend on three things: wholesale energy generation mix (coal/gas/nuclear/renewable), transmission infrastructure, and climate demand. ${metro.short_name} at ${formatIndex(utilities)} RPP reflects the combined effect. ${verdict === "high" ? "High-cost metros usually combine expensive generation (imported fuel, strict carbon caps, or aging grid) with high climate demand." : verdict === "low" ? "Low-cost metros typically benefit from cheap hydro, coal, or nuclear generation plus mild climate, reducing demand." : "Average-cost metros have balanced generation mix and moderate climate demand."}`,
    },
    {
      q: `Are utilities included in ${metro.short_name} apartment rents?`,
      a: `Most ${metro.short_name} single-family rentals and market-rate apartments bill utilities separately — tenants cover electric, gas, water, internet on top of base rent. Some multi-family buildings include water+trash (~${formatDollar(water)}/mo) in rent; true "all utilities included" rentals are rare outside of small studios. Always confirm which utilities are included before signing.`,
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
              { "@type": "ListItem", position: 4, name: "Utility Bill", item: `${SITE_URL}/cities/${slug}/utility-bill/` },
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
          { label: "Utility Bill" },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          {metro.short_name} Utility Bill Breakdown — {year}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Residential utilities in {metro.short_name}, {metro.state} total
          approximately <strong>{formatDollar(total)}/month</strong> (
          {formatDollar(annualBill)}/year). Utilities RPP{" "}
          <strong>{formatIndex(utilities)}</strong> — {formatPctDiff(utilities)}{" "}
          the US average. Climate zone: <strong>{climate.zone}</strong>.
        </p>
        <FreshnessTag source={`BEA RPP ${year} + EIA residential averages`} />
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-1">
            Electric
          </div>
          <div className="text-xl font-bold text-amber-900">
            {formatDollar(electric)}
            <span className="text-xs font-normal text-amber-700">/mo</span>
          </div>
          <div className="text-xs text-amber-800 mt-1">
            US avg: {formatDollar(US_ELECTRIC)}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-xs text-orange-700 uppercase tracking-wider font-semibold mb-1">
            Natural Gas
          </div>
          <div className="text-xl font-bold text-orange-900">
            {formatDollar(gas)}
            <span className="text-xs font-normal text-orange-700">/mo</span>
          </div>
          <div className="text-xs text-orange-800 mt-1">
            US avg: {formatDollar(US_GAS)}
          </div>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
          <div className="text-xs text-sky-700 uppercase tracking-wider font-semibold mb-1">
            Water/Sewer
          </div>
          <div className="text-xl font-bold text-sky-900">
            {formatDollar(water)}
            <span className="text-xs font-normal text-sky-700">/mo</span>
          </div>
          <div className="text-xs text-sky-800 mt-1">
            US avg: {formatDollar(US_WATER)}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="text-xs text-indigo-700 uppercase tracking-wider font-semibold mb-1">
            Internet
          </div>
          <div className="text-xl font-bold text-indigo-900">
            {formatDollar(internet)}
            <span className="text-xs font-normal text-indigo-700">/mo</span>
          </div>
          <div className="text-xs text-indigo-800 mt-1">
            US avg: {formatDollar(US_INTERNET)}
          </div>
        </div>
      </section>

      <div
        className={`my-6 p-5 rounded-xl border ${
          verdict === "high"
            ? "bg-rose-50 border-rose-200"
            : verdict === "low"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider font-semibold mb-1 text-slate-600">
              Total Monthly
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {formatDollar(total)}
            </div>
            <div className="text-sm text-slate-700 mt-1">
              US baseline: {formatDollar(US_TOTAL)} ·{" "}
              {formatPctDiff(utilities)} average
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider font-semibold mb-1 text-slate-600">
              Annual Utility Spend
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatDollar(annualBill)}
              <span className="text-sm font-normal text-slate-600">/year</span>
            </div>
            {annualAsPercentOfIncome && (
              <div className="text-sm text-slate-700 mt-1">
                {annualAsPercentOfIncome}% of median household income
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-3">
          {verdictText}
        </p>
      </div>

      <EditorNote
        note={`Utility estimates combine BEA's Regional Price Parity (${formatIndex(utilities)}) with EIA residential baselines for ${metro.short_name}'s climate zone (${climate.zone}). Actual bills vary by home size, insulation age, HVAC efficiency, and household usage patterns — expect ±30% individual variance around these metro averages.`}
      />

      <AdSlot id="utility-bill-top" />

      {/* Seasonal swing table — this is the HCU-defense jewel: facts that vary by climate zone */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {metro.short_name} Seasonal Utility Swing
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Year-round utility bills hide a dramatic seasonal pattern. {metro.short_name}&rsquo;s{" "}
          {climate.zone} climate means electric and gas bills shift sharply by
          season:
        </p>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">
                  Utility
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Summer (Jun–Aug)
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Winter (Dec–Feb)
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Annual Avg
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 font-semibold">Electric</td>
                <td className="px-4 py-2 text-right text-rose-700 font-medium">
                  {formatDollar(summerElectric)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(winterElectric)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(electric)}/mo
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 font-semibold">Natural Gas</td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(summerGas)}/mo
                </td>
                <td className="px-4 py-2 text-right text-rose-700 font-medium">
                  {formatDollar(winterGas)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(gas)}/mo
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 font-semibold">Water/Sewer</td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(water)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(water)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(water)}/mo
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 font-semibold">Internet</td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(internet)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(internet)}/mo
                </td>
                <td className="px-4 py-2 text-right">
                  {formatDollar(internet)}/mo
                </td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-4 py-2 font-bold">Total</td>
                <td className="px-4 py-2 text-right font-bold">
                  {formatDollar(summerTotal)}/mo
                </td>
                <td className="px-4 py-2 text-right font-bold">
                  {formatDollar(winterTotal)}/mo
                </td>
                <td className="px-4 py-2 text-right font-bold">
                  {formatDollar(total)}/mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Summer/winter swings use climate-zone skew factors on top of BEA
          utilities RPP. Individual bills vary with building age, HVAC
          efficiency, household size, and thermostat settings.
        </p>
      </section>

      {/* Utilities vs other cost categories */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {metro.short_name} Utilities vs. Other Cost Categories
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          BEA Regional Price Parities (RPPs) measure each category&apos;s local
          cost relative to the US average (100). Seeing where utilities sit
          relative to housing and services tells you{" "}
          <em>what drives the local cost-of-living story</em>.
        </p>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">
                  Category
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Index
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  vs US
                </th>
                <th className="px-4 py-2 font-medium text-slate-600">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-blue-50">
                <td className="px-4 py-2 font-bold">Utilities</td>
                <td className="px-4 py-2 text-right font-bold">
                  {formatIndex(utilities)}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatPctDiff(utilities)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Electric, gas, water, internet
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Housing (shelter)</td>
                <td className="px-4 py-2 text-right">
                  {formatIndex(housing)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatPctDiff(housing)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Rent and owner-equivalent rent
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Goods</td>
                <td className="px-4 py-2 text-right">{formatIndex(goods)}</td>
                <td className="px-4 py-2 text-right">
                  {formatPctDiff(goods)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Groceries, apparel, durable goods
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Other services</td>
                <td className="px-4 py-2 text-right">
                  {formatIndex(services)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatPctDiff(services)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Healthcare, education, recreation
                </td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-4 py-2 font-medium">Overall</td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatIndex(overall)}
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {formatPctDiff(overall)}
                </td>
                <td className="px-4 py-2 text-xs text-slate-600">
                  Weighted composite
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {utilities > housing
            ? `Notable: utilities (${formatIndex(utilities)}) run higher than housing (${formatIndex(housing)}) here — uncommon, and usually reflects either extreme climate demand or expensive electricity generation.`
            : utilities < housing - 20
              ? `Notable: utilities (${formatIndex(utilities)}) are much cheaper than housing (${formatIndex(housing)}) in ${metro.short_name} — the local cost story is dominated by rent, not bills.`
              : `Utilities and housing indices are roughly aligned in ${metro.short_name}, typical of most US metros where energy prices track local economic conditions.`}
        </p>
      </section>

      <AdSlot id="utility-bill-mid" />

      {/* Income context */}
      {medianIncome && (
        <section className="my-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Utilities as Share of Income in {metro.short_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Annual Utilities
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatDollar(annualBill)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {formatDollar(total)}/mo × 12
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Median Household Income
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatDollar(medianIncome)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {year} ACS 5-year estimate
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Share of Income
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {annualAsPercentOfIncome}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                US median: ~3.5%
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Financial planners typically budget{" "}
            <strong>3–5% of gross income</strong> for utilities. ${annualAsPercentOfIncome}% in{" "}
            {metro.short_name}{" "}
            {parseFloat(annualAsPercentOfIncome!) > 5
              ? "is above that band — consider energy-efficiency upgrades or ask about utility-allowance apartments."
              : parseFloat(annualAsPercentOfIncome!) < 3
                ? "is below that band — utilities are not a major line item in local budgets."
                : "is comfortably within that band."}
          </p>
        </section>
      )}

      {/* What your utility budget buys */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          What Your Utility Budget Actually Buys in {metro.short_name}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Same baseline bill (~{formatDollar(total)}/mo) buys different things
          depending on usage intensity. Mapping {metro.short_name}&apos;s utility
          RPP to common household archetypes:
        </p>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">
                  Household
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Total
                </th>
                <th className="px-4 py-2 font-medium text-slate-600">
                  Context
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { mult: 0.55, label: "Studio / 1-person", context: "Small apartment, no dryer, modest climate control" },
                { mult: 0.75, label: "1BR / 1-person", context: "Typical young-professional; standard usage" },
                { mult: 1.0, label: "2BR / couple (metro avg)", context: "Most-common rental profile; metro baseline" },
                { mult: 1.3, label: "3BR / family of 4", context: "Single-family home or large apartment with kids" },
                { mult: 1.7, label: "4BR / large family", context: "Larger home, more appliances, higher HVAC demand" },
                { mult: 2.2, label: "Luxury home / heavy usage", context: "Pool pump, multi-zone HVAC, home office setups" },
              ].map((row, i) => {
                const budget = Math.round(total * row.mult);
                return (
                  <tr
                    key={i}
                    className={`border-t border-slate-100 ${
                      row.mult === 1.0 ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-semibold">{row.label}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      {formatDollar(budget)}/mo
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {row.context}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Peer cities */}
      {peers.length > 0 && (
        <section className="my-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Compare {metro.short_name} Utilities to Same-State Peers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {peers.map((p) => (
              <a
                key={p.slug}
                href={`/cities/${p.slug}/utility-bill/`}
                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-amber-400 hover:shadow-sm transition"
              >
                <div className="text-base font-bold text-slate-900 mb-1">
                  {p.short_name}
                </div>
                <div className="text-xs text-slate-500">
                  Overall index {formatIndex(p.rpp_all)}
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Utility detail →
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Parent + sibling cross-link */}
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
          href={`/cities/${slug}/housing-breakdown/`}
          className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition"
        >
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Sibling Deep Dive
          </div>
          <div className="text-base font-bold text-slate-900 mb-1">
            {metro.short_name} housing breakdown →
          </div>
          <div className="text-sm text-slate-600">
            Rent vs. buy math at median home value, PITI, affordability
            scenarios.
          </div>
        </a>
      </section>

      {/* FAQ */}
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Frequently Asked Questions: {metro.short_name} Utilities
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group bg-white border border-slate-200 rounded-xl p-4 open:border-amber-300"
            >
              <summary className="cursor-pointer font-semibold text-slate-900 text-sm list-none flex items-start gap-2">
                <span className="text-amber-500 group-open:rotate-90 transition-transform">
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

      <FeedbackButton pageId={`utility-bill-${slug}`} />

      <div className="mt-10">
        <DataSourceBadge
          sources={[
            {
              name: "BEA Regional Price Parities",
              url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
            },
            {
              name: "EIA Residential Energy Consumption",
              url: "https://www.eia.gov/consumption/residential/",
            },
            {
              name: "EIA Electric Power Monthly",
              url: "https://www.eia.gov/electricity/monthly/",
            },
            {
              name: "Census ACS 5-Year",
              url: "https://www.census.gov/programs-surveys/acs/",
            },
          ]}
          updatedAt="2026-04"
        />
      </div>

      <AuthorBox />

      <CrossSiteLinks current="CostByCity" />
    </>
  );
}
