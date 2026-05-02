/**
 * RelocationDeltaCard — single-direction "$X here = $Y there" delta callout.
 * For inline use on city pages where a city-pair component is overkill.
 */
export function RelocationDeltaCard({
  fromName,
  toName,
  fromRpp,
  toRpp,
  sampleSalary = 80_000,
}: {
  fromName: string;
  toName: string;
  fromRpp: number;
  toRpp: number;
  sampleSalary?: number;
}) {
  const ratio = toRpp / fromRpp;
  const equivalent = Math.round(sampleSalary * ratio);
  const delta = equivalent - sampleSalary;
  const positive = delta >= 0;
  const color = positive ? '#dc2626' : '#059669';

  return (
    <aside className="my-6 rounded-lg border border-slate-200 bg-slate-50/60 p-4" data-upgrade="relocation-delta">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Relocation delta — sample
      </h3>
      <div className="mt-2 flex items-baseline gap-2 text-sm">
        <span className="text-slate-700">${sampleSalary.toLocaleString('en-US')} in</span>
        <strong className="text-slate-900">{fromName}</strong>
      </div>
      <div className="my-2 flex items-baseline gap-2 text-sm">
        <span className="text-slate-500">≈</span>
        <span className="font-mono text-2xl font-bold" style={{ color }}>
          ${equivalent.toLocaleString('en-US')}
        </span>
        <span className="text-slate-700">in</span>
        <strong className="text-slate-900">{toName}</strong>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        {positive ? '+' : ''}${delta.toLocaleString('en-US')} (×{ratio.toFixed(3)} RPP ratio).
      </p>
    </aside>
  );
}
