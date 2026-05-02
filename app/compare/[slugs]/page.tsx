import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import * as fs from "fs";
import * as path from "path";
import { getCityData } from "@/lib/db";
import { formatDollar, formatIndex } from "@/lib/format";
import { ComparisonTable } from "@/components/CostIndex";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
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

// ── Static compare set (2026-04-23 Phase 2 prune) ──────────────────────────
// Replaced Top-100 RPP-diff SQL (99% nonsense cross-region pairs like
// "SF vs random rural town" — zero search demand per GSC impression data)
// with: curated editorial pairs (major metro rivalries with real relocation
// search intent) + GSC-discovered whitelist (URLs Google actually crawled
// with clicks>0 or impr>=3 over 28d).
//
// Rationale: TOP 50 GSC impression keywords contain ZERO pairwise "X vs Y"
// queries — users search "cost of living in [city]" directly. Compare pages
// serve minimal real demand; over-generation creates HCU thin-content risk.
function loadWhitelistedPairs(): { slugA: string; slugB: string }[] {
  const wlPath = path.resolve(process.cwd(), "data", "compare-whitelist.json");
  if (!fs.existsSync(wlPath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(wlPath, "utf8"));
    const seen = new Set<string>();
    const out: { slugA: string; slugB: string }[] = [];
    for (const e of raw.entries ?? []) {
      const p = String(e.path || "")
        .replace(/^\/compare\//, "")
        .replace(/\/$/, "");
      const m = p.match(/^(.+)-vs-(.+)$/);
      if (!m) continue;
      // Verify both metros exist in DB — otherwise static gen produces 404.
      if (!getCityData(m[1]) || !getCityData(m[2])) continue;
      const [a, b] = [m[1], m[2]].sort();
      const key = `${a}-vs-${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ slugA: a, slugB: b });
    }
    return out;
  } catch {
    return [];
  }
}

function loadFeaturedPairs(): { slugA: string; slugB: string }[] {
  const fpPath = path.resolve(process.cwd(), "data", "compare-featured.json");
  if (!fs.existsSync(fpPath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(fpPath, "utf8"));
    const seen = new Set<string>();
    const out: { slugA: string; slugB: string }[] = [];
    for (const e of raw.pairs ?? []) {
      const a = String(e.slugA || "");
      const b = String(e.slugB || "");
      if (!a || !b || a === b) continue;
      if (!getCityData(a) || !getCityData(b)) continue;
      const [s1, s2] = [a, b].sort();
      const key = `${s1}-vs-${s2}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ slugA: s1, slugB: s2 });
    }
    return out;
  } catch {
    return [];
  }
}

const FEATURED_PAIRS = loadFeaturedPairs();
const WHITELIST_PAIRS = loadWhitelistedPairs();
const STATIC_COMPARISON_SET = new Set<string>();
for (const p of [...FEATURED_PAIRS, ...WHITELIST_PAIRS]) {
  STATIC_COMPARISON_SET.add([p.slugA, p.slugB].sort().join("-vs-"));
}
const STATIC_COMPARISON_SLUGS = Array.from(STATIC_COMPARISON_SET);

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return STATIC_COMPARISON_SLUGS.flatMap((slugs) => {
    const parsed = parseSlugs(slugs);
    if (!parsed) return [];
    return [
      { slugs },
      { slugs: `${parsed[1]}-vs-${parsed[0]}` },
    ];
  });
}

function toCanonicalComparisonSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join("-vs-");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const [a, b] = parsed;
  const dataA = getCityData(a);
  const dataB = getCityData(b);
  if (!dataA || !dataB) return {};
  const canonicalSlugs = toCanonicalComparisonSlug(dataA.metro.slug, dataB.metro.slug);
  if (!STATIC_COMPARISON_SET.has(canonicalSlugs)) return {};

  const title = `${dataA.metro.short_name} vs ${dataB.metro.short_name} - Cost of Living Comparison`;
  const description = `Compare cost of living between ${dataA.metro.short_name} (${formatIndex(dataA.rpp.all || 100)}) and ${dataB.metro.short_name} (${formatIndex(dataB.rpp.all || 100)}). Housing, goods, utilities side by side.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${canonicalSlugs}/` },
    openGraph: { title, description, url: `/compare/${canonicalSlugs}/` },
    // 2026-04-26 AdSense scaled-content remediation: noindex derivative compare pages.
    // Precedent: nameblooms /middle-names/ policy violation 2026-04-26.
    robots: { index: false, follow: true },
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
  const canonicalSlugs = toCanonicalComparisonSlug(dataA.metro.slug, dataB.metro.slug);
  if (!STATIC_COMPARISON_SET.has(canonicalSlugs)) notFound();
  if (canonicalSlugs !== slugs) {
    redirect(`/compare/${canonicalSlugs}/`);
  }

  const { metro: metroA, rpp: rppA, acs: acsA } = dataA;
  const { metro: metroB, rpp: rppB, acs: acsB } = dataB;
  const faqs = generateCompareFAQs(metroA.short_name, metroB.short_name, rppA, rppB);

  const cheaper = (rppA.all || 100) < (rppB.all || 100) ? metroA.short_name : metroB.short_name;
  const diffPct = Math.abs((rppA.all || 100) - (rppB.all || 100)).toFixed(1);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: `${metroA.short_name} vs ${metroB.short_name}`, url: `/compare/${slugs}/` },
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

      <AdSlot id="compare-bottom" />

      <FAQ items={faqs} />

      <section className="mt-8">
        <div className="flex gap-4">
          <a href={`/cities/${slugA}/`} className="text-emerald-600 hover:underline">
            More about {metroA.short_name} &rarr;
          </a>
          <a href={`/cities/${slugB}/`} className="text-emerald-600 hover:underline">
            More about {metroB.short_name} &rarr;
          </a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
