import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Cost-of-Living Tools — affordability + relocation calculators';
const DESCRIPTION =
  'Two interactive calculators for cost-of-living decisions: an affordability score against any U.S. metro and a salary-equivalent relocation estimator powered by BEA Regional Price Parities.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/tools/' },
};

const TOOLS = [
  {
    href: '/tools/affordability-calculator/',
    title: 'Affordability calculator',
    description: 'Plug in your income and a city to see whether housing, groceries, transport, and utilities fit your budget — using ACS rent + BEA RPP.',
    inputs: ['Annual income', 'Destination city'],
    sources: 'BEA RPP, Census ACS B19013/B25064',
  },
  {
    href: '/tools/relocation-cost/',
    title: 'Relocation salary calculator',
    description: 'Compute the salary you need in a destination metro to maintain identical purchasing power, plus first-month moving cost estimates.',
    inputs: ['Source income', 'Source + destination cities', 'Family size'],
    sources: 'BEA RPP all-items',
  },
];

export default function ToolsIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools/' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{TITLE}</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-700">{DESCRIPTION}</p>
      </header>
      <ul className="space-y-4">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <h2 className="text-lg font-semibold text-blue-700">{t.title}</h2>
              <p className="mt-1 text-sm text-slate-700">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span><strong>Inputs:</strong> {t.inputs.join(' · ')}</span>
                <span><strong>Sources:</strong> {t.sources}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
