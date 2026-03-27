"use client";

import { useState, useMemo } from "react";
import { formatDollar } from "@/lib/format";

interface Props {
  cityName: string;
  defaultCostIndex: number;
}

const FAMILY_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.55,
  4: 1.75,
  5: 1.9,
  6: 2.05,
};

export function RelocationCalculator({ cityName, defaultCostIndex }: Props) {
  const [salary, setSalary] = useState(75000);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState(cityName);
  const [sourceCostIndex, setSourceCostIndex] = useState(100);
  const [targetCostIndex, setTargetCostIndex] = useState(defaultCostIndex);
  const [familySize, setFamilySize] = useState(1);
  const [isRenting, setIsRenting] = useState(true);

  const results = useMemo(() => {
    const ratio = targetCostIndex / sourceCostIndex;
    const requiredSalary = Math.round(salary * ratio);
    const monthlyCurrent = salary / 12;
    const monthlyNew = requiredSalary / 12;
    const monthlySavingsDiff = Math.round(monthlyNew - monthlyCurrent);

    const famMult = FAMILY_MULTIPLIERS[familySize] ?? 1;

    // First month costs estimates scaled by cost index and family size
    const baseRent = 1500 * (targetCostIndex / 100) * famMult;
    const deposit = isRenting ? Math.round(baseRent * 2) : 0;
    const movers = Math.round(1200 * famMult * (targetCostIndex / 100));
    const setup = Math.round(800 * famMult * (targetCostIndex / 100));
    const firstMonthTotal = deposit + movers + setup;

    const annualDiff = Math.round((requiredSalary - salary));

    return {
      requiredSalary,
      monthlySavingsDiff,
      deposit,
      movers,
      setup,
      firstMonthTotal,
      annualDiff,
    };
  }, [salary, sourceCostIndex, targetCostIndex, familySize, isRenting]);

  return (
    <section className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-900 mb-4">
        Relocation Cost Planner
      </h2>
      <p className="text-sm text-emerald-700 mb-5">
        Estimate how your salary and expenses will change when moving to a new city.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Annual Salary
          </label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value) || 0)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
            min={0}
            step={1000}
          />
        </div>

        {/* Family Size */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Family Size
          </label>
          <select
            value={familySize}
            onChange={(e) => setFamilySize(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none bg-white"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        {/* Moving From */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Moving From
          </label>
          <input
            type="text"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            placeholder="e.g. Houston, TX"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
          />
          <div className="mt-1">
            <label className="text-xs text-slate-500">Source Cost Index</label>
            <input
              type="number"
              value={sourceCostIndex}
              onChange={(e) => setSourceCostIndex(Number(e.target.value) || 100)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              min={50}
              max={200}
              step={0.1}
            />
          </div>
        </div>

        {/* Moving To */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Moving To
          </label>
          <input
            type="text"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            placeholder="e.g. Denver, CO"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
          />
          <div className="mt-1">
            <label className="text-xs text-slate-500">Target Cost Index</label>
            <input
              type="number"
              value={targetCostIndex}
              onChange={(e) => setTargetCostIndex(Number(e.target.value) || 100)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
              min={50}
              max={200}
              step={0.1}
            />
          </div>
        </div>
      </div>

      {/* Renting vs Buying toggle */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-sm font-medium ${isRenting ? "text-emerald-700" : "text-slate-400"}`}>
          Renting
        </span>
        <button
          type="button"
          onClick={() => setIsRenting(!isRenting)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isRenting ? "bg-emerald-500" : "bg-slate-400"
          }`}
          aria-label="Toggle renting vs buying"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              !isRenting ? "translate-x-6" : ""
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${!isRenting ? "text-emerald-700" : "text-slate-400"}`}>
          Buying
        </span>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <div className="text-sm text-slate-500">Required Salary in New City</div>
          <div className="text-2xl font-bold text-emerald-700">
            {formatDollar(results.requiredSalary)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            to maintain the same standard of living
          </div>
        </div>

        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <div className="text-sm text-slate-500">Monthly Savings Difference</div>
          <div
            className={`text-2xl font-bold ${
              results.monthlySavingsDiff > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {results.monthlySavingsDiff > 0 ? "+" : ""}
            {formatDollar(results.monthlySavingsDiff)}/mo
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {results.monthlySavingsDiff > 0 ? "more expensive" : "less expensive"} per month
          </div>
        </div>

        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <div className="text-sm text-slate-500">First Month Costs</div>
          <div className="text-2xl font-bold text-emerald-700">
            {formatDollar(results.firstMonthTotal)}
          </div>
          <div className="text-xs text-slate-400 mt-1 space-y-0.5">
            {results.deposit > 0 && <div>Deposit: {formatDollar(results.deposit)}</div>}
            <div>Movers: {formatDollar(results.movers)}</div>
            <div>Setup & essentials: {formatDollar(results.setup)}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <div className="text-sm text-slate-500">Annual Cost Difference</div>
          <div
            className={`text-2xl font-bold ${
              results.annualDiff > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {results.annualDiff > 0 ? "+" : ""}
            {formatDollar(results.annualDiff)}/yr
          </div>
          <div className="text-xs text-slate-400 mt-1">
            compared to your current location
          </div>
        </div>
      </div>

      {/* High-CPC keywords footer */}
      <div className="border-t border-emerald-200 pt-4 mt-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Planning a move? Get <strong>moving company quotes</strong> from licensed movers, compare{" "}
          <strong>renters insurance comparison</strong> rates for your new city, use an{" "}
          <strong>apartment finder</strong> to browse listings, and explore{" "}
          <strong>furniture rental services</strong> to furnish your new home affordably.
        </p>
      </div>
    </section>
  );
}
