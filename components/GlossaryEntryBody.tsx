import { GLOSSARY_CATEGORIES, type GlossaryEntry } from '@/lib/glossary-data';

const CAT_COLORS: Record<GlossaryEntry['category'], string> = {
  bea: 'bg-blue-50 text-blue-700 border-blue-200',
  census: 'bg-purple-50 text-purple-700 border-purple-200',
  hud: 'bg-amber-50 text-amber-700 border-amber-200',
  energy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  general: 'bg-slate-50 text-slate-700 border-slate-200',
};

function renderInline(text: string) {
  // Convert simple markdown: *italic*, **bold**, `inline code`.
  const parts: Array<{ type: 'text' | 'b' | 'i' | 'code'; value: string }> = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end > 0) {
        if (buf) { parts.push({ type: 'text', value: buf }); buf = ''; }
        parts.push({ type: 'b', value: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end > 0) {
        if (buf) { parts.push({ type: 'text', value: buf }); buf = ''; }
        parts.push({ type: 'i', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > 0) {
        if (buf) { parts.push({ type: 'text', value: buf }); buf = ''; }
        parts.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  if (buf) parts.push({ type: 'text', value: buf });
  return parts.map((p, k) => {
    if (p.type === 'b') return <strong key={k}>{p.value}</strong>;
    if (p.type === 'i') return <em key={k}>{p.value}</em>;
    if (p.type === 'code') return <code key={k} className="rounded bg-slate-100 px-1 py-0.5 text-[0.92em] font-mono">{p.value}</code>;
    return <span key={k}>{p.value}</span>;
  });
}

export function GlossaryEntryBody({ entry }: { entry: GlossaryEntry }) {
  const cat = GLOSSARY_CATEGORIES[entry.category];
  const paragraphs = entry.body.split(/\n\n+/);
  return (
    <article className="not-prose">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CAT_COLORS[entry.category]}`}>
            {cat.label}
          </span>
          <time dateTime={entry.lastUpdated} className="text-xs text-slate-500">
            Updated {entry.lastUpdated}
          </time>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{entry.term}</h1>
        <p className="mt-2 text-base text-slate-700">{entry.shortDef}</p>
      </header>
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-800">
        {paragraphs.map((p, i) => {
          if (p.startsWith('- ')) {
            const items = p.split('\n').filter((l) => l.startsWith('- '));
            return (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {items.map((it, j) => (
                  <li key={j}>{renderInline(it.slice(2))}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{renderInline(p)}</p>;
        })}
      </div>
      {entry.citations.length > 0 && (
        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Primary sources</h2>
          <ul className="space-y-1 text-sm">
            {entry.citations.map((c, i) => (
              <li key={i}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
