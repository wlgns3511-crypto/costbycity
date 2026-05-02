/**
 * RppTrendChart — server SVG line of RPP series across years.
 *
 * Veto #7 status: CLEAR — visualization of primary BEA RPP, no synthesis.
 * Trap #34/#36 safety: all dynamic values via style={{ ... }} only.
 */
export type RppSeries = {
  label: string;
  color: string;
  points: Array<{ year: number; value: number }>;
};

export function RppTrendChart({
  series,
  title,
  height = 200,
  yMin: yMinProp,
  yMax: yMaxProp,
}: {
  series: RppSeries[];
  title: string;
  height?: number;
  yMin?: number;
  yMax?: number;
}) {
  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) return null;
  const years = Array.from(new Set(allPoints.map((p) => p.year))).sort((a, b) => a - b);
  const valueMin = yMinProp ?? Math.floor(Math.min(...allPoints.map((p) => p.value)) - 2);
  const valueMax = yMaxProp ?? Math.ceil(Math.max(...allPoints.map((p) => p.value)) + 2);

  const W = 640;
  const H = height;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  const xAt = (year: number) => {
    const idx = years.indexOf(year);
    if (idx < 0) return padL;
    return padL + (idx / Math.max(1, years.length - 1)) * (W - padL - padR);
  };
  const yAt = (val: number) => {
    const norm = (val - valueMin) / Math.max(1, valueMax - valueMin);
    return padT + (1 - norm) * (H - padT - padB);
  };

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks }, (_, i) =>
    valueMin + ((valueMax - valueMin) * i) / (yTicks - 1),
  );

  return (
    <figure className="my-6 rounded-lg border border-slate-200 bg-white p-4" data-upgrade="rpp-trend">
      <figcaption className="mb-3 text-sm font-semibold text-slate-700">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full">
        {tickValues.map((tv, i) => (
          <g key={i}>
            <line x1={padL} y1={yAt(tv)} x2={W - padR} y2={yAt(tv)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={padL - 4} y={yAt(tv) + 3} textAnchor="end" fontSize={10} fill="#64748b">
              {tv.toFixed(0)}
            </text>
          </g>
        ))}
        <line x1={padL} y1={yAt(100)} x2={W - padR} y2={yAt(100)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
        <text x={W - padR - 2} y={yAt(100) - 3} textAnchor="end" fontSize={10} fill="#475569">
          US avg = 100
        </text>
        {years.map((y, i) => {
          if (i % Math.ceil(years.length / 8) !== 0 && i !== years.length - 1) return null;
          return (
            <text key={y} x={xAt(y)} y={H - padB + 14} textAnchor="middle" fontSize={10} fill="#64748b">
              {y}
            </text>
          );
        })}
        {series.map((s, i) => {
          const path = s.points
            .slice()
            .sort((a, b) => a.year - b.year)
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xAt(p.year).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
            .join(' ');
          return (
            <g key={i}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((p, idx) => (
                <circle key={idx} cx={xAt(p.year)} cy={yAt(p.value)} r={2.5} fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {series.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Source: BEA Regional Price Parities (SARPP/MARPP) {years[0]}–{years[years.length - 1]}.
      </p>
    </figure>
  );
}
