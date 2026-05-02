import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { RppTrendChart, type RppSeries } from '@/components/RppTrendChart';
import { PCEDeflatorToggle } from '@/components/PCEDeflatorToggle';
import {
  getMostExpensiveCities,
  getCheapestCities,
  getRPPHistory,
  getMostExpensiveHousing,
  getCheapestHousing,
  getMetroByFips,
} from '@/lib/db';
import { PCE_DEFLATOR_YEARLY } from '@/lib/pce-deflator';

interface Props {
  params: Promise<{ metric: string }>;
}

const METRICS = ['rpp-all', 'rpp-housing', 'pce-deflator', 'real-vs-nominal'] as const;
type MetricSlug = typeof METRICS[number];

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return METRICS.map((m) => ({ metric: m }));
}

const META: Record<MetricSlug, { title: string; description: string }> = {
  'rpp-all': {
    title: 'RPP all-items 2008–2024 — top vs bottom metros',
    description: '16-year time series of all-items Regional Price Parity for the highest- and lowest-RPP metros, showing convergence and divergence.',
  },
  'rpp-housing': {
    title: 'RPP housing 2008–2024 — top vs bottom metros',
    description: '16-year housing-component RPP trajectories for the most expensive and cheapest housing metros.',
  },
  'pce-deflator': {
    title: 'PCE Price Index — annual U.S. inflation, 1929–2025',
    description: 'BEA Personal Consumption Expenditures Price Index, the Federal Reserve\'s preferred inflation gauge.',
  },
  'real-vs-nominal': {
    title: 'Real vs nominal RPP toggle',
    description: 'Same RPP series with PCE-deflator toggle, separating price-level from inflation.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { metric } = await params;
  const m = META[metric as MetricSlug];
  if (!m) return {};
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/trend/${metric}/` },
    openGraph: { title: m.title, description: m.description, url: `/trend/${metric}/` },
  };
}

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9'];

function buildRppAllSeries(): RppSeries[] {
  const top = getMostExpensiveCities(5);
  const bottom = getCheapestCities(3);
  const out: RppSeries[] = [];
  let c = 0;
  for (const m of top) {
    out.push({
      label: m.short_name + ', ' + m.state,
      color: COLORS[c % COLORS.length],
      points: getRPPHistory(m.fips),
    });
    c++;
  }
  for (const m of bottom) {
    out.push({
      label: m.short_name + ', ' + m.state,
      color: COLORS[c % COLORS.length],
      points: getRPPHistory(m.fips),
    });
    c++;
  }
  return out;
}

function buildRppHousingSeries(): RppSeries[] {
  const top = getMostExpensiveHousing(4);
  const bot = getCheapestHousing(3);
  const out: RppSeries[] = [];
  let c = 0;
  const all = [...top, ...bot];
  for (const m of all) {
    const hist = getRPPHistory(m.fips);
    if (hist.length === 0) continue;
    out.push({
      label: m.short_name + ', ' + m.state,
      color: COLORS[c % COLORS.length],
      points: hist,
    });
    c++;
  }
  return out;
}

export default async function TrendMetricPage({ params }: Props) {
  const { metric } = await params;
  if (!METRICS.includes(metric as MetricSlug)) notFound();
  const m = META[metric as MetricSlug];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Trends', href: '/trend/' },
          { label: m.title, href: `/trend/${metric}/` },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{m.title}</h1>
        <p className="mt-2 text-base text-slate-700">{m.description}</p>
      </header>

      {metric === 'rpp-all' && <RppAllSection />}
      {metric === 'rpp-housing' && <RppHousingSection />}
      {metric === 'pce-deflator' && <PceSection />}
      {metric === 'real-vs-nominal' && <RealVsNominalSection />}

      <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Data &amp; method</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>· BEA Regional Price Parities (SARPP/MARPP), 2008–2024 — annual.</li>
          <li>· BEA NIPA Table 1.1.4 / FRED PCEPI — monthly Personal Consumption Expenditures Price Index.</li>
          <li>· See <a className="text-blue-700 underline" href="/glossary/regional-price-parity/">RPP glossary</a> · <a className="text-blue-700 underline" href="/glossary/pce-price-index/">PCE Price Index glossary</a> · <a className="text-blue-700 underline" href="/glossary/nominal-vs-real/">nominal vs real glossary</a>.</li>
        </ul>
      </section>
    </main>
  );
}

function RppAllSection() {
  const series = buildRppAllSeries();
  return (
    <RppTrendChart
      title="RPP all-items, top 5 + bottom 3 metros (2008–2024)"
      series={series}
      height={260}
    />
  );
}

function RppHousingSection() {
  const series = buildRppHousingSeries();
  return (
    <RppTrendChart
      title="RPP housing, expensive vs cheap metros (2008–2024)"
      series={series}
      height={260}
    />
  );
}

function PceSection() {
  const yearly = PCE_DEFLATOR_YEARLY.filter((r) => r.year >= 1950);
  const series: RppSeries[] = [
    {
      label: 'PCE Price Index (2017 = 100)',
      color: '#3b82f6',
      points: yearly.map((r) => ({ year: r.year, value: r.value })),
    },
  ];
  const last = yearly[yearly.length - 1];
  const fifty = yearly.find((r) => r.year === 1975);
  return (
    <>
      <RppTrendChart title="PCE Price Index, 1950–latest" series={series} height={260} yMin={0} yMax={Math.ceil(last.value + 5)} />
      {fifty && (
        <p className="mt-2 text-sm text-slate-700">
          Cumulative inflation 1975 → {last.year}: prices rose roughly{' '}
          <strong>{(((last.value - fifty.value) / fifty.value) * 100).toFixed(0)}%</strong> over five decades — i.e., a $1 1975 expenditure equates to about ${(last.value / fifty.value).toFixed(2)} today.
        </p>
      )}
    </>
  );
}

function RealVsNominalSection() {
  const top = getMostExpensiveCities(1)[0];
  if (!top) return null;
  const metro = getMetroByFips(top.fips);
  const hist = getRPPHistory(top.fips);
  if (!metro || hist.length === 0) return null;
  return (
    <>
      <p className="mb-4 text-sm text-slate-700">
        Toggle real vs nominal for {metro.short_name}, {metro.state} RPP all-items 2008–2024 (PCE-deflated to {hist[hist.length - 1].year} dollars).
      </p>
      <PCEDeflatorToggle series={hist} label={`${metro.short_name}, ${metro.state} RPP all-items`} unit="" fixedDigits={1} />
    </>
  );
}
