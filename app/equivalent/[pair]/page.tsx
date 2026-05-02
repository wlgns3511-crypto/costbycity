import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  EQUIVALENT_PAIRS,
  EQUIVALENT_PAIRS_SOURCE,
  EQUIVALENT_PAIRS_VINTAGE,
  getEquivalentPair,
  type EquivalentPair,
} from '@/lib/equivalent-pairs';
import { getMetroBySlug, getRPPHistory, getACS } from '@/lib/db';
import { RealWageEquivalent } from '@/components/RealWageEquivalent';
import { RppTrendChart } from '@/components/RppTrendChart';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ pair: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return EQUIVALENT_PAIRS.map((p) => ({ pair: p.pair_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const p = getEquivalentPair(pair);
  if (!p) return {};
  const title = `${p.name_a}, ${p.state_a} vs ${p.name_b}, ${p.state_b} — Real-wage equivalent (${EQUIVALENT_PAIRS_VINTAGE})`;
  const description = `What you need to earn to maintain purchasing power between ${p.name_a} and ${p.name_b}. RPP ${p.rpp_a.toFixed(1)} vs ${p.rpp_b.toFixed(1)}; ratio ×${p.ratio_a_to_b.toFixed(3)} (A→B).`;
  return {
    title,
    description,
    alternates: { canonical: `/equivalent/${pair}/` },
    openGraph: { title, description, url: `/equivalent/${pair}/` },
  };
}

const SAMPLE_INCOMES = [50_000, 75_000, 100_000, 150_000, 200_000];

function gapNarrative(p: EquivalentPair): string {
  if (p.gap_abs > 30)
    return `An RPP gap of ${p.gap_abs.toFixed(1)} points sits at the extreme end of cross-metro variation in the BEA series — fewer than 1% of metro pairs span this much. A relocation here is functionally a salary regime change, not an adjustment.`;
  if (p.gap_abs > 25)
    return `An RPP gap of ${p.gap_abs.toFixed(1)} points is in the top decile of the BEA cross-metro distribution. A move in either direction will fundamentally reshape your monthly housing budget.`;
  if (p.gap_abs > 20)
    return `An RPP gap of ${p.gap_abs.toFixed(1)} points is well above the U.S. metro median (~10 points). Most other affordability comparisons of this magnitude involve crossing major regional boundaries (coastal vs interior, sun belt vs Rust Belt).`;
  return `An RPP gap of ${p.gap_abs.toFixed(1)} points is meaningful — large enough to require a salary recalibration but small enough that lifestyle continuity is plausible.`;
}

function regionalContext(p: EquivalentPair): string {
  const sameState = p.state_a === p.state_b;
  if (sameState) {
    return `Both metros are inside the same state (${p.state_a}), so state income tax, property tax basis, sales tax, and most state-regulated insurance regimes are identical. The cost-of-living gap is therefore driven almost entirely by housing density, local wage levels, and metro-scale economic structure rather than tax policy.`;
  }
  return `${p.name_a} is in ${p.state_a}; ${p.name_b} is in ${p.state_b}. Cross-state moves layer on top of the RPP gap a separate package of tax and insurance differences (state income tax brackets, property tax effective rate, vehicle registration, health-insurance market regulations) that the RPP series does not capture. Use this page's ratio as the cost-of-consumption baseline; consult dedicated sources for tax-side adjustments.`;
}

export default async function EquivalentPairPage({ params }: Props) {
  const { pair } = await params;
  const p = getEquivalentPair(pair);
  if (!p) notFound();

  const metroA = getMetroBySlug(p.slug_a);
  const metroB = getMetroBySlug(p.slug_b);
  const acsA = metroA ? getACS(metroA.fips) : null;
  const acsB = metroB ? getACS(metroB.fips) : null;
  const trendA = metroA ? getRPPHistory(metroA.fips) : [];
  const trendB = metroB ? getRPPHistory(metroB.fips) : [];

  const earlierGap = (() => {
    const earliest = Math.min(...trendA.map((r) => r.year), ...trendB.map((r) => r.year));
    const aEarly = trendA.find((r) => r.year === earliest)?.value;
    const bEarly = trendB.find((r) => r.year === earliest)?.value;
    if (aEarly == null || bEarly == null) return null;
    return { year: earliest, gap: Math.abs(aEarly - bEarly), aRpp: aEarly, bRpp: bEarly };
  })();

  const labelA = `${p.name_a}, ${p.state_a}`;
  const labelB = `${p.name_b}, ${p.state_b}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Real-Wage Equivalent', href: '/equivalent/' },
          { label: `${p.name_a} vs ${p.name_b}`, href: `/equivalent/${pair}/` },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {labelA} vs {labelB} — Real-wage equivalent
        </h1>
        <p className="mt-2 text-base text-slate-700">
          BEA Regional Price Parities for {EQUIVALENT_PAIRS_VINTAGE} place {labelA} at <strong>{p.rpp_a.toFixed(1)}</strong> and {labelB} at <strong>{p.rpp_b.toFixed(1)}</strong> on the all-items index where 100 equals the U.S. national average. The {p.gap_abs.toFixed(1)}-point spread is the engine behind every dollar figure on this page.
        </p>
      </header>

      <RealWageEquivalent pair={p} cityNameA={labelA} cityNameB={labelB} />

      <section className="my-8">
        <h2 className="mb-2 text-xl font-bold text-slate-900">How the formula works</h2>
        <p className="text-[15px] leading-relaxed text-slate-800">
          The Real-Wage Equivalent answers a simple question: what nominal salary in the destination metro buys the same basket of goods and services as your salary in the source metro? The math is the ratio of price levels. If destination prices are 20% higher than source prices, you need a 20% raise just to maintain identical consumption.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          For {labelA} → {labelB}, the multiplier is <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em]">RPP_{p.name_b.split(',')[0].toLowerCase()} / RPP_{p.name_a.split(',')[0].toLowerCase()} = {p.rpp_b.toFixed(1)} / {p.rpp_a.toFixed(1)} = {p.ratio_a_to_b.toFixed(4)}</code>. Multiply any source-city salary by this to get the destination-equivalent. Going the other direction reverses the ratio: each {labelB} dollar buys ×{p.ratio_b_to_a.toFixed(3)} as much in {labelA}.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          {gapNarrative(p)}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          {regionalContext(p)}
        </p>
      </section>

      <section className="my-8">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Sample equivalents</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-semibold">Source salary</th>
              <th className="px-2 py-2 text-right font-semibold">In {labelA}</th>
              <th className="px-2 py-2 text-right font-semibold">{labelA} → {labelB}</th>
              <th className="px-2 py-2 text-right font-semibold">{labelB} → {labelA}</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_INCOMES.map((inc) => (
              <tr key={inc} className="border-b border-slate-100">
                <td className="px-2 py-1.5 font-mono">${inc.toLocaleString('en-US')}</td>
                <td className="px-2 py-1.5 text-right font-mono text-slate-500">${inc.toLocaleString('en-US')}</td>
                <td className="px-2 py-1.5 text-right font-mono text-slate-900">${Math.round(inc * p.ratio_a_to_b).toLocaleString('en-US')}</td>
                <td className="px-2 py-1.5 text-right font-mono text-slate-900">${Math.round(inc * p.ratio_b_to_a).toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {trendA.length > 0 && trendB.length > 0 && (
        <section className="my-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900">16-year RPP trend</h2>
          <RppTrendChart
            title={`${labelA} vs ${labelB} — RPP all-items, 2008–${EQUIVALENT_PAIRS_VINTAGE}`}
            series={[
              { label: labelA, color: '#3b82f6', points: trendA },
              { label: labelB, color: '#f97316', points: trendB },
            ]}
          />
          {earlierGap && (
            <p className="mt-2 text-sm text-slate-700">
              In {earlierGap.year}, the gap between these two metros was {earlierGap.gap.toFixed(1)} points (RPP {earlierGap.aRpp.toFixed(1)} vs {earlierGap.bRpp.toFixed(1)}). Today's {p.gap_abs.toFixed(1)}-point gap is{' '}
              {p.gap_abs > earlierGap.gap ? 'wider — the cost-of-living spread between these metros has grown.' : 'narrower — the spread has compressed.'}
            </p>
          )}
        </section>
      )}

      {(acsA || acsB) && (
        <section className="my-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Income context (Census ACS)</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2 font-semibold">Metric</th>
                <th className="px-2 py-2 text-right font-semibold">{labelA}</th>
                <th className="px-2 py-2 text-right font-semibold">{labelB}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-2 py-1.5 text-slate-700">Median household income</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsA?.median_income?.toLocaleString('en-US') ?? '—'}</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsB?.median_income?.toLocaleString('en-US') ?? '—'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-2 py-1.5 text-slate-700">Median rent (monthly)</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsA?.median_rent?.toLocaleString('en-US') ?? '—'}</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsB?.median_rent?.toLocaleString('en-US') ?? '—'}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-2 py-1.5 text-slate-700">Median home value</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsA?.median_home_value?.toLocaleString('en-US') ?? '—'}</td>
                <td className="px-2 py-1.5 text-right font-mono">${acsB?.median_home_value?.toLocaleString('en-US') ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      <section className="my-8 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Method &amp; limits</h2>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li>· RPP captures price levels for the consumption basket (housing, goods, utilities, services). It does not capture one-time costs like moving expenses, real-estate transaction fees, or breaking a lease.</li>
          <li>· The ratio is metro-average. Within either metro, neighborhood-level rent and grocery prices can be 20–30% above or below the metro mean.</li>
          <li>· Healthcare costs scale with local wages and provider density; the RPP-Other-Services component captures most but not all of this gap.</li>
          <li>· Tax differences (state income tax, sales tax, property tax effective rate) are layered on top of RPP and require a separate adjustment.</li>
          <li>· Source: {EQUIVALENT_PAIRS_SOURCE}. <a href="/glossary/regional-price-parity/" className="text-blue-700 underline">Glossary: Regional Price Parity</a> · <a href="/glossary/real-wage-equivalent/" className="text-blue-700 underline">Glossary: Real-Wage Equivalent</a>.</li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${labelA} vs ${labelB} Real-wage equivalent`,
            description: `Salary equivalents and 16-yr RPP trend for ${labelA} vs ${labelB}.`,
            url: `https://costbycity.com/equivalent/${pair}/`,
            dateModified: '2026-05-02',
            citation: [
              {
                '@type': 'CreativeWork',
                name: EQUIVALENT_PAIRS_SOURCE,
                url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area',
              },
            ],
          }),
        }}
      />
    </main>
  );
}
