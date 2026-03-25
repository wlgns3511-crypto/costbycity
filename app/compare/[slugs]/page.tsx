import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityData, getTopComparisons } from "@/lib/db";
import { formatDollar, formatIndex } from "@/lib/format";
import { ComparisonTable } from "@/components/CostIndex";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FAQ } from "@/components/FAQ";
import { breadcrumbSchema, faqSchema, generateCompareFAQs } from "@/lib/schema";

interface Props {
  params: Promise<{ slugs: string }>;
}

function parseSlugs(slugs: string): [string, string] | null {
  const match = slugs.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return [match[1], match[2]];
}

export async function generateStaticParams() {
  const pairs = getTopComparisons(3000);
  return pairs.map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { slugs: `${a}-vs-${b}` };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const [a, b] = parsed;
  const dataA = getCityData(a);
  const dataB = getCityData(b);
  if (!dataA || !dataB) return {};

  return {
    title: `${dataA.metro.short_name} vs ${dataB.metro.short_name} - Cost of Living Comparison`,
    description: `Compare cost of living between ${dataA.metro.short_name} (${formatIndex(dataA.rpp.all || 100)}) and ${dataB.metro.short_name} (${formatIndex(dataB.rpp.all || 100)}). Housing, goods, utilities side by side.`,
    alternates: { canonical: `/compare/${slugs}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();

  const [slugA, slugB] = parsed;
  const dataA = getCityData(slugA);
  const dataB = getCityData(slugB);
  if (!dataA || !dataB) notFound();

  const { metro: metroA, rpp: rppA, acs: acsA } = dataA;
  const { metro: metroB, rpp: rppB, acs: acsB } = dataB;
  const faqs = generateCompareFAQs(metroA.short_name, metroB.short_name, rppA, rppB);

  const cheaper = (rppA.all || 100) < (rppB.all || 100) ? metroA.short_name : metroB.short_name;
  const diffPct = Math.abs((rppA.all || 100) - (rppB.all || 100)).toFixed(1);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: `${metroA.short_name} vs ${metroB.short_name}`, url: `/compare/${slugs}` },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

      <h1 className="text-3xl font-bold mb-2">
        {metroA.short_name} vs {metroB.short_name}
      </h1>
      <p className="text-slate-500 mb-6">Cost of Living Comparison</p>

      <div className="bg-emerald-50 rounded-lg p-6 mb-6 text-center">
        <p className="text-lg">
          <span className="font-bold text-emerald-700">{cheaper}</span> is more affordable by{" "}
          <span className="font-bold">{diffPct} index points</span>
        </p>
      </div>

      <h2 className="text-xl font-bold mb-3">Side-by-Side Comparison</h2>
      <ComparisonTable
        cityA={metroA.short_name}
        cityB={metroB.short_name}
        rppA={rppA}
        rppB={rppB}
      />

      {(acsA || acsB) && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Income & Housing Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-right p-3 font-semibold">{metroA.short_name}</th>
                  <th className="text-right p-3 font-semibold">{metroB.short_name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-3">Median Household Income</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsA?.median_income ?? null)}</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsB?.median_income ?? null)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-3">Median Home Value</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsA?.median_home_value ?? null)}</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsB?.median_home_value ?? null)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-3">Median Monthly Rent</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsA?.median_rent ?? null)}</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsB?.median_rent ?? null)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-3">Per Capita Income</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsA?.per_capita_income ?? null)}</td>
                  <td className="p-3 text-right font-medium">{formatDollar(acsB?.per_capita_income ?? null)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <FAQ items={faqs} />

      <section className="mt-8">
        <div className="flex gap-4">
          <a href={`/cities/${slugA}`} className="text-emerald-600 hover:underline">
            More about {metroA.short_name} &rarr;
          </a>
          <a href={`/cities/${slugB}`} className="text-emerald-600 hover:underline">
            More about {metroB.short_name} &rarr;
          </a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
