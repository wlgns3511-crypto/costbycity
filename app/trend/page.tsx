import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = '16-Year Cost-of-Living Trends — RPP, rent, income, home value';
const DESCRIPTION =
  'How U.S. cost-of-living indices have moved from 2008 to 2024. Time-series visualizations of BEA Regional Price Parities, Census ACS rent and income, and BEA PCE inflation-adjusted real values.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/trend/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/trend/' },
};

const METRICS = [
  {
    slug: 'rpp-all',
    title: 'RPP all-items, 2008–2024',
    summary: 'How metro cost-of-living indices have diverged or converged over 16 years. Top-10 by RPP-all vs bottom-10 trajectories.',
  },
  {
    slug: 'rpp-housing',
    title: 'RPP housing, 2008–2024',
    summary: 'Housing is the most volatile RPP sub-component. Track which metros saw the largest housing-cost surges and which stayed flat.',
  },
  {
    slug: 'pce-deflator',
    title: 'PCE deflator, 1929–2025',
    summary: 'BEA Personal Consumption Expenditures price index — the Federal Reserve\'s preferred inflation gauge. Chain-weighted, 2017 = 100.',
  },
  {
    slug: 'real-vs-nominal',
    title: 'Real vs nominal RPP',
    summary: 'Same RPP series with PCE-deflator toggle. Lets you separate price-level differences from inflation drift over the 16-year window.',
  },
];

export default function TrendIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Trends', href: '/trend/' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{TITLE}</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-700">{DESCRIPTION}</p>
      </header>
      <ul className="space-y-3">
        {METRICS.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/trend/${m.slug}/`}
              className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <h2 className="text-lg font-semibold text-blue-700">{m.title}</h2>
              <p className="mt-1 text-sm text-slate-700">{m.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
