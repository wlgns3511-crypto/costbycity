import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { itemListSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Cost of Living Guides — Index Methodology, Hidden Costs & Relocation Math',
  description: 'In-depth cost of living guides covering index methodology, the 7 categories, relocation breakeven math, source comparison (BLS vs Numbeo), and the hidden factors indexes don\'t show.',
  alternates: { canonical: '/guide/' },
  openGraph: { title: 'Cost of Living Guides', description: 'Authoritative guides on US cost of living and relocation decisions.', url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  const listItems = guides.map((g) => ({ name: g.title, url: `/guide/${g.slug}/` }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('CostByCity Guides', '/guide/', listItems)) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cost of Living Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on US cost of living. How indexes work, what the
          7 categories mean and why housing dominates, the breakeven math on a relocation salary
          cut, why BLS and Numbeo can disagree by 30 percent, and the hidden costs your index
          never shows.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Look up real numbers</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/cities/" className="text-emerald-700 hover:underline font-medium">Browse cities →</Link>
            <span className="text-slate-500"> COL data by US metro</span>
          </li>
          <li>
            <Link href="/compare/" className="text-emerald-700 hover:underline font-medium">Compare two cities →</Link>
            <span className="text-slate-500"> side-by-side cost analysis</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
