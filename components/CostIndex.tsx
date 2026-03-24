import { categoryLabel, formatIndex, formatPctDiffShort } from '@/lib/format';

export function CostIndexBar({ value, label }: { value: number; label: string }) {
  // Scale: 70-150 range mapped to 0-100%
  const min = 70, max = 150;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const natPct = ((100 - min) / (max - min)) * 100;
  const isAbove = value > 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className={`font-bold ${isAbove ? 'text-red-600' : 'text-green-600'}`}>
          {formatIndex(value)} ({formatPctDiffShort(value)})
        </span>
      </div>
      <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`absolute h-full rounded-full ${isAbove ? 'bg-red-400' : 'bg-green-400'}`}
          style={{ width: `${pct}%` }}
        />
        {/* National average marker */}
        <div
          className="absolute h-full w-0.5 bg-slate-800"
          style={{ left: `${natPct}%` }}
        />
      </div>
    </div>
  );
}

export function CostBreakdown({ rpp }: { rpp: Record<string, number> }) {
  const categories = ['all', 'housing', 'goods', 'utilities', 'other_services'];

  return (
    <div className="space-y-1">
      {categories.map((cat) => {
        if (!rpp[cat]) return null;
        return (
          <CostIndexBar key={cat} value={rpp[cat]} label={categoryLabel(cat)} />
        );
      })}
      <p className="text-xs text-slate-400 mt-2">National average = 100</p>
    </div>
  );
}

export function ComparisonTable({
  cityA,
  cityB,
  rppA,
  rppB,
}: {
  cityA: string;
  cityB: string;
  rppA: Record<string, number>;
  rppB: Record<string, number>;
}) {
  const categories = ['all', 'housing', 'goods', 'utilities', 'other_services'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left p-3 font-semibold">Category</th>
            <th className="text-right p-3 font-semibold">{cityA}</th>
            <th className="text-right p-3 font-semibold">{cityB}</th>
            <th className="text-right p-3 font-semibold">Difference</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const a = rppA[cat];
            const b = rppB[cat];
            if (!a || !b) return null;
            const diff = a - b;
            return (
              <tr key={cat} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-3 font-medium">{categoryLabel(cat)}</td>
                <td className={`p-3 text-right ${a > b ? 'text-red-600 font-semibold' : ''}`}>
                  {formatIndex(a)}
                </td>
                <td className={`p-3 text-right ${b > a ? 'text-red-600 font-semibold' : ''}`}>
                  {formatIndex(b)}
                </td>
                <td className={`p-3 text-right font-medium ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
