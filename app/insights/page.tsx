import type { Metadata } from "next";
import { getInsightIndexNarrative } from "@/lib/insight-topics";

/**
 * 2026-04-29 HCU 5-chunk patch — new /insights/ topic-collection index.
 *
 * Counterpart to /rankings/ which lists 12 single-axis lists. This index
 * groups the same data into 6 topic profiles, each rendering paired tables
 * (e.g. fastest-rising AND fastest-falling on one page) for richer analysis.
 */

export const metadata: Metadata = {
  title: "Cost-of-Living Insights — 6 Topic Analyses by US Metro",
  description:
    "Six topic-based cost-of-living analyses for US metros: housing-vs-goods, rent burden, hidden gems, fastest-changing, dollar stretch, real wages. Same BEA RPP + ACS data, six different angles.",
  alternates: { canonical: "/insights/" },
  openGraph: {
    title: "Cost-of-Living Insights — 6 Topic Analyses",
    description: "Six different ways to read the BEA RPP + ACS dataset for US metros.",
    url: "/insights/",
  },
};

const TONE = ['emerald', 'amber', 'teal', 'orange', 'indigo', 'violet'] as const;
const TONE_CLS: Record<string, { border: string; bg: string; text: string }> = {
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
  teal: { border: 'border-teal-200', bg: 'bg-teal-50', text: 'text-teal-700' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700' },
  indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  violet: { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700' },
};

export default function InsightsIndex() {
  const n = getInsightIndexNarrative();
  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <span className="text-slate-800">Insights</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Cost-of-Living Insights</h1>
      <p className="text-slate-600 mb-2 max-w-3xl">{n.heroHeadline}</p>
      <p className="text-sm text-slate-500 mb-6 max-w-3xl">{n.hero}</p>

      <p className="text-sm text-slate-500 mb-8 max-w-3xl">
        Looking for single-axis ranked lists instead?{' '}
        <a href="/rankings/" className="text-emerald-600 hover:underline">Browse 12 ranking lists</a> — same data, organized as one ranking per page.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {n.cards.map((card, i) => {
          const tone = TONE_CLS[TONE[i % TONE.length]];
          return (
            <a key={card.topic} href={`/insights/${card.topic}/`}
              className={`block rounded-lg border ${tone.border} ${tone.bg} p-5 hover:shadow-sm transition`}>
              <h2 className={`font-semibold mb-1 ${tone.text}`}>{card.title}</h2>
              <p className="text-sm text-slate-600">{card.tagline}</p>
            </a>
          );
        })}
      </div>

      <section className="mt-12 p-5 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Reading Notes</h2>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li>Each topic page renders <strong>paired tables</strong> — for example, fastest-rising and fastest-falling appear together so the reader sees both ends of the same axis.</li>
          <li>Rankings on these pages draw from the BEA Regional Price Parities (RPP) and ACS median income datasets. RPP baseline = 100 (US average).</li>
          <li>Real income is computed as nominal median household income × (100 / RPP_all). It captures cost-adjusted purchasing power.</li>
          <li>Rent burden uses (median rent × 12) / median household income. HUD considers above 30% &ldquo;cost-burdened.&rdquo;</li>
        </ul>
      </section>
    </div>
  );
}
