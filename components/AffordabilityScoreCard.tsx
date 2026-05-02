/**
 * AffordabilityScoreCard — composite gauge of (income / rent×12 × RPP_factor).
 * Score >100 = comfortably affordable; 100 = breakeven; <100 = stretched.
 */
export function AffordabilityScoreCard({
  medianIncome,
  medianRent,
  rppHousing,
  cityName,
}: {
  medianIncome: number;
  medianRent: number;
  rppHousing: number;
  cityName: string;
}) {
  const annualRent = medianRent * 12;
  const rppFactor = rppHousing / 100;
  const score = annualRent > 0 && rppFactor > 0
    ? Math.round((medianIncome * 100) / (annualRent * rppFactor))
    : 0;
  const status =
    score >= 130 ? 'Comfortable' : score >= 100 ? 'Adequate' : score >= 80 ? 'Stretched' : 'Severely stretched';
  const color =
    score >= 130 ? '#10b981' : score >= 100 ? '#3b82f6' : score >= 80 ? '#f59e0b' : '#ef4444';

  const gaugeMax = 200;
  const angle = Math.min(180, Math.max(0, (score / gaugeMax) * 180));
  const r = 60;
  const cx = 100;
  const cy = 80;
  const rad = (angle - 180) * (Math.PI / 180);
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  return (
    <figure className="my-6 rounded-lg border border-slate-200 bg-white p-4" data-upgrade="afford-score">
      <figcaption className="mb-2 text-sm font-semibold text-slate-700">
        Affordability score for {cityName}
      </figcaption>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 200 110" role="img" aria-label="affordability gauge" className="w-44">
          <path d="M 40 80 A 60 60 0 0 1 160 80" fill="none" stroke="#e2e8f0" strokeWidth={12} strokeLinecap="round" />
          <path
            d={`M 40 80 A 60 60 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
          />
          <text x={cx} y={70} textAnchor="middle" fontSize={26} fontWeight={700} fill="#0f172a">
            {score}
          </text>
          <text x={cx} y={90} textAnchor="middle" fontSize={10} fill="#64748b">
            Score (100 = breakeven)
          </text>
        </svg>
        <div className="flex-1 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Median income</span>
            <span className="font-mono text-slate-900">${medianIncome.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Median rent (annual)</span>
            <span className="font-mono text-slate-900">${annualRent.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">RPP-Housing</span>
            <span className="font-mono text-slate-900">{rppHousing.toFixed(1)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5">
            <span className="font-semibold text-slate-700">Status</span>
            <span className="font-semibold" style={{ color }}>{status}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Formula: (median household income × 100) / (annual rent × RPP-Housing/100). Sources: Census ACS B19013, B25064; BEA RPP-Housing.
      </p>
    </figure>
  );
}
