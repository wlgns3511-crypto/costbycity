/**
 * Real-vs-nominal helpers — Phase B-4.
 *
 * Wraps PCE_DEFLATOR_YEARLY for narrative + chart consumption.
 * Source attribution: BEA NIPA Table 1.1.4 (via FRED series PCEPI).
 */
import { PCE_DEFLATOR_YEARLY, realValue, inflationPct, pceForYear } from './pce-deflator';

export type RealVsNominal = {
  nominal: number;
  real: number;
  fromYear: number;
  toYear: number;
  inflationPct: number;
};

export const PCE_LATEST_FULL_YEAR = (() => {
  const last = PCE_DEFLATOR_YEARLY[PCE_DEFLATOR_YEARLY.length - 2];
  return last?.year ?? 2025;
})();

/**
 * Convert a nominal value in `fromYear` dollars into real `toYear` dollars
 * with full breakdown for narrative use.
 */
export function asRealValue(
  nominal: number,
  fromYear: number,
  toYear: number = PCE_LATEST_FULL_YEAR,
): RealVsNominal {
  const real = realValue(nominal, fromYear, toYear);
  const infl = inflationPct(fromYear, toYear);
  return { nominal, real, fromYear, toYear, inflationPct: infl };
}

/**
 * Format real-vs-nominal for inline narrative.
 * Example: "$70,000 in 2008 = $98,520 in 2024 dollars (+40.7% inflation)"
 */
export function describeRealValue(rv: RealVsNominal): string {
  const fmt = (n: number) =>
    `$${Math.round(n).toLocaleString('en-US')}`;
  return `${fmt(rv.nominal)} in ${rv.fromYear} = ${fmt(rv.real)} in ${rv.toYear} dollars (${
    rv.inflationPct >= 0 ? '+' : ''
  }${rv.inflationPct.toFixed(1)}% cumulative inflation)`;
}

/**
 * Deflate a series of (year, value) pairs to a common base year.
 * Useful for plotting "real" RPP / wage / rent trend.
 */
export function deflateSeries<T extends { year: number; value: number }>(
  series: T[],
  baseYear: number = PCE_LATEST_FULL_YEAR,
): Array<T & { realValue: number }> {
  return series.map((s) => ({
    ...s,
    realValue: realValue(s.value, s.year, baseYear),
  }));
}

/**
 * Validate a year is within PCE coverage.
 */
export function pceCoverageHas(year: number): boolean {
  return pceForYear(year) !== undefined;
}
