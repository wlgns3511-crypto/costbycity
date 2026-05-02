import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { RelocationCalculator } from '@/components/RelocationCalculator';
import { getMostExpensiveCities } from '@/lib/db';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Relocation Salary Calculator — costbycity';
const DESCRIPTION =
  'Compute the destination salary that maintains your purchasing power when relocating between U.S. metros, plus first-month housing deposit and moving cost estimates.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/relocation-cost/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/tools/relocation-cost/' },
};

export default function RelocationCostPage() {
  const top = getMostExpensiveCities(1)[0];
  const fallbackName = top ? `${top.short_name}, ${top.state}` : 'San Francisco, CA';
  const defaultCostIndex = top?.rpp_all ?? 115;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools/' },
          { label: 'Relocation Salary Calculator', href: '/tools/relocation-cost/' },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relocation Salary Calculator</h1>
        <p className="mt-2 text-base text-slate-700">{DESCRIPTION}</p>
      </header>

      <RelocationCalculator cityName={fallbackName} defaultCostIndex={defaultCostIndex} />

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-slate-900">What it estimates</h2>
        <p className="text-[15px] leading-relaxed text-slate-800">
          The salary equivalent comes from the BEA Regional Price Parity ratio: destination cost / source cost = required-salary multiplier. The first-month estimate adds a typical security deposit (2 months' rent at the destination), broker fees in markets where they apply, and moving-truck cost scaled by family size and distance.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          For a focused metro-vs-metro analysis, see the <a href="/equivalent/" className="text-blue-700 underline">/equivalent/ index</a> — 200 prebuilt city-pair pages with bidirectional ratios, 16-year RPP trend, and ACS income context.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          See the <a href="/glossary/real-wage-equivalent/" className="text-blue-700 underline">Real-Wage Equivalent glossary entry</a> for the formula and assumptions.
        </p>
      </section>
    </main>
  );
}
