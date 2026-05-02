import type { EquivalentPair } from '@/lib/equivalent-pairs';

const SAMPLE_INCOMES = [50_000, 80_000, 120_000];

export function RealWageEquivalent({
  pair,
  primary,
  cityNameA,
  cityNameB,
}: {
  pair: EquivalentPair;
  primary?: 'a-to-b' | 'b-to-a';
  cityNameA?: string;
  cityNameB?: string;
}) {
  const aLabel = cityNameA ?? pair.name_a + ', ' + pair.state_a;
  const bLabel = cityNameB ?? pair.name_b + ', ' + pair.state_b;
  const showAtoB = primary !== 'b-to-a';

  return (
    <figure className="my-6 rounded-lg border border-slate-200 bg-white p-4" data-upgrade="real-wage-equiv">
      <figcaption className="mb-3 text-sm font-semibold text-slate-700">
        Real-wage equivalent — {aLabel} ↔ {bLabel}
      </figcaption>

      <div className="grid gap-3 md:grid-cols-2">
        <Direction
          fromName={aLabel}
          toName={bLabel}
          fromRpp={pair.rpp_a}
          toRpp={pair.rpp_b}
          ratio={pair.ratio_a_to_b}
          highlight={showAtoB}
        />
        <Direction
          fromName={bLabel}
          toName={aLabel}
          fromRpp={pair.rpp_b}
          toRpp={pair.rpp_a}
          ratio={pair.ratio_b_to_a}
          highlight={!showAtoB}
        />
      </div>

      <div className="mt-4 grid gap-1 text-xs">
        <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1 font-semibold text-slate-500">
          <span>Source income</span>
          <span className="text-right">{aLabel} → {bLabel}</span>
          <span className="text-right">{bLabel} → {aLabel}</span>
        </div>
        {SAMPLE_INCOMES.map((inc) => (
          <div key={inc} className="grid grid-cols-3 gap-2 font-mono text-slate-700">
            <span>${inc.toLocaleString('en-US')}</span>
            <span className="text-right">${Math.round(inc * pair.ratio_a_to_b).toLocaleString('en-US')}</span>
            <span className="text-right">${Math.round(inc * pair.ratio_b_to_a).toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Formula: equivalent = source × (RPP_destination / RPP_source). Source: BEA RPP {pair.rpp_a} vs {pair.rpp_b} (latest vintage).
      </p>
    </figure>
  );
}

function Direction({
  fromName,
  toName,
  fromRpp,
  toRpp,
  ratio,
  highlight,
}: {
  fromName: string;
  toName: string;
  fromRpp: number;
  toRpp: number;
  ratio: number;
  highlight?: boolean;
}) {
  const pctChange = (ratio - 1) * 100;
  const ratioColor = pctChange >= 0 ? '#dc2626' : '#059669';
  return (
    <div
      className={`rounded-md border p-3 ${highlight ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50/40'}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{fromName}</span>
        <svg viewBox="0 0 12 8" className="mx-2 h-2 w-3 shrink-0" aria-hidden="true">
          <path d="M0 4 H10 M7 1 L10 4 L7 7" stroke="#64748b" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="truncate text-right">{toName}</span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between text-sm">
        <span className="font-mono text-slate-700">RPP {fromRpp.toFixed(1)}</span>
        <span className="font-mono text-slate-700">RPP {toRpp.toFixed(1)}</span>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ratio</span>
        <div className="font-mono text-2xl font-bold" style={{ color: ratioColor }}>
          ×{ratio.toFixed(3)}
        </div>
        <div className="text-xs text-slate-500">
          {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}% nominal change
        </div>
      </div>
    </div>
  );
}
