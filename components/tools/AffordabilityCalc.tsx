"use client";
import { useState, useMemo } from "react";

interface Props {
  cityName: string;
  costIndex: number;
  housingIndex: number;
  groceriesIndex: number;
  medianIncome: number | null;
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

const NATIONAL_BASELINE = {
  housing: 1570 * 12,    // ~$18,840/yr (national median rent ~$1,570/mo)
  groceries: 6000,       // ~$500/mo national avg
  transport: 10000,      // ~$833/mo national avg
  other: 15000,          // healthcare, utilities, misc
};
const NATIONAL_TOTAL =
  NATIONAL_BASELINE.housing +
  NATIONAL_BASELINE.groceries +
  NATIONAL_BASELINE.transport +
  NATIONAL_BASELINE.other;

type Verdict = "Comfortable" | "Manageable" | "Tight" | "Unaffordable";

function getVerdict(ratio: number): { verdict: Verdict; color: string; bgColor: string } {
  if (ratio >= 1.3) return { verdict: "Comfortable", color: "text-green-700", bgColor: "bg-green-100" };
  if (ratio >= 1.0) return { verdict: "Manageable", color: "text-blue-700", bgColor: "bg-blue-100" };
  if (ratio >= 0.75) return { verdict: "Tight", color: "text-amber-700", bgColor: "bg-amber-100" };
  return { verdict: "Unaffordable", color: "text-red-700", bgColor: "bg-red-100" };
}

export function AffordabilityCalc({
  cityName,
  costIndex,
  housingIndex,
  groceriesIndex,
  medianIncome,
}: Props) {
  const [income, setIncome] = useState(medianIncome ?? 65000);

  const result = useMemo(() => {
    const housingMult = housingIndex / 100;
    const groceriesMult = groceriesIndex / 100;
    const otherMult = costIndex / 100;

    const adjHousing = NATIONAL_BASELINE.housing * housingMult;
    const adjGroceries = NATIONAL_BASELINE.groceries * groceriesMult;
    const adjTransport = NATIONAL_BASELINE.transport * otherMult;
    const adjOther = NATIONAL_BASELINE.other * otherMult;
    const totalCost = adjHousing + adjGroceries + adjTransport + adjOther;

    const monthlyHousing = adjHousing / 12;
    const monthlyIncome = income / 12;
    const housingPct = (monthlyHousing / monthlyIncome) * 100;

    const ratio = income / totalCost;
    const { verdict, color, bgColor } = getVerdict(ratio);

    // Equivalent national income: what you'd need nationally to have same lifestyle
    const equivNational = income / (costIndex / 100);
    // What you'd need in this city to match national avg lifestyle
    const neededForAvg = NATIONAL_TOTAL * (costIndex / 100);

    const surplus = income - totalCost;

    return {
      adjHousing,
      adjGroceries,
      adjTransport,
      adjOther,
      totalCost,
      housingPct,
      ratio,
      verdict,
      color,
      bgColor,
      equivNational,
      neededForAvg,
      surplus,
    };
  }, [income, costIndex, housingIndex, groceriesIndex]);

  const breakdown = [
    {
      label: "Housing",
      annual: result.adjHousing,
      monthly: result.adjHousing / 12,
      pct: (result.adjHousing / result.totalCost) * 100,
      barColor: "bg-rose-400",
    },
    {
      label: "Groceries",
      annual: result.adjGroceries,
      monthly: result.adjGroceries / 12,
      pct: (result.adjGroceries / result.totalCost) * 100,
      barColor: "bg-amber-400",
    },
    {
      label: "Transport",
      annual: result.adjTransport,
      monthly: result.adjTransport / 12,
      pct: (result.adjTransport / result.totalCost) * 100,
      barColor: "bg-blue-400",
    },
    {
      label: "Other",
      annual: result.adjOther,
      monthly: result.adjOther / 12,
      pct: (result.adjOther / result.totalCost) * 100,
      barColor: "bg-slate-400",
    },
  ];

  return (
    <section className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
      <h2 className="text-xl font-bold mb-1">Affordability Calculator</h2>
      <p className="text-sm text-slate-500 mb-4">
        Can you afford to live in {cityName}? Enter your income to find out.
      </p>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your annual household income
        </label>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-600">$</span>
          <input
            type="number"
            min={20000}
            max={300000}
            step={1000}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 20000)}
            className="w-36 px-3 py-2 border border-slate-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <input
          type="range"
          min={20000}
          max={300000}
          step={1000}
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full mt-3 accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>$20K</span>
          <span>$300K</span>
        </div>
      </div>

      {/* Verdict */}
      <div className={`rounded-lg p-4 mb-5 border ${result.bgColor} border-slate-200`}>
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-2xl font-bold ${result.color}`}
          >
            {result.verdict}
          </span>
          {result.housingPct > 30 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Housing exceeds 30% rule
            </span>
          )}
        </div>
        <p className="text-sm text-slate-700">
          On {fmt(income)}/year in {cityName}, your estimated annual expenses are{" "}
          <strong>{fmt(result.totalCost)}</strong>, leaving{" "}
          <strong className={result.surplus >= 0 ? "text-green-700" : "text-red-600"}>
            {result.surplus >= 0 ? fmt(result.surplus) : "-" + fmt(Math.abs(result.surplus))}
          </strong>{" "}
          {result.surplus >= 0 ? "surplus" : "shortfall"} per year.
        </p>
      </div>

      {/* Cost breakdown */}
      <div className="bg-white rounded-lg p-4 mb-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Estimated Cost Breakdown (adjusted for {cityName})
        </h3>
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium">
                  {fmt(item.monthly)}/mo ({fmt(item.annual)}/yr)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.barColor}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-slate-200">
          <span>Total</span>
          <span>{fmt(result.totalCost)}/yr ({fmt(result.totalCost / 12)}/mo)</span>
        </div>
      </div>

      {/* Key insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-500">Housing takes</div>
          <div className={`text-lg font-bold ${result.housingPct > 30 ? "text-red-600" : "text-green-700"}`}>
            {result.housingPct.toFixed(1)}% of income
          </div>
          <div className="text-xs text-slate-400">
            {result.housingPct > 30 ? "Above" : "Within"} the 30% guideline
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-500">Your {fmt(income)} here equals</div>
          <div className="text-lg font-bold text-indigo-700">
            {fmt(result.equivNational)} nationally
          </div>
          <div className="text-xs text-slate-400">Adjusted for local cost of living</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-500">To match national avg lifestyle</div>
          <div className="text-lg font-bold text-slate-800">
            {fmt(result.neededForAvg)}/yr needed
          </div>
          <div className="text-xs text-slate-400">Based on cost index of {costIndex.toFixed(1)}</div>
        </div>
        {medianIncome && (
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-500">vs city median income</div>
            <div
              className={`text-lg font-bold ${income >= medianIncome ? "text-green-700" : "text-amber-700"}`}
            >
              {income >= medianIncome
                ? `${(((income - medianIncome) / medianIncome) * 100).toFixed(0)}% above`
                : `${(((medianIncome - income) / medianIncome) * 100).toFixed(0)}% below`}
            </div>
            <div className="text-xs text-slate-400">
              Median: {fmt(medianIncome)}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Estimates based on BEA Regional Price Parities (cost index: {costIndex.toFixed(1)},
        housing: {housingIndex.toFixed(1)}, goods: {groceriesIndex.toFixed(1)}) applied to
        national spending averages. Actual costs vary by household size and lifestyle.
      </p>
    </section>
  );
}
