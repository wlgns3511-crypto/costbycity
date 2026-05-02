import Link from 'next/link';
import { getBackrefs, getForwardLinks, getOnSiteReferences } from '@/lib/citation-network';
import { GLOSSARY_CATEGORIES } from '@/lib/glossary-data';

const CAT_DOT: Record<string, string> = {
  bea: 'bg-blue-500',
  census: 'bg-purple-500',
  hud: 'bg-amber-500',
  energy: 'bg-emerald-500',
  general: 'bg-slate-500',
};

export function GlossaryBacklinks({ slug }: { slug: string }) {
  const back = getBackrefs(slug);
  const forward = getForwardLinks(slug);
  const sitePaths = getOnSiteReferences(slug);

  return (
    <footer className="mt-10 grid gap-6 border-t border-slate-200 pt-6 md:grid-cols-3">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Related terms
        </h2>
        {forward.length === 0 ? (
          <p className="text-sm text-slate-500">No related entries.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {forward.map((r) => (
              <li key={r.slug} className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${CAT_DOT[r.category]}`} />
                <Link href={`/glossary/${r.slug}/`} className="text-blue-700 hover:underline">
                  {r.term}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Cited from
        </h2>
        {back.length === 0 ? (
          <p className="text-sm text-slate-500">No backlinks yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {back.map((r) => (
              <li key={r.slug} className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${CAT_DOT[r.category]}`} />
                <Link href={`/glossary/${r.slug}/`} className="text-blue-700 hover:underline">
                  {r.term}
                </Link>
                <span className="text-xs text-slate-400">({GLOSSARY_CATEGORIES[r.category].label})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          Used on
        </h2>
        {sitePaths.length === 0 ? (
          <p className="text-sm text-slate-500">Glossary-only term.</p>
        ) : (
          <ul className="space-y-1.5 text-sm font-mono text-slate-700">
            {sitePaths.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
