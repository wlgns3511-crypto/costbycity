/**
 * cost-facts.ts — costbycity HCU 5-chunk patch (2026-04-29).
 *
 * Layer 1: SQL-derived facts + city status classification + extended ranking
 * SQL builders for /rankings/[type] and /insights/[topic].
 *
 * Pattern source: salarybycity lib/salary-facts.ts → adapted to BEA RPP + ACS
 * schema (387 metros × 5 RPP categories × 5 years + ACS coverage 100%).
 *
 * Each metro gets:
 *   • Latest RPP all/housing/goods/utilities/services
 *   • ACS context (median_income, rent, home_value)
 *   • Real (RPP-adjusted) income
 *   • Housing-vs-overall gap (positive = housing pulls cost up; negative = housing
 *     is cheaper than the overall index — typical of inland cities where
 *     goods/services do the heavy lifting)
 *   • 5-year RPP_all delta (mean-reversion signal)
 *   • Rent burden = annual median rent ÷ median household income
 *   • RPP rank (1 = most expensive among 387)
 *   • Status (one of 9 buckets, evaluated in priority order)
 *
 * The Status drives which commentary builder gets called. Each status has 4
 * slots (headline / fact / context / implication) × 3 variants × slug-hash.
 */

import {
  getDb,
  getMetroBySlug,
  getLatestRPP,
  getACS,
  getRPPHistory,
  type Metro,
  type ACS,
} from './db';

// ──────────────────────────────────────────────────────────────────
// National reference points (used in narrative comparisons)
// ──────────────────────────────────────────────────────────────────
// US median household income — Census ACS 2023 (one-year). Anchored constant
// rather than per-build derived because ACS national-level publishes
// independently from metro tiles; using it as a stable anchor keeps narrative
// stable across rebuilds.
export const US_MEDIAN_INCOME = 75149;
export const US_MEDIAN_RENT = 1163;
export const US_MEDIAN_HOME_VALUE = 281900;

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type CityStatus =
  | 'cost_extreme_high'      // rpp_all >= 110 (top ~10 metros: NYC, SF, San Jose, Honolulu, DC...)
  | 'rent_burden_heavy'      // rent_pct >= 23 (Miami, Orlando, LA, NY, FL coast)
  | 'housing_heavy'          // housing_gap >= 15 (housing index pulls overall up)
  | 'hidden_gem'             // rpp_all <= 95 AND real_income >= 78K (low cost + good real wages)
  | 'income_compensated'     // rpp_all >= 102 AND real_income >= 75K (expensive but pay keeps up)
  | 'fast_riser'             // 5-yr RPP delta >= +4 points
  | 'fast_decliner'          // 5-yr RPP delta <= -3 points
  | 'cost_extreme_low'       // rpp_all <= 88 (bottom band, mostly Southern + Rust Belt)
  | 'average_metro';         // fallback

export interface CityFacts {
  metro: Metro;
  acs: ACS | null;
  // Latest RPP values
  rppAll: number;
  rppHousing: number | null;
  rppGoods: number | null;
  rppUtilities: number | null;
  rppServices: number | null;
  rppYear: number;
  // Derived signals
  realIncome: number | null;        // (median_income / rpp_all) × 100
  housingGap: number | null;        // rpp_housing - rpp_all
  fiveYearDelta: number | null;     // rpp_all − rpp_all_5_years_ago
  fiveYearStartYear: number | null; // year of comparison anchor
  rentBurdenPct: number | null;     // (median_rent × 12) / median_income × 100
  homeToIncomeRatio: number | null; // median_home_value / median_income
  // National-relative
  vsNationalAll: number;            // rpp_all - 100 (signed, percent)
  realIncomeVsNational: number | null; // realIncome / US_MEDIAN_INCOME
  // Rank context
  rppRank: number;                  // 1 = most expensive of 387
  rppTotal: number;
  // Status (drives commentary)
  status: CityStatus;
}

// ──────────────────────────────────────────────────────────────────
// Status classifier
// ──────────────────────────────────────────────────────────────────

function classifyStatus(f: Omit<CityFacts, 'status'>): CityStatus {
  const { rppAll, rppHousing, realIncome, fiveYearDelta, rentBurdenPct, housingGap } = f;

  // Priority order: most distinctive first.
  if (rppAll >= 110) return 'cost_extreme_high';
  if (rentBurdenPct != null && rentBurdenPct >= 23) return 'rent_burden_heavy';
  if (housingGap != null && housingGap >= 15) return 'housing_heavy';
  if (rppAll <= 95 && realIncome != null && realIncome >= 78000) return 'hidden_gem';
  if (rppAll >= 102 && realIncome != null && realIncome >= 75000) return 'income_compensated';
  if (fiveYearDelta != null && fiveYearDelta >= 4) return 'fast_riser';
  if (fiveYearDelta != null && fiveYearDelta <= -3) return 'fast_decliner';
  if (rppAll <= 88) return 'cost_extreme_low';
  // Suppress unused-var lint: rppHousing referenced for future expansion
  void rppHousing;
  return 'average_metro';
}

// ──────────────────────────────────────────────────────────────────
// Public API: per-city facts builder
// ──────────────────────────────────────────────────────────────────

let _rppRankCache: Map<string, { rank: number; total: number }> | null = null;
function buildRPPRankCache(): Map<string, { rank: number; total: number }> {
  if (_rppRankCache) return _rppRankCache;
  const rows = getDb().prepare(`
    SELECT fips, value FROM rpp
    WHERE category='all' AND year=(SELECT MAX(year) FROM rpp)
    ORDER BY value DESC
  `).all() as { fips: string; value: number }[];
  const map = new Map<string, { rank: number; total: number }>();
  rows.forEach((r, i) => map.set(r.fips, { rank: i + 1, total: rows.length }));
  _rppRankCache = map;
  return map;
}

export function getCityFacts(slug: string): CityFacts | null {
  const metro = getMetroBySlug(slug);
  if (!metro) return null;
  const rpp = getLatestRPP(metro.fips);
  const rppAll = rpp.all;
  if (!rppAll) return null;
  const acs = getACS(metro.fips);
  const history = getRPPHistory(metro.fips);
  const latestYear = history.length ? history[history.length - 1].year : 2024;
  const earlierIdx = history.findIndex((h) => h.year === latestYear - 4);
  const fiveYearDelta = earlierIdx >= 0
    ? Math.round((history[history.length - 1].value - history[earlierIdx].value) * 10) / 10
    : null;
  const fiveYearStartYear = earlierIdx >= 0 ? history[earlierIdx].year : null;

  const realIncome = acs?.median_income ? Math.round((acs.median_income * 100) / rppAll) : null;
  const housingGap = rpp.housing != null ? Math.round((rpp.housing - rppAll) * 10) / 10 : null;
  const rentBurdenPct = acs?.median_rent && acs?.median_income
    ? Math.round((acs.median_rent * 12 * 100) / acs.median_income * 10) / 10
    : null;
  const homeToIncomeRatio = acs?.median_home_value && acs?.median_income
    ? Math.round((acs.median_home_value / acs.median_income) * 10) / 10
    : null;

  const ranks = buildRPPRankCache();
  const rankInfo = ranks.get(metro.fips) ?? { rank: 0, total: ranks.size };

  const partial = {
    metro,
    acs,
    rppAll,
    rppHousing: rpp.housing ?? null,
    rppGoods: rpp.goods ?? null,
    rppUtilities: rpp.utilities ?? null,
    rppServices: rpp.other_services ?? null,
    rppYear: latestYear,
    realIncome,
    housingGap,
    fiveYearDelta,
    fiveYearStartYear,
    rentBurdenPct,
    homeToIncomeRatio,
    vsNationalAll: Math.round((rppAll - 100) * 10) / 10,
    realIncomeVsNational: realIncome ? Math.round((realIncome / US_MEDIAN_INCOME) * 100) / 100 : null,
    rppRank: rankInfo.rank,
    rppTotal: rankInfo.total,
  };
  return { ...partial, status: classifyStatus(partial) };
}

// ──────────────────────────────────────────────────────────────────
// State-level facts (for /state/[slug]/ Layer 2)
// ──────────────────────────────────────────────────────────────────

export interface StateFacts {
  state: string;
  cities: { slug: string; short_name: string; rpp_all: number }[];
  cityCount: number;
  topCity: { slug: string; short_name: string; rpp_all: number } | null;
  bottomCity: { slug: string; short_name: string; rpp_all: number } | null;
  avgRPP: number;
  rppSpread: number;             // top - bottom
  vsNationalAvg: number;         // avgRPP - 100
  // Cross-state context
  stateRankByAvg: number;        // 1 = most expensive state by avg metro RPP
  stateTotal: number;            // count of states with metros (denominator for stateRankByAvg)
  // Distribution
  expensiveCount: number;        // count of metros at >= 105
  affordableCount: number;       // count of metros at <= 95
}

let _stateAvgRankCache: Map<string, { rank: number; total: number; avg: number }> | null = null;
function buildStateRankCache(): Map<string, { rank: number; total: number; avg: number }> {
  if (_stateAvgRankCache) return _stateAvgRankCache;
  const rows = getDb().prepare(`
    SELECT m.state, AVG(r.value) AS avg_v
    FROM metros m
    JOIN rpp r ON r.fips = m.fips
    WHERE r.category='all' AND r.year=(SELECT MAX(year) FROM rpp)
    GROUP BY m.state
    ORDER BY avg_v DESC
  `).all() as { state: string; avg_v: number }[];
  const map = new Map<string, { rank: number; total: number; avg: number }>();
  rows.forEach((r, i) => map.set(r.state, { rank: i + 1, total: rows.length, avg: r.avg_v }));
  _stateAvgRankCache = map;
  return map;
}

export function getStateFactsByCode(stateCode: string): StateFacts | null {
  const cities = getDb().prepare(`
    SELECT m.slug, m.short_name, r.value AS rpp_all
    FROM metros m
    JOIN rpp r ON r.fips = m.fips
    WHERE m.state=? AND r.category='all' AND r.year=(SELECT MAX(year) FROM rpp)
    ORDER BY r.value DESC
  `).all(stateCode) as { slug: string; short_name: string; rpp_all: number }[];
  if (!cities.length) return null;

  const top = cities[0];
  const bottom = cities[cities.length - 1];
  const avgRPP = Math.round((cities.reduce((s, c) => s + c.rpp_all, 0) / cities.length) * 10) / 10;
  const rppSpread = Math.round((top.rpp_all - bottom.rpp_all) * 10) / 10;

  const ranks = buildStateRankCache();
  const rankInfo = ranks.get(stateCode) ?? { rank: 0, total: ranks.size, avg: avgRPP };

  return {
    state: stateCode,
    cities,
    cityCount: cities.length,
    topCity: top,
    bottomCity: bottom,
    avgRPP,
    rppSpread,
    vsNationalAvg: Math.round((avgRPP - 100) * 10) / 10,
    stateRankByAvg: rankInfo.rank,
    stateTotal: rankInfo.total,
    expensiveCount: cities.filter((c) => c.rpp_all >= 105).length,
    affordableCount: cities.filter((c) => c.rpp_all <= 95).length,
  };
}

// ──────────────────────────────────────────────────────────────────
// 8 new ranking SQL builders (extending the 4 existing ones in db.ts)
// ──────────────────────────────────────────────────────────────────
//
// Existing in db.ts:
//   getMostExpensiveCities, getCheapestCities, getCheapestHousing,
//   getMostExpensiveHousing
//
// New here:
//   hidden-gems, rent-burden-highest, fastest-rising, fastest-falling,
//   housing-heavy, income-leaders, value-leaders, cheapest-utilities

export interface RankingRow {
  fips: string;
  slug: string;
  short_name: string;
  state: string;
  primary_value: number;     // the headline number for the row
  secondary_value: number | null;  // optional context number (e.g. rpp_all when ranking by housing_gap)
  secondary_label?: string;  // human label for the secondary value
}

const LATEST_RPP_YEAR_SQL = '(SELECT MAX(year) FROM rpp)';

/** Hidden Gems — low overall RPP, high real income (best real-purchasing-power metros). */
export function rankHiddenGems(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(a.median_income*100.0/r.value) AS primary_value,
      r.value AS secondary_value
    FROM metros m
    JOIN rpp r ON r.fips=m.fips AND r.category='all' AND r.year=${LATEST_RPP_YEAR_SQL}
    JOIN acs a ON a.fips=m.fips
    WHERE r.value <= 100 AND a.median_income IS NOT NULL
    ORDER BY (a.median_income*1.0/r.value) DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

/** Rent burden — median rent × 12 ÷ median income, descending. */
export function rankRentBurden(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(a.median_rent*12.0/a.median_income*100, 1) AS primary_value,
      a.median_rent AS secondary_value
    FROM metros m
    JOIN acs a ON a.fips=m.fips
    WHERE a.median_rent IS NOT NULL AND a.median_income IS NOT NULL AND a.median_income > 0
    ORDER BY (a.median_rent*1.0/a.median_income) DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Median Rent',
  }));
}

/** Fastest-rising — biggest 5-yr RPP_all increase. */
export function rankFastestRising(limit = 50): RankingRow[] {
  return getDb().prepare(`
    WITH latest AS (SELECT fips, value FROM rpp WHERE category='all' AND year=${LATEST_RPP_YEAR_SQL}),
         five AS (SELECT fips, value FROM rpp WHERE category='all' AND year=${LATEST_RPP_YEAR_SQL}-4)
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(latest.value - five.value, 1) AS primary_value,
      latest.value AS secondary_value
    FROM metros m
    JOIN latest ON latest.fips=m.fips
    JOIN five ON five.fips=m.fips
    ORDER BY (latest.value - five.value) DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

/** Fastest-falling — biggest 5-yr RPP_all decrease (most negative delta). */
export function rankFastestFalling(limit = 50): RankingRow[] {
  return getDb().prepare(`
    WITH latest AS (SELECT fips, value FROM rpp WHERE category='all' AND year=${LATEST_RPP_YEAR_SQL}),
         five AS (SELECT fips, value FROM rpp WHERE category='all' AND year=${LATEST_RPP_YEAR_SQL}-4)
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(latest.value - five.value, 1) AS primary_value,
      latest.value AS secondary_value
    FROM metros m
    JOIN latest ON latest.fips=m.fips
    JOIN five ON five.fips=m.fips
    ORDER BY (latest.value - five.value) ASC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

/** Housing-heavy — biggest housing_gap (housing index minus overall index). */
export function rankHousingHeavy(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(rh.value - ra.value, 1) AS primary_value,
      ra.value AS secondary_value
    FROM metros m
    JOIN rpp ra ON ra.fips=m.fips AND ra.category='all' AND ra.year=${LATEST_RPP_YEAR_SQL}
    JOIN rpp rh ON rh.fips=m.fips AND rh.category='housing' AND rh.year=${LATEST_RPP_YEAR_SQL}
    ORDER BY (rh.value - ra.value) DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

/** Income leaders — highest median household income (nominal). */
export function rankIncomeLeaders(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      a.median_income AS primary_value,
      r.value AS secondary_value
    FROM metros m
    JOIN acs a ON a.fips=m.fips
    JOIN rpp r ON r.fips=m.fips AND r.category='all' AND r.year=${LATEST_RPP_YEAR_SQL}
    WHERE a.median_income IS NOT NULL
    ORDER BY a.median_income DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

/** Value leaders — highest real (RPP-adjusted) income. */
export function rankValueLeaders(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(a.median_income*100.0/r.value) AS primary_value,
      a.median_income AS secondary_value
    FROM metros m
    JOIN rpp r ON r.fips=m.fips AND r.category='all' AND r.year=${LATEST_RPP_YEAR_SQL}
    JOIN acs a ON a.fips=m.fips
    WHERE a.median_income IS NOT NULL
    ORDER BY (a.median_income*1.0/r.value) DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Median Income',
  }));
}

/** Cheapest utilities — lowest utilities RPP. */
export function rankCheapestUtilities(limit = 50): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      r.value AS primary_value,
      ra.value AS secondary_value
    FROM metros m
    JOIN rpp r ON r.fips=m.fips AND r.category='utilities' AND r.year=${LATEST_RPP_YEAR_SQL}
    JOIN rpp ra ON ra.fips=m.fips AND ra.category='all' AND ra.year=${LATEST_RPP_YEAR_SQL}
    ORDER BY r.value ASC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}
