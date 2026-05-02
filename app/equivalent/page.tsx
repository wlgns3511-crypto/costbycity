import type { Metadata } from 'next';
import Link from 'next/link';
import { EQUIVALENT_PAIRS, EQUIVALENT_PAIRS_VINTAGE, EQUIVALENT_PAIRS_SOURCE } from '@/lib/equivalent-pairs';
import { Breadcrumb } from '@/components/Breadcrumb';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Real-Wage Equivalent — top 200 metro pairs';
const DESCRIPTION = `Side-by-side salary equivalents for the 200 U.S. metro pairs with the largest cost-of-living gaps, computed from BEA Regional Price Parities (${EQUIVALENT_PAIRS_VINTAGE}).`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/equivalent/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/equivalent/' },
};

export default function EquivalentIndex() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Real-Wage Equivalent', href: '/equivalent/' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{TITLE}</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-700">{DESCRIPTION}</p>
        <p className="mt-2 text-xs text-slate-500">{EQUIVALENT_PAIRS_SOURCE}</p>
      </header>

      <section className="mb-6">
        <p className="text-sm text-slate-700">
          Each pair below is sorted by absolute RPP gap — the bigger the gap, the more your salary needs to change to keep your purchasing power steady when relocating. Click any pair for a full breakdown including bidirectional ratios, formula, sample salaries, and adjacent metros.
        </p>
      </section>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2 font-semibold">#</th>
            <th className="px-2 py-2 font-semibold">Metro pair</th>
            <th className="px-2 py-2 text-right font-semibold">RPP A</th>
            <th className="px-2 py-2 text-right font-semibold">RPP B</th>
            <th className="px-2 py-2 text-right font-semibold">Gap</th>
            <th className="px-2 py-2 text-right font-semibold">Ratio A→B</th>
          </tr>
        </thead>
        <tbody>
          {EQUIVALENT_PAIRS.map((p, idx) => (
            <tr key={p.pair_slug} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-2 py-1.5 font-mono text-xs text-slate-400">{idx + 1}</td>
              <td className="px-2 py-1.5">
                <Link href={`/equivalent/${p.pair_slug}/`} className="font-medium text-blue-700 hover:underline">
                  {p.name_a}, {p.state_a} ↔ {p.name_b}, {p.state_b}
                </Link>
              </td>
              <td className="px-2 py-1.5 text-right font-mono">{p.rpp_a.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right font-mono">{p.rpp_b.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-slate-600">{p.gap_abs.toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right font-mono">×{p.ratio_a_to_b.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
