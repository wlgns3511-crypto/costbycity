export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-indigo-50 border-indigo-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
        <span>💰</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">Cost of Living Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-medium">Economic Data Specialists</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">Our economists process Regional Price Parity data from the Bureau of Economic Analysis alongside international cost benchmarks to deliver accurate, up-to-date cost comparisons across 380+ US metro areas.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">✓ BLS Consumer Price Index</span>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">✓ EIU Cost of Living</span>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">✓ ACCRA Cost of Living Index</span>
        </div>
      </div>
    </div>
  );
}
