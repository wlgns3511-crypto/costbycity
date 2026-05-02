'use client';

import { useState } from 'react';
import { realValue, PCE_DEFLATOR_YEARLY } from '@/lib/pce-deflator';

const LATEST_FULL = (() => {
  const last = PCE_DEFLATOR_YEARLY[PCE_DEFLATOR_YEARLY.length - 2];
  return last?.year ?? 2025;
})();

export type PCESeriesPoint = { year: number; value: number };

export function PCEDeflatorToggle({
  series,
  label,
  unit = '$',
  fixedDigits = 0,
}: {
  series: PCESeriesPoint[];
  label: string;
  unit?: string;
  fixedDigits?: number;
}) {
  const [showReal, setShowReal] = useState(true);

  const data = showReal
    ? series.map((p) => ({
        year: p.year,
        value: Math.round(realValue(p.value, p.year, LATEST_FULL) * Math.pow(10, fixedDigits)) / Math.pow(10, fixedDigits),
      }))
    : series;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const span = max - min || 1;

  return (
    <section className="my-6 rounded-lg border border-slate-200 bg-white p-4" data-upgrade="pce-toggle">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <div className="flex rounded-md bg-slate-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setShowReal(true)}
            className={`rounded px-3 py-1 transition ${showReal ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            aria-pressed={showReal}
          >
            Real ({LATEST_FULL} $)
          </button>
          <button
            type="button"
            onClick={() => setShowReal(false)}
            className={`rounded px-3 py-1 transition ${!showReal ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            aria-pressed={!showReal}
          >
            Nominal
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {data.map((d) => {
          const pct = ((d.value - min) / span) * 100;
          return (
            <div key={d.year} className="flex items-center gap-2 text-xs">
              <span className="w-10 shrink-0 font-mono text-slate-500">{d.year}</span>
              <div className="relative h-5 flex-1 rounded bg-slate-100">
                <div
                  className="h-full rounded bg-blue-500/80"
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-slate-700">
                {unit}{d.value.toLocaleString('en-US', { minimumFractionDigits: fixedDigits, maximumFractionDigits: fixedDigits })}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {showReal
          ? `Adjusted to ${LATEST_FULL} dollars via BEA PCE Price Index (NIPA Table 1.1.4).`
          : `Nominal values as observed in each year.`}
      </p>
    </section>
  );
}
