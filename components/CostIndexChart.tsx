export function CostIndexChart({ index, cityName }: { index: number; cityName: string }) {
  const max = Math.max(index, 130);
  return (
    <div className="my-4">
      <h3 className="text-sm font-semibold text-slate-600 mb-2">Cost Index vs National Average</h3>
      <div className="relative bg-slate-100 rounded-full h-8 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-3 text-white text-xs font-medium"
          style={{
            width: `${(index / max) * 100}%`,
            backgroundColor: index > 100 ? "#ef4444" : "#22c55e",
            minWidth: "3rem",
          }}
        >
          {index.toFixed(1)}
        </div>
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-800"
          style={{ left: `${(100 / max) * 100}%` }}
        />
        <span
          className="absolute -top-5 text-[10px] text-slate-500"
          style={{ left: `${(100 / max) * 100}%`, transform: "translateX(-50%)" }}
        >
          US Avg (100)
        </span>
      </div>
    </div>
  );
}
