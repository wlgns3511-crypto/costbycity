import Link from 'next/link';
import { GLOSSARY_CATEGORIES, type GlossaryEntry } from '@/lib/glossary-data';

const CAT_COLORS: Record<GlossaryEntry['category'], string> = {
  bea: 'bg-blue-50 text-blue-700 border-blue-200',
  census: 'bg-purple-50 text-purple-700 border-purple-200',
  hud: 'bg-amber-50 text-amber-700 border-amber-200',
  energy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  general: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function GlossaryTermCard({ entry }: { entry: GlossaryEntry }) {
  const cat = GLOSSARY_CATEGORIES[entry.category];
  return (
    <Link
      href={`/glossary/${entry.slug}/`}
      className="group block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
          {entry.term}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${CAT_COLORS[entry.category]}`}
          title={cat.label}
        >
          {entry.category.toUpperCase()}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{entry.shortDef}</p>
    </Link>
  );
}
