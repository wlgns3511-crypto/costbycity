import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory, entriesByCategory } from '@/lib/glossary-data';
import { GlossaryTermCard } from '@/components/GlossaryTermCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CITATION_NETWORK_STATS, getTopHubs } from '@/lib/citation-network';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Cost-of-Living Glossary — 50 federal-data terms';
const DESCRIPTION =
  'Plain-language definitions of the 50 cost-of-living concepts that anchor every comparison on this site — from BEA Regional Price Parities to HUD Fair Market Rent to NCEI heating-degree days.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/glossary/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/glossary/' },
};

const CAT_ORDER: GlossaryCategory[] = ['bea', 'census', 'hud', 'energy', 'general'];

export default function GlossaryIndex() {
  const hubs = getTopHubs(8);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Glossary', href: '/glossary/' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cost-of-Living Glossary</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-700">{DESCRIPTION}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>{CITATION_NETWORK_STATS.totalEntries} entries</span>
          <span>·</span>
          <span>{CITATION_NETWORK_STATS.totalCitations} primary citations</span>
          <span>·</span>
          <span>{CITATION_NETWORK_STATS.uniqueAuthorities} authority domains</span>
          <span>·</span>
          <span>{CITATION_NETWORK_STATS.totalRelatedEdges} cross-references</span>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Most-referenced terms
        </h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm md:grid-cols-4">
          {hubs.map((h) => (
            <li key={h.slug}>
              <Link href={`/glossary/${h.slug}/`} className="text-blue-700 hover:underline">
                {h.term}
              </Link>
              <span className="ml-1 text-xs text-slate-400">×{h.total}</span>
            </li>
          ))}
        </ul>
      </section>

      {CAT_ORDER.map((cat) => {
        const entries = entriesByCategory(cat);
        const meta = GLOSSARY_CATEGORIES[cat];
        return (
          <section key={cat} id={cat} className="mb-10 scroll-mt-20">
            <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-900">{meta.label}</h2>
            <p className="mb-4 text-sm text-slate-600">{meta.description}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {entries.map((e) => (
                <GlossaryTermCard key={e.slug} entry={e} />
              ))}
            </div>
          </section>
        );
      })}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: TITLE,
            description: DESCRIPTION,
            url: 'https://costbycity.com/glossary/',
            hasDefinedTerm: GLOSSARY.map((e) => ({
              '@type': 'DefinedTerm',
              name: e.term,
              description: e.shortDef,
              url: `https://costbycity.com/glossary/${e.slug}/`,
            })),
          }),
        }}
      />
    </main>
  );
}
