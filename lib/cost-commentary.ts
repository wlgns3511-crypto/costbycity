/**
 * cost-commentary.ts — costbycity HCU 5-chunk patch (2026-04-29).
 *
 * Layer 2: per-city + per-state narrative built from facts modules.
 * 9 city-statuses × 4 slots × 3 variants × slug-hash → ~108 distinct strings
 * per metro, deterministic per slug but corpus-wide diverse. Defeats template
 * detection.
 *
 * Pattern source: salarybycity lib/salary-commentary.ts → cost-domain mapping.
 *
 * Each commentary returns:
 *   - headline    — section title, status-inflected
 *   - fact        — FACT paragraph (raw RPP/ACS numbers + rank context)
 *   - context     — INTERPRETATION paragraph (relative comparison + signal)
 *   - implication — IMPLICATION paragraph (decision use — relocation, budget, etc.)
 *
 * Page consumes these as four distinct visual blocks. Each slot has one job.
 */

import type { CityFacts, CityStatus, StateFacts } from './cost-facts';
import { US_MEDIAN_INCOME } from './cost-facts';
import {
  pickVariant, fmtUSD, fmtUSDCompact, fmtIndex, fmtIndexDelta, fmtPct,
  ordinalSuffix,
} from './content-helpers';

export interface CityCommentary {
  headline: string;
  fact: string;
  context: string;
  implication: string;
  status: CityStatus;
}

// ──────────────────────────────────────────────────────────────────
// Local helpers
// ──────────────────────────────────────────────────────────────────

function rankClause(f: CityFacts): string {
  if (!f.rppRank || !f.rppTotal) return '';
  return `ranks ${ordinalSuffix(f.rppRank)} of ${f.rppTotal} US metros by overall cost index`;
}

function realIncomeClause(f: CityFacts): string {
  if (f.realIncome == null || !f.realIncomeVsNational) return '';
  const r = f.realIncomeVsNational;
  if (r >= 1.1) return `real (cost-adjusted) household income works out to ${fmtUSD(f.realIncome)} — about ${fmtPct(r - 1, 0)} above the US median`;
  if (r <= 0.9) return `real (cost-adjusted) household income works out to ${fmtUSD(f.realIncome)} — about ${fmtPct(1 - r, 0)} below the US median`;
  return `real (cost-adjusted) household income works out to ${fmtUSD(f.realIncome)} — close to the US median`;
}

function housingClause(f: CityFacts): string {
  if (f.housingGap == null || f.rppHousing == null) return '';
  if (f.housingGap >= 15) return `housing index ${fmtIndex(f.rppHousing)} runs ${f.housingGap.toFixed(0)} points above the overall index — shelter is the main cost driver here`;
  if (f.housingGap <= -10) return `housing index ${fmtIndex(f.rppHousing)} runs ${Math.abs(f.housingGap).toFixed(0)} points below the overall — goods and services do more cost work than shelter`;
  return `housing index ${fmtIndex(f.rppHousing)} tracks the overall index closely — costs are spread across categories rather than housing-led`;
}

function rentClause(f: CityFacts): string {
  if (f.rentBurdenPct == null || f.acs?.median_rent == null) return '';
  if (f.rentBurdenPct >= 30) return `median rent of ${fmtUSD(f.acs.median_rent)}/mo consumes ${f.rentBurdenPct.toFixed(0)}% of median income — well above HUD's 30% affordability line`;
  if (f.rentBurdenPct >= 25) return `median rent of ${fmtUSD(f.acs.median_rent)}/mo eats ${f.rentBurdenPct.toFixed(0)}% of median income — approaching HUD's 30% affordability line`;
  if (f.rentBurdenPct <= 18) return `median rent of ${fmtUSD(f.acs.median_rent)}/mo takes only ${f.rentBurdenPct.toFixed(0)}% of median income — comfortably under HUD's 30% guideline`;
  return `median rent of ${fmtUSD(f.acs.median_rent)}/mo runs ${f.rentBurdenPct.toFixed(0)}% of median income — within HUD's 30% guideline`;
}

function trendClause(f: CityFacts): string {
  if (f.fiveYearDelta == null || f.fiveYearStartYear == null) return '';
  const span = f.rppYear - f.fiveYearStartYear;
  if (f.fiveYearDelta >= 4) return `the cost index has climbed ${f.fiveYearDelta.toFixed(1)} points since ${f.fiveYearStartYear} — outpacing most US metros over the same ${span} years`;
  if (f.fiveYearDelta <= -3) return `the cost index has fallen ${Math.abs(f.fiveYearDelta).toFixed(1)} points since ${f.fiveYearStartYear} — easing relative to peers over ${span} years`;
  if (Math.abs(f.fiveYearDelta) <= 1) return `the cost index has barely moved (${fmtIndexDelta(100 + f.fiveYearDelta)} since ${f.fiveYearStartYear}) — a stable ${span}-year trend`;
  return `the cost index has shifted ${f.fiveYearDelta > 0 ? '+' : ''}${f.fiveYearDelta.toFixed(1)} points since ${f.fiveYearStartYear} — typical drift over ${span} years`;
}

function homeRatioClause(f: CityFacts): string {
  if (f.homeToIncomeRatio == null) return '';
  const r = f.homeToIncomeRatio;
  if (r >= 6) return `the home-value-to-income ratio of ${r.toFixed(1)}× is among the highest in the country — homeownership without dual incomes or significant savings is rare`;
  if (r >= 5) return `the home-value-to-income ratio is ${r.toFixed(1)}× — above the 5× threshold where homebuying typically requires a working partner or significant down payment help`;
  if (r <= 3) return `the home-value-to-income ratio is ${r.toFixed(1)}× — below the 3× line where homebuying is typically attainable for median earners`;
  return `the home-value-to-income ratio is ${r.toFixed(1)}× — within the 3×–5× band typical of mid-cost metros`;
}

// ──────────────────────────────────────────────────────────────────
// Status builders — one per CityStatus
// ──────────────────────────────────────────────────────────────────

function build_cost_extreme_high(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;

  const headline = pickVariant(slug, [
    `${name}: One of the Most Expensive US Metros (Cost Index ${fmtIndex(f.rppAll)})`,
    `Top-Tier Cost of Living in ${name}`,
    `${name} Sits in the Highest US Cost Band (${fmtIndexDelta(f.rppAll)} vs Avg)`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name} carries an overall cost index of ${fmtIndex(f.rppAll)} — meaning prices run ${fmtIndexDelta(f.rppAll)} versus the US average. The metro ${rankClause(f)} per BEA Regional Price Parities. ${realIncomeClause(f)}.`,
    `Per BEA RPP ${f.rppYear}, ${name} prices are ${fmtIndexDelta(f.rppAll)} relative to the US baseline (index 100). It ${rankClause(f)}, putting it firmly in the top tier of US metro cost indices.`,
    `${name} reports a ${fmtIndex(f.rppAll)} overall cost index, ${rankClause(f)}. ${realIncomeClause(f)}.`,
  ], 2);

  const context = pickVariant(slug, [
    `${housingClause(f)}; ${rentClause(f)}.`,
    `Top-band metros typically combine concentrated employer demand, geographic constraints, and high-density labor markets. ${housingClause(f)}.`,
    `When a metro clears the 110 cost-index threshold, every spending category — housing, goods, services — sits well above the national reference. ${homeRatioClause(f)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For relocators: assume your dollar buys roughly ${fmtPct(1 - 100 / f.rppAll, 0)} less here than at the national average. A $5,000/mo budget elsewhere needs about ${fmtUSD(Math.round(5000 * f.rppAll / 100))}/mo to hit the same standard of living.`,
    `For employers benchmarking pay: ${name} routinely demands a 10–25% cost-of-living premium on offers — a ${fmtUSD(80000)} package at national median translates to roughly ${fmtUSD(Math.round(80000 * f.rppAll / 100))} here for purchasing-power parity.`,
    `For long-term planning: cost premiums at this level rarely shrink fast, but real wages in the metro often compensate. ${realIncomeClause(f)}.`,
  ], 4);

  return { headline, fact, context, implication, status: 'cost_extreme_high' };
}

function build_rent_burden_heavy(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;
  const rentPct = f.rentBurdenPct ?? 0;
  const rent = f.acs?.median_rent ?? 0;
  const income = f.acs?.median_income ?? 0;

  const headline = pickVariant(slug, [
    `${name}: Rent Burden at ${rentPct.toFixed(0)}% of Income`,
    `Renters in ${name} Spend ${rentPct.toFixed(0)}% on Housing`,
    `${name}'s Rent-to-Income Ratio Is Among the US's Highest`,
  ], 1);

  const fact = pickVariant(slug, [
    `Median rent in ${name} runs ${fmtUSD(rent)}/month against a median household income of ${fmtUSD(income)} — a ${rentPct.toFixed(1)}% rent-to-income share. That's above the 30% HUD-affordability rule of thumb only for top earners; the median renter here is approaching that line. ${rankClause(f)} on overall cost.`,
    `Per ACS data, ${name} rents take ${rentPct.toFixed(1)}% of median household income (${fmtUSD(rent)}/mo on ${fmtUSD(income)}/yr). Even with the metro's ${fmtIndex(f.rppAll)} overall cost index, rent is the standout strain.`,
    `${name} households spend ${rentPct.toFixed(1)}% of median income on rent at ${fmtUSD(rent)}/mo — high enough that many renters here exceed the 30% HUD threshold once utilities and other shelter costs are included.`,
  ], 2);

  const context = pickVariant(slug, [
    `${housingClause(f)}. ${realIncomeClause(f)}.`,
    `Heavy rent burden often reflects supply constraints (limited new construction), tourism/seasonal demand, or metros where the renter share is large relative to owners. ${homeRatioClause(f)}.`,
    `When rent pushes past 25% of income at the metro median, the bottom half of renters typically sees 35%+ rent burden — a structural affordability issue rather than a market timing one.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For prospective renters: budget for the upper end of advertised rents — the median already implies a tight ratio. Suburban or roommate options typically reclaim 15–25% on rent.`,
    `For homebuyers: ${homeRatioClause(f) || 'home-value data needed for ratio context'}. Buying often outperforms renting here on a 7+ year horizon, given the rent burden trajectory.`,
    `For relocators: factor rent burden into the cost-of-living comparison separately from RPP — the headline cost index can underweight how much rent specifically dominates household budgets in ${name}.`,
  ], 4);

  return { headline, fact, context, implication, status: 'rent_burden_heavy' };
}

function build_housing_heavy(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;
  const gap = f.housingGap ?? 0;

  const headline = pickVariant(slug, [
    `${name}: Housing Drives the Cost Profile (Index ${fmtIndex(f.rppHousing)})`,
    `Shelter Is the Main Expense Lever in ${name}`,
    `${name} Has a ${gap.toFixed(0)}-Point Housing Premium Over Overall Cost`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name}'s housing index sits at ${fmtIndex(f.rppHousing)} versus an overall cost index of ${fmtIndex(f.rppAll)} — a ${gap.toFixed(0)}-point housing premium. ${rankClause(f)}. Goods and services run closer to the national reference, but shelter does the cost-lifting here.`,
    `Per BEA RPP ${f.rppYear}, housing in ${name} is ${gap.toFixed(0)} index points above the overall metro average. The split tells a clear story: groceries and services are reasonable, but the cost of a roof is a meaningful premium.`,
    `${name} shows a heavy housing skew in its cost decomposition: housing index ${fmtIndex(f.rppHousing)}, overall ${fmtIndex(f.rppAll)}. The ${gap.toFixed(0)}-point gap means most of the metro's cost premium comes from one category.`,
  ], 2);

  const context = pickVariant(slug, [
    `Housing-heavy cost profiles typically appear in supply-constrained metros — coastal cities, geographically bounded areas (mountains, water), or markets with restrictive zoning. ${homeRatioClause(f)}.`,
    `${rentClause(f)}. ${trendClause(f)}.`,
    `When housing pulls a 15+ point premium over overall costs, dual-earner households and suburb-to-urban-core commutes become much more common as housing-cost workarounds.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For renters: prioritize housing search above all other cost categories — budget tradeoffs are most leverage-able on rent. Other line items track the national baseline more closely.`,
    `For homebuyers: ${homeRatioClause(f) || 'price-to-income context unavailable'}. Building equity in ${name} is the long-term offset to the housing premium, especially relative to renting.`,
    `For relocators from elsewhere: don't extrapolate rent costs from your previous metro — ${name}'s housing premium can swing the cost-of-living comparison by 15–30% on its own.`,
  ], 4);

  return { headline, fact, context, implication, status: 'housing_heavy' };
}

function build_hidden_gem(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;

  const headline = pickVariant(slug, [
    `${name}: A Hidden Value Metro (Cost ${fmtIndex(f.rppAll)}, Real Income ${fmtUSDCompact(f.realIncome ?? 0)})`,
    `Low Cost, Strong Real Wages — Why ${name} Stands Out`,
    `${name} Combines Below-Average Costs With Above-Average Real Income`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name} carries an overall cost index of ${fmtIndex(f.rppAll)} (${fmtIndexDelta(f.rppAll)} versus the US average) while reporting a median household income of ${fmtUSD(f.acs?.median_income ?? 0)}. After adjusting for local prices, real income works out to ${fmtUSD(f.realIncome ?? 0)} — well above the ${fmtUSD(US_MEDIAN_INCOME)} US median. ${rankClause(f)}.`,
    `Per BEA RPP ${f.rppYear}, ${name} is among the metros where below-average costs meet decent wages. Cost index ${fmtIndex(f.rppAll)}, nominal income ${fmtUSD(f.acs?.median_income ?? 0)}, real (cost-adjusted) income ${fmtUSD(f.realIncome ?? 0)}.`,
    `${name} ranks ${ordinalSuffix(f.rppRank)} of ${f.rppTotal} on cost — and ${f.realIncome ? fmtUSD(f.realIncome) : 'unmeasured'} on real purchasing power, which lands above the US median. The combination is rarer than either signal alone.`,
  ], 2);

  const context = pickVariant(slug, [
    `Hidden-value metros typically share traits: small-to-mid population, anchor industries paying mid-to-upper wages (manufacturing, healthcare, energy, ag), and low housing supply pressure. ${housingClause(f)}.`,
    `${rentClause(f)}. ${homeRatioClause(f)}.`,
    `When a metro combines below-100 cost index with above-median real income, it's effectively a "high standard of living per dollar" location — an unusual combination given that high-pay industries usually cluster in expensive metros.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For relocators chasing standard of living per dollar: this is the quadrant to look at. The cost discount compounds with strong real wages — a $${Math.round((f.acs?.median_income ?? 60000) / 1000)}K nominal salary here often outpaces a higher nominal wage in a top-tier coastal metro net of rent and taxes.`,
    `For remote workers: bringing a coastal salary to ${name} delivers exceptional cost arbitrage. Real purchasing power can multiply by 1.3×–1.6× depending on the wage and home/rent decisions.`,
    `For long-term planning: hidden-value status tends to attract migration over time, which can erode the cost advantage. ${trendClause(f)}.`,
  ], 4);

  return { headline, fact, context, implication, status: 'hidden_gem' };
}

function build_income_compensated(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;

  const headline = pickVariant(slug, [
    `${name}: Expensive but Wages Keep Up (Real Income ${fmtUSDCompact(f.realIncome ?? 0)})`,
    `Higher Cost, Higher Pay — ${name}'s Trade-Off`,
    `${name} Pairs ${fmtIndexDelta(f.rppAll)} Costs With Strong Real Wages`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name}'s overall cost index is ${fmtIndex(f.rppAll)} (${fmtIndexDelta(f.rppAll)} vs US average) but median household income is ${fmtUSD(f.acs?.median_income ?? 0)} — high enough that real (cost-adjusted) income reaches ${fmtUSD(f.realIncome ?? 0)}, comfortably above the ${fmtUSD(US_MEDIAN_INCOME)} US median. ${rankClause(f)}.`,
    `Per BEA RPP ${f.rppYear} and ACS data, ${name} sits in the income-compensated quadrant: prices run ${fmtIndexDelta(f.rppAll)} above the US baseline, but wages run higher still. Nominal median income ${fmtUSD(f.acs?.median_income ?? 0)}, real income ${fmtUSD(f.realIncome ?? 0)}.`,
    `${name} is one of the metros where the cost-of-living premium is real, but the wage premium is bigger. Cost ${fmtIndex(f.rppAll)}, real income ${fmtUSD(f.realIncome ?? 0)} — meaningfully above national.`,
  ], 2);

  const context = pickVariant(slug, [
    `Income-compensated metros typically host high-pay industries — tech, finance, government, healthcare specialists — that pull wages up faster than the cost premium pulls expenses up. ${housingClause(f)}.`,
    `${rentClause(f)}. ${homeRatioClause(f)}.`,
    `When real income clears the national median in an above-cost metro, it usually means a concentration of high-skill or credentialed labor. The cost premium is the price of access to that labor market.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For job seekers: don't read the cost index in isolation — pair it with the income figure. ${name} is more affordable for high-earners than the headline cost suggests, and less affordable for entry-tier workers than even the cost index implies.`,
    `For remote workers paid at lower-cost-of-living rates: the calculus inverts here — the same nominal salary delivers significantly worse real purchasing power than in a hidden-gem metro.`,
    `For employers: pay benchmarks here should match local market norms, not be discounted toward the national median. The competitive offer in ${name} is calibrated to local wage levels, not BLS averages.`,
  ], 4);

  return { headline, fact, context, implication, status: 'income_compensated' };
}

function build_fast_riser(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;
  const delta = f.fiveYearDelta ?? 0;
  const startYear = f.fiveYearStartYear ?? f.rppYear - 4;

  const headline = pickVariant(slug, [
    `${name}: Cost Up ${delta.toFixed(1)} Points Since ${startYear}`,
    `Among the Fastest-Rising US Cost Indices — ${name}`,
    `${name}'s Cost of Living Climbed ${delta.toFixed(1)} Points Over ${f.rppYear - startYear} Years`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name}'s overall BEA cost index has climbed from ${fmtIndex(f.rppAll - delta)} in ${startYear} to ${fmtIndex(f.rppAll)} in ${f.rppYear} — a ${delta.toFixed(1)}-point gain over ${f.rppYear - startYear} years. That puts the metro among the fastest-rising cost trajectories in the BEA dataset. ${rankClause(f)} today.`,
    `Per BEA RPP, ${name} has moved up ${delta.toFixed(1)} index points since ${startYear} (from ${fmtIndex(f.rppAll - delta)} to ${fmtIndex(f.rppAll)}). Most US metros over the same period saw smaller shifts.`,
    `Among the 387 BEA-tracked US metros, ${name} is one of the standout cost-risers: ${delta.toFixed(1)}-point gain since ${startYear}, ending at a ${fmtIndex(f.rppAll)} overall cost index in ${f.rppYear}.`,
  ], 2);

  const context = pickVariant(slug, [
    `Fast-rising metros typically combine strong in-migration, housing supply lag, and either a tourism boom or anchor-employer expansion. ${housingClause(f)}.`,
    `${rentClause(f)}. ${realIncomeClause(f)}.`,
    `A 4+ point swing in five years is meaningful — most US metros drift within ±2 points over that span. ${name}'s rise is closer to a step-change than a normal trend.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For prospective movers: budgeting from older cost data understates current expenses. Use ${f.rppYear} BEA figures, not figures from before the run-up.`,
    `For long-term residents: rapid cost gains often outpace wage growth — track real (cost-adjusted) income locally to gauge whether the standard of living is keeping up.`,
    `For real estate decisions: fast-rising cost indices typically trail home-price increases that began earlier. Buying near the start of a rise has historically outperformed renting in similar metros.`,
  ], 4);

  return { headline, fact, context, implication, status: 'fast_riser' };
}

function build_fast_decliner(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;
  const delta = f.fiveYearDelta ?? 0;
  const absDelta = Math.abs(delta);
  const startYear = f.fiveYearStartYear ?? f.rppYear - 4;

  const headline = pickVariant(slug, [
    `${name}: Cost Down ${absDelta.toFixed(1)} Points Since ${startYear}`,
    `Among the Fastest-Easing US Cost Indices — ${name}`,
    `${name}'s Cost of Living Has Eased ${absDelta.toFixed(1)} Points Over ${f.rppYear - startYear} Years`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name}'s overall BEA cost index has eased from ${fmtIndex(f.rppAll - delta)} in ${startYear} to ${fmtIndex(f.rppAll)} in ${f.rppYear} — a ${absDelta.toFixed(1)}-point drop over ${f.rppYear - startYear} years. That's among the more pronounced cost easings in the BEA dataset. ${rankClause(f)} today.`,
    `Per BEA RPP, ${name} has fallen ${absDelta.toFixed(1)} index points since ${startYear} (from ${fmtIndex(f.rppAll - delta)} down to ${fmtIndex(f.rppAll)}) — a relative-affordability shift versus other US metros.`,
    `Among 387 US metros, ${name} stands out as a cost-decliner: −${absDelta.toFixed(1)} index points since ${startYear}, ending at ${fmtIndex(f.rppAll)} in ${f.rppYear}. Most metros saw flat-to-rising indices over the same span.`,
  ], 2);

  const context = pickVariant(slug, [
    `Fast-easing metros often reflect mean-reversion after an earlier boom, slowing in-migration, or industry-specific weakness that pulled wages down (which feeds back into RPP). ${housingClause(f)}.`,
    `${rentClause(f)}. ${realIncomeClause(f)}.`,
    `RPP measures relative-to-other-metros cost — so a falling RPP doesn't necessarily mean falling absolute prices. It can mean other metros rose faster, leaving ${name} comparatively cheaper.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For relocators: ${name} has become more affordable relative to peer metros. The trend is worth understanding before assuming current wages and rents will hold.`,
    `For long-term residents: a falling cost index relative to peers can mean either improved affordability (good) or weakening labor market (concerning). Pair the trend with real-income data to read the signal.`,
    `For investors: cost-easing metros sometimes precede population outflows or industry shifts. Worth pairing with employment trends and demographic data for a complete picture.`,
  ], 4);

  return { headline, fact, context, implication, status: 'fast_decliner' };
}

function build_cost_extreme_low(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;

  const headline = pickVariant(slug, [
    `${name}: One of the Most Affordable US Metros (Cost Index ${fmtIndex(f.rppAll)})`,
    `Bottom-Quartile Cost of Living in ${name}`,
    `${name} Sits in the Lowest-Cost Band of US Metros`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name} carries an overall cost index of ${fmtIndex(f.rppAll)} — meaning prices run ${fmtIndexDelta(f.rppAll)} versus the US average. The metro ${rankClause(f)} per BEA Regional Price Parities. ${realIncomeClause(f)}.`,
    `Per BEA RPP ${f.rppYear}, ${name} is one of the cheapest US metros to live in: ${fmtIndex(f.rppAll)} cost index, ${fmtIndexDelta(f.rppAll)} versus the national reference. ${rankClause(f)}.`,
    `${name} reports a ${fmtIndex(f.rppAll)} overall cost index, ${rankClause(f)} — placing it well into the bottom band of US metro cost levels.`,
  ], 2);

  const context = pickVariant(slug, [
    `${housingClause(f)}; ${rentClause(f)}.`,
    `Bottom-band metros typically combine ample housing supply, lower-density labor markets, and pricing structures that haven't pulled toward coastal or large-metro peer levels. ${homeRatioClause(f)}.`,
    `${realIncomeClause(f)}. ${trendClause(f)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For relocators: assume your dollar buys roughly ${fmtPct(100 / f.rppAll - 1, 0)} more here than at the national average. A $5,000/mo budget elsewhere stretches to about ${fmtUSD(Math.round(5000 * f.rppAll / 100))}/mo equivalent here.`,
    `For remote workers: bringing a salary indexed to a higher-cost metro compounds the cost discount substantially. Real purchasing power often improves 15–25% on the move.`,
    `For long-term planning: low-cost metros are sometimes catch-up candidates for cost growth (mean-reversion), but many remain affordable for decades when industry mix doesn't shift. ${trendClause(f)}.`,
  ], 4);

  return { headline, fact, context, implication, status: 'cost_extreme_low' };
}

function build_average_metro(f: CityFacts): CityCommentary {
  const slug = f.metro.slug;
  const name = f.metro.short_name;

  const headline = pickVariant(slug, [
    `${name}: Cost of Living Near the US Average (Index ${fmtIndex(f.rppAll)})`,
    `${name}'s Cost Profile Tracks the National Reference Closely`,
    `${name} Sits Within ±5 Points of the US Cost Index`,
  ], 1);

  const fact = pickVariant(slug, [
    `${name} carries a ${fmtIndex(f.rppAll)} overall cost index — close to the US baseline of 100 (${fmtIndexDelta(f.rppAll)} versus average). ${rankClause(f)} per BEA Regional Price Parities. ${realIncomeClause(f)}.`,
    `Per BEA RPP ${f.rppYear}, ${name} is a reasonable national-average reference metro — overall cost index ${fmtIndex(f.rppAll)}, deviation ${fmtIndexDelta(f.rppAll)}. ${rankClause(f)}.`,
    `${name}'s ${fmtIndex(f.rppAll)} cost index puts it in the central band of US metros — ${fmtIndexDelta(f.rppAll)} versus the national reference. ${realIncomeClause(f)}.`,
  ], 2);

  const context = pickVariant(slug, [
    `${housingClause(f)}; ${rentClause(f)}.`,
    `Average-cost metros tend to reflect balanced supply-demand fundamentals — neither severely supply-constrained nor in active out-migration. ${homeRatioClause(f)}.`,
    `When all RPP categories sit close to 100, metro pricing is broadly representative of US conditions overall — useful as a comparison baseline rather than a standout cost story. ${trendClause(f)}.`,
  ], 3);

  const implication = pickVariant(slug, [
    `For relocators: ${name} works well as a financial-modeling baseline — your existing-metro budget translates directly without major adjustment.`,
    `For employers: pay benchmarks here track national norms closely. Cost-of-living adjustments versus national figures are typically small (±5%).`,
    `For long-term planning: average-cost metros are stable in cost-of-living terms but tend not to deliver outsized real-income gains. The cost discount or premium isn't doing meaningful work either way.`,
  ], 4);

  return { headline, fact, context, implication, status: 'average_metro' };
}

// ──────────────────────────────────────────────────────────────────
// Public dispatch
// ──────────────────────────────────────────────────────────────────

export function getCityCommentary(facts: CityFacts): CityCommentary {
  switch (facts.status) {
    case 'cost_extreme_high':   return build_cost_extreme_high(facts);
    case 'rent_burden_heavy':   return build_rent_burden_heavy(facts);
    case 'housing_heavy':       return build_housing_heavy(facts);
    case 'hidden_gem':          return build_hidden_gem(facts);
    case 'income_compensated':  return build_income_compensated(facts);
    case 'fast_riser':          return build_fast_riser(facts);
    case 'fast_decliner':       return build_fast_decliner(facts);
    case 'cost_extreme_low':    return build_cost_extreme_low(facts);
    case 'average_metro':       return build_average_metro(facts);
  }
}

// ──────────────────────────────────────────────────────────────────
// Title rewrite — diversifies <title> across status groups so the corpus
// reads as N variants instead of "{City} Cost of Living {Year}" template.
// ──────────────────────────────────────────────────────────────────

export function getCityTitle(facts: CityFacts): string {
  const slug = facts.metro.slug;
  const name = facts.metro.short_name;

  switch (facts.status) {
    case 'cost_extreme_high':
      return pickVariant(slug, [
        `${name} Cost of Living: ${fmtIndex(facts.rppAll)} Index, ${fmtIndexDelta(facts.rppAll)} vs US`,
        `Living in ${name} — Top-Tier US Cost Profile`,
        `${name} Cost of Living Profile (${fmtIndex(facts.rppAll)} BEA Cost Index)`,
      ], 5);
    case 'rent_burden_heavy':
      return pickVariant(slug, [
        `${name} Cost of Living: Rent Burden ${facts.rentBurdenPct?.toFixed(0) ?? '—'}% of Income`,
        `Living in ${name} — Renter-Heavy Cost Profile`,
        `${name} Cost Snapshot — Rent and Real Income`,
      ], 5);
    case 'housing_heavy':
      return pickVariant(slug, [
        `${name} Cost of Living — Housing Index ${fmtIndex(facts.rppHousing)}`,
        `Living in ${name}: Housing-Driven Cost Profile`,
        `${name} Cost Breakdown — Housing vs Goods vs Services`,
      ], 5);
    case 'hidden_gem':
      return pickVariant(slug, [
        `${name} Cost of Living: Real Income ${fmtUSDCompact(facts.realIncome ?? 0)}`,
        `Living in ${name} — Hidden-Value Cost Profile`,
        `${name} Cost Snapshot: ${fmtIndex(facts.rppAll)} Index, Real Income ${fmtUSDCompact(facts.realIncome ?? 0)}`,
      ], 5);
    case 'income_compensated':
      return pickVariant(slug, [
        `${name} Cost of Living — ${fmtIndex(facts.rppAll)} Index, Real Income ${fmtUSDCompact(facts.realIncome ?? 0)}`,
        `Living in ${name}: Higher Cost, Higher Pay`,
        `${name} Cost vs Income Snapshot — BEA RPP Data`,
      ], 5);
    case 'fast_riser':
      return pickVariant(slug, [
        `${name} Cost of Living: ${facts.fiveYearDelta?.toFixed(1) ?? '—'}-Point Climb Since ${facts.fiveYearStartYear ?? '—'}`,
        `Living in ${name} — Fast-Rising Cost Profile`,
        `${name} Cost Snapshot — 5-Year RPP Trend`,
      ], 5);
    case 'fast_decliner':
      return pickVariant(slug, [
        `${name} Cost of Living: ${Math.abs(facts.fiveYearDelta ?? 0).toFixed(1)}-Point Drop Since ${facts.fiveYearStartYear ?? '—'}`,
        `Living in ${name} — Easing Cost Profile`,
        `${name} Cost Snapshot — 5-Year RPP Decline`,
      ], 5);
    case 'cost_extreme_low':
      return pickVariant(slug, [
        `${name} Cost of Living: ${fmtIndex(facts.rppAll)} Index (${fmtIndexDelta(facts.rppAll)} vs US)`,
        `Living in ${name} — Low-Cost US Metro`,
        `${name} Cost of Living Snapshot — Affordable US Metro`,
      ], 5);
    case 'average_metro':
    default:
      return pickVariant(slug, [
        `${name} Cost of Living — BEA RPP ${facts.rppYear} Data`,
        `Living in ${name}: ${fmtIndex(facts.rppAll)} Cost Index Profile`,
        `${name} Cost of Living Snapshot — National-Average Reference`,
      ], 5);
  }
}

export function getCityDescription(facts: CityFacts): string {
  const slug = facts.metro.slug;
  const name = facts.metro.short_name;
  const idx = fmtIndex(facts.rppAll);

  return pickVariant(slug, [
    `${name} cost of living index is ${idx} per BEA RPP ${facts.rppYear} (${fmtIndexDelta(facts.rppAll)} vs US average). View housing, goods, utilities breakdown plus real income and rent burden.`,
    `BEA data shows ${name}'s overall cost index at ${idx} (${fmtIndexDelta(facts.rppAll)} vs the US baseline). Browse the housing/goods/services split, real income context, and 5-year cost trend.`,
    `${name} cost of living snapshot: ${idx} BEA cost index, real income ${facts.realIncome ? fmtUSD(facts.realIncome) : 'data unavailable'}, ${facts.rentBurdenPct ? facts.rentBurdenPct.toFixed(0) + '% rent burden' : 'rent data unavailable'}. Compare against US peers.`,
    `Cost of living in ${name}: ${idx} BEA index per ${facts.rppYear} data, ${facts.fiveYearDelta != null ? `${facts.fiveYearDelta > 0 ? '+' : ''}${facts.fiveYearDelta.toFixed(1)} pts since ${facts.fiveYearStartYear}` : 'trend data unavailable'}. Housing, goods, utilities breakdown included.`,
  ], 6);
}

// ──────────────────────────────────────────────────────────────────
// State cluster narrative — for /state/[slug]/ Layer 2.
// ──────────────────────────────────────────────────────────────────

export interface StateNarrative {
  headline: string;
  fact: string;
  context: string;
  implication: string;
}

export function getStateNarrative(stateCode: string, stateName: string, facts: StateFacts): StateNarrative {
  const headline = pickVariant(stateCode, [
    `Cost of Living in ${stateName} — ${facts.cityCount} Metros at a Glance`,
    `${stateName} Cost Profile: ${facts.cityCount} BEA-Tracked Metros`,
    `${stateName} Cost of Living Snapshot (${fmtIndexDelta(facts.avgRPP)} vs US Avg)`,
  ], 1);

  const fact = pickVariant(stateCode, [
    `${stateName} hosts ${facts.cityCount} BEA-tracked metros with an average cost index of ${fmtIndex(facts.avgRPP)} (${fmtIndexDelta(facts.avgRPP)} vs the US baseline). The most expensive metro is ${facts.topCity?.short_name ?? '—'} (${fmtIndex(facts.topCity?.rpp_all ?? 0)}); the cheapest is ${facts.bottomCity?.short_name ?? '—'} (${fmtIndex(facts.bottomCity?.rpp_all ?? 0)}). Within-state spread: ${facts.rppSpread.toFixed(1)} points.`,
    `Per BEA RPP, ${stateName}'s ${facts.cityCount} metros average ${fmtIndex(facts.avgRPP)} on the cost index — ranking ${ordinalSuffix(facts.stateRankByAvg)} of ${facts.stateTotal} states by average metro cost. The state's cost spread runs from ${fmtIndex(facts.bottomCity?.rpp_all ?? 0)} (${facts.bottomCity?.short_name}) to ${fmtIndex(facts.topCity?.rpp_all ?? 0)} (${facts.topCity?.short_name}).`,
    `${stateName} reports ${facts.cityCount} metros in the BEA RPP dataset. Average cost index across those metros is ${fmtIndex(facts.avgRPP)}; the in-state range is ${facts.rppSpread.toFixed(1)} index points. ${facts.expensiveCount} metros sit above 105, ${facts.affordableCount} sit below 95.`,
  ], 2);

  const context = pickVariant(stateCode, [
    `States with wide metro-cost spreads usually combine one or two large urban centers with a backbone of mid-sized cities. ${stateName}'s ${facts.rppSpread.toFixed(1)}-point spread fits that pattern when the state's largest metros sit notably above the smaller ones.`,
    `An average state cost index of ${fmtIndex(facts.avgRPP)} ${facts.avgRPP >= 100 ? 'puts' : 'leaves'} ${stateName} ${facts.avgRPP >= 100 ? 'above' : 'below'} the national reference. The within-state variance ${facts.rppSpread >= 15 ? 'is wide enough that picking a metro matters as much as picking the state' : 'is narrow enough that the state-average is a reasonable proxy for any individual metro'}.`,
    `Among 51 US states + DC, ${stateName} ranks ${ordinalSuffix(facts.stateRankByAvg)} by average metro cost. ${facts.expensiveCount > facts.affordableCount ? 'More of its metros sit on the expensive side of the US average' : facts.expensiveCount < facts.affordableCount ? 'More of its metros sit on the affordable side of the US average' : 'Its metros split evenly between above- and below-average cost'}.`,
  ], 3);

  const implication = pickVariant(stateCode, [
    `For relocators: ${stateName}'s cost story isn't a single number — pick the metro that fits your budget and proximity needs, since the in-state spread can be ${facts.rppSpread.toFixed(0)}+ index points wide.`,
    `For employers benchmarking pay across the state: location-based pay differentials within ${stateName} can be meaningful, especially between the top and bottom metros (${facts.rppSpread.toFixed(1)}-point spread).`,
    `For long-term planning: state-level averages obscure metro-level signals. The rankings below let you see where each ${stateName} metro lands individually on cost, real income, and rent burden.`,
  ], 4);

  return { headline, fact, context, implication };
}
