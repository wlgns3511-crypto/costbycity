import { formatDollar, formatPctDiff, formatIndex } from './format';

export interface FaqItem {
  question: string;
  answer: string;
}

interface RPP {
  all: number | null;
  goods: number | null;
  services_housing: number | null;
  services_other: number | null;
  housing: number | null;
}

interface ACS {
  median_income: number | null;
  median_home_value: number | null;
  median_rent: number | null;
  per_capita_income: number | null;
  population?: number | null;
}

/**
 * Build programmatic FAQ items from cost-of-living + ACS data.
 *
 * 2026-04-23 Phase 2 P1: previously returned []. Empty FAQPage schema
 * meant 385 city pages shipped only 1 FAQ (the trend note). GSC TOP 50
 * impression queries include long-tail like "tuscaloosa median home price"
 * (27 impr), "how much do i need to earn in [city]", etc. — all of which
 * have deterministic answers derivable from BEA RPP + Census ACS.
 *
 * Design constraints:
 * - Only use available data — skip a Q&A if the backing field is null.
 * - No fabrication: every number/claim traces to a cited source.
 * - Human-readable phrasing (not templated "slot filling" feel).
 * - Variety of query intents: index, rent, home price, salary needed,
 *   affordability, income, state context.
 */
export function generateAutoFaqs(
  cityName: string,
  rpp: RPP,
  acs: ACS | null,
  year: string | number,
): FaqItem[] {
  const faqs: FaqItem[] = [];
  const rppAll = rpp.all ?? 100;
  const diff = Math.abs(rppAll - 100);
  const diffDir = rppAll > 100 ? 'higher' : 'lower';
  const cheaperOrPricier = rppAll > 100 ? 'more expensive' : 'more affordable';

  // Q1: Cost of living index (the base fact — always included)
  faqs.push({
    question: `What is the cost of living index in ${cityName}?`,
    answer: `As of ${year}, ${cityName} has a BEA Regional Price Parity (RPP) index of ${formatIndex(rppAll)}, where 100 equals the US national average. That puts ${cityName} ${diff.toFixed(1)}% ${diffDir} than the typical American metro. The index combines housing, goods, and services costs into a single comparable number.`,
  });

  // Q2: Comparison to US average (purchasing power framing)
  if (rppAll !== 100) {
    const factor = 100 / rppAll;
    const usdOnNational = Math.round(80000 * factor);
    faqs.push({
      question: `How does the cost of living in ${cityName} compare to the US average?`,
      answer: `${cityName} is ${diff.toFixed(1)}% ${cheaperOrPricier} than the US average. In practical terms, $80,000 of annual income in ${cityName} gives you about the same purchasing power as ${formatDollar(usdOnNational)} in a metro priced at the national average. BEA publishes these Regional Price Parities annually; ${year} is the most recent release.`,
    });
  }

  // Q3: Median rent (captures "rent in [city]" queries)
  if (acs?.median_rent) {
    const rent = acs.median_rent;
    const rentCategory =
      rent < 900 ? 'notably affordable' :
      rent < 1300 ? 'moderate' :
      rent < 1800 ? 'above average' :
      'high';
    faqs.push({
      question: `What is the median rent in ${cityName}?`,
      answer: `The median gross rent in ${cityName} is ${formatDollar(rent)} per month, per the most recent Census ACS 5-year estimates. That's ${rentCategory} compared to the US median of about $1,163/mo. Rent covers contract rent plus utilities that the landlord includes (water, heat, electricity if any).`,
    });
  }

  // Q4: Median home price (semantic alias for "home value" — captures
  // Topeka/Savannah-style "median home price" queries, 48 GSC impr/mo)
  if (acs?.median_home_value) {
    const home = acs.median_home_value;
    const priceCategory =
      home < 180_000 ? 'well below the national median' :
      home < 280_000 ? 'close to the national median' :
      home < 450_000 ? 'above the national median' :
      'well above the national median';
    faqs.push({
      question: `What is the median home price in ${cityName}?`,
      answer: `The median home value in ${cityName} is ${formatDollar(home)}, per Census ACS owner-occupied housing data. That is ${priceCategory} of about $281,900. "Median home value" is the Census term — in common usage it's the same thing as the median home price for the metro.`,
    });
  }

  // Q5: Salary needed (30% rent-to-income rule)
  if (acs?.median_rent) {
    const needed = Math.round((acs.median_rent * 12) / 0.3);
    faqs.push({
      question: `How much do I need to earn to live in ${cityName}?`,
      answer: `To afford the median rent of ${formatDollar(acs.median_rent)}/month in ${cityName} using the 30% affordability rule, you would need a gross household income of at least ${formatDollar(needed)} per year. If you plan to buy rather than rent, your required income is usually higher — lenders typically cap total housing costs at 28% of gross income.`,
    });
  }

  // Q6: Affordability (uses rent-burden framing from cost-analysis)
  if (acs?.median_rent && acs?.median_income) {
    const burden = ((acs.median_rent * 12) / acs.median_income) * 100;
    const verdict =
      burden < 20 ? `very affordable for the typical resident — rent takes only ${burden.toFixed(0)}% of the median household income` :
      burden < 30 ? `reasonably affordable — rent is about ${burden.toFixed(0)}% of median household income, under the 30% rule` :
      burden < 40 ? `somewhat expensive — rent at ${burden.toFixed(0)}% of median income exceeds the 30% affordability threshold` :
      `expensive relative to local incomes — rent takes ${burden.toFixed(0)}% of median income, well above the 30% rule`;
    faqs.push({
      question: `Is ${cityName} affordable?`,
      answer: `${cityName} is ${verdict}. Affordability depends heavily on your own income, household size, and whether you rent or own. The numbers here use Census ACS median rent and median household income; higher earners will find the area more manageable, lower earners may be cost-burdened.`,
    });
  }

  // Q7: Median household income
  if (acs?.median_income) {
    const inc = acs.median_income;
    const usInc = 75149;
    const vsUs = ((inc - usInc) / usInc) * 100;
    const vsUsLabel =
      Math.abs(vsUs) < 5 ? 'close to the US median' :
      vsUs > 0 ? `${vsUs.toFixed(0)}% above the US median` :
      `${Math.abs(vsUs).toFixed(0)}% below the US median`;
    const adjusted = Math.round((inc * 100) / rppAll);
    faqs.push({
      question: `What is the median household income in ${cityName}?`,
      answer: `Median household income in ${cityName} is ${formatDollar(inc)} per year (Census ACS), ${vsUsLabel} of $75,149. Adjusted for local prices using the cost index of ${formatIndex(rppAll)}, that income has the real purchasing power of about ${formatDollar(adjusted)} in an average-cost US metro.`,
    });
  }

  // Q8: Housing vs. non-housing (explains where the gap comes from)
  if (rpp.housing && rpp.all) {
    const housingGap = rpp.housing - rpp.all;
    if (Math.abs(housingGap) > 5) {
      const driver = housingGap > 0
        ? `Housing is the main driver of higher costs in ${cityName} — the housing index (${formatIndex(rpp.housing)}) runs ${Math.abs(housingGap).toFixed(0)} points above the overall index (${formatIndex(rpp.all)}). Everyday goods and services are comparatively closer to the national average.`
        : `Housing is notably cheaper than the rest of the cost basket in ${cityName} — the housing index (${formatIndex(rpp.housing)}) is ${Math.abs(housingGap).toFixed(0)} points below the overall index (${formatIndex(rpp.all)}). Non-housing expenses carry more weight in the total picture.`;
      faqs.push({
        question: `What drives the cost of living in ${cityName}?`,
        answer: driver,
      });
    }
  }

  return faqs;
}
