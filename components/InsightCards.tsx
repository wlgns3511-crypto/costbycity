import { getRPPRank, getIncomeRank } from '@/lib/db';
import type { ACS } from '@/lib/db';
import { formatDollar } from '@/lib/format';

interface Props {
  rppAll: number;
  acs: ACS | null;
  cityName: string;
}

export function InsightCards({ rppAll, acs, cityName }: Props) {
  const rppRank = getRPPRank(rppAll);
  const diff = rppAll - 100;
  const diffLabel = diff > 0 ? `${diff.toFixed(1)}% above` : diff < 0 ? `${Math.abs(diff).toFixed(1)}% below` : 'at';

  // Affordability: income vs cost
  const affordability = acs?.median_income && rppAll > 0
    ? (acs.median_income / rppAll * 100)
    : null;
  const affordLabel = affordability
    ? affordability > 800 ? 'Very Affordable' : affordability > 600 ? 'Affordable' : affordability > 400 ? 'Moderate' : 'Expensive'
    : null;

  // Housing burden: rent as % of income
  const housingBurden = acs?.median_rent && acs?.median_income
    ? ((acs.median_rent * 12) / acs.median_income) * 100
    : null;
  const burdenLabel = housingBurden
    ? housingBurden > 30 ? 'Cost-Burdened' : housingBurden > 20 ? 'Moderate' : 'Affordable'
    : null;

  const incomeRank = acs?.median_income ? getIncomeRank(acs.median_income) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {/* Cost Index Rank */}
      <div className="rounded-xl border p-4 border-emerald-200 bg-emerald-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cost Index Rank</div>
        <div className="text-2xl font-bold text-emerald-700 mb-1">#{rppRank.rank} <span className="text-base font-normal text-slate-400">of {rppRank.total}</span></div>
        <p className="text-sm text-slate-600 leading-snug">{cityName} ranks #{rppRank.rank} most expensive out of {rppRank.total} metro areas tracked.</p>
      </div>

      {/* vs National Average */}
      <div className="rounded-xl border p-4 border-emerald-200 bg-emerald-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">vs National Avg</div>
        <div className={`text-2xl font-bold mb-1 ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
        </div>
        <p className="text-sm text-slate-600 leading-snug">Cost of living is {diffLabel} the national average (100.0).</p>
      </div>

      {/* Affordability */}
      {affordLabel && (
        <div className="rounded-xl border p-4 border-emerald-200 bg-emerald-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Affordability</div>
          <div className="text-2xl font-bold text-emerald-700 mb-1">{affordLabel}</div>
          <p className="text-sm text-slate-600 leading-snug">
            {acs?.median_income ? `Median income of ${formatDollar(acs.median_income)} relative to a cost index of ${rppAll.toFixed(1)}.` : ''}
          </p>
        </div>
      )}

      {/* Housing Burden */}
      {housingBurden != null && (
        <div className="rounded-xl border p-4 border-emerald-200 bg-emerald-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Housing Burden</div>
          <div className={`text-2xl font-bold mb-1 ${housingBurden > 30 ? 'text-red-600' : 'text-emerald-700'}`}>
            {housingBurden.toFixed(1)}%
          </div>
          <p className="text-sm text-slate-600 leading-snug">
            {burdenLabel} — rent uses {housingBurden.toFixed(1)}% of median income. Over 30% is considered cost-burdened.
          </p>
        </div>
      )}
    </div>
  );
}
