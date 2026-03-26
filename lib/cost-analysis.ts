/**
 * Cost of living analysis: affordability insights from BEA RPP data
 */

type RPP = Record<string, number | null>;

interface ACS {
  median_income: number | null;
  median_home_value: number | null;
  median_rent: number | null;
  per_capita_income: number | null;
}

interface HistoryEntry { year: number; value: number }

// National averages
const US_MEDIAN_INCOME = 75149;
const US_MEDIAN_RENT = 1163;
const US_MEDIAN_HOME = 281900;

export interface CostAnalysis {
  summary: string;
  affordabilityVerdict: string;
  highlights: string[];
  concerns: string[];
  budgetTips: string[];
  trendNote: string;
  salaryNeeded: string;
}

function fmtDollar(v: number | null): string {
  if (!v) return "N/A";
  return `$${v.toLocaleString("en-US")}`;
}

export function analyzeCost(
  cityName: string,
  rpp: RPP,
  acs: ACS | null,
  history: HistoryEntry[]
): CostAnalysis {
  const costIdx = (rpp.all as number) || 100;
  const housingIdx = (rpp.housing as number) || 100;
  const goodsIdx = (rpp.goods as number) || 100;
  const income = acs?.median_income || 0;
  const rent = acs?.median_rent || 0;
  const homeVal = acs?.median_home_value || 0;

  // Affordability
  const rentToIncome = income > 0 && rent > 0 ? (rent * 12) / income : 0;
  let affordabilityVerdict = "";
  if (rentToIncome > 0) {
    if (rentToIncome < 0.2) affordabilityVerdict = `${cityName} is very affordable — rent consumes only ${(rentToIncome * 100).toFixed(0)}% of the median household income, well under the 30% rule.`;
    else if (rentToIncome < 0.3) affordabilityVerdict = `${cityName} is reasonably affordable — housing costs take about ${(rentToIncome * 100).toFixed(0)}% of median income, within the recommended 30% threshold.`;
    else if (rentToIncome < 0.4) affordabilityVerdict = `Housing in ${cityName} is somewhat expensive — rent takes up ${(rentToIncome * 100).toFixed(0)}% of median income, above the recommended 30% limit.`;
    else affordabilityVerdict = `${cityName} has high housing costs — rent consumes ${(rentToIncome * 100).toFixed(0)}% of median income. Budget carefully or look for roommate situations.`;
  }

  // Highlights
  const highlights: string[] = [];
  if (costIdx < 95) highlights.push(`Overall cost of living is ${(100 - costIdx).toFixed(1)}% below the national average`);
  if (housingIdx < 90) highlights.push(`Housing costs are significantly below average (index: ${housingIdx.toFixed(1)})`);
  if (goodsIdx < 95) highlights.push(`Everyday goods are cheaper than most US cities`);
  if (income > US_MEDIAN_INCOME * 1.2) highlights.push(`Median income (${fmtDollar(income)}) is above the national average`);
  if (rent > 0 && rent < 900) highlights.push(`Very affordable rent at ${fmtDollar(rent)}/month`);

  // Concerns
  const concerns: string[] = [];
  if (costIdx > 110) concerns.push(`Cost of living is ${(costIdx - 100).toFixed(1)}% above the national average`);
  if (housingIdx > 130) concerns.push(`Housing costs are ${(housingIdx - 100).toFixed(0)}% above average — the biggest expense driver`);
  if (rent > 2000) concerns.push(`Median rent of ${fmtDollar(rent)}/mo is high — consider suburbs or roommates`);
  if (income < US_MEDIAN_INCOME * 0.8 && costIdx > 100) concerns.push(`Income is below average while costs are above — budgeting is important`);

  // Budget tips
  const budgetTips: string[] = [];
  if (housingIdx > 120) {
    budgetTips.push(`Housing is the biggest cost driver here. Look at neighborhoods just outside the city center for 15-30% savings on rent.`);
  }
  if (costIdx < 95) {
    budgetTips.push(`With below-average costs, your dollar goes further here. Consider saving or investing the difference compared to pricier cities.`);
  }
  if (rent > 0 && income > 0) {
    const idealRent = Math.round(income * 0.3 / 12);
    budgetTips.push(`Based on the 30% rule, a household earning the median income should aim for rent under ${fmtDollar(idealRent)}/month. Median rent here is ${fmtDollar(rent)}.`);
  }
  if (rpp.utilities && (rpp.utilities as number) > 105) {
    budgetTips.push(`Utilities are above average — energy-efficient appliances and smart thermostats can help reduce bills.`);
  }

  // Salary needed
  let salaryNeeded = "";
  if (rent > 0) {
    const neededAnnual = Math.round(rent * 12 / 0.3);
    salaryNeeded = `To comfortably afford the median rent of ${fmtDollar(rent)}/mo (using the 30% rule), you would need a household income of at least ${fmtDollar(neededAnnual)} per year.`;
  }

  // Trend
  let trendNote = "";
  if (history.length >= 2) {
    const latest = history[history.length - 1];
    const earliest = history[0];
    const change = latest.value - earliest.value;
    const years = latest.year - earliest.year;
    if (change > 3) {
      trendNote = `The cost of living in ${cityName} has increased by ${change.toFixed(1)} points over the past ${years} years, outpacing many comparable cities.`;
    } else if (change < -1) {
      trendNote = `Costs in ${cityName} have actually decreased by ${Math.abs(change).toFixed(1)} points over the past ${years} years — becoming more affordable.`;
    } else {
      trendNote = `The cost of living in ${cityName} has remained relatively stable over the past ${years} years.`;
    }
  }

  // Summary
  const parts: string[] = [];
  const costLabel = costIdx > 105 ? "above" : costIdx < 95 ? "below" : "near";
  parts.push(`The cost of living in ${cityName} is ${costLabel} the national average with an overall index of ${costIdx.toFixed(1)} (100 = US average).`);
  if (housingIdx > 120 || housingIdx < 80) {
    parts.push(`Housing is the standout factor — ${housingIdx > 120 ? "significantly more expensive" : "much cheaper"} than most US cities.`);
  }
  if (affordabilityVerdict) parts.push(affordabilityVerdict.split('.')[0] + '.');

  return {
    summary: parts.join(" "),
    affordabilityVerdict,
    highlights,
    concerns,
    budgetTips,
    trendNote,
    salaryNeeded,
  };
}
