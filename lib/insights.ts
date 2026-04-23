interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface RPP {
  all: number | null;
  housing: number | null;
  goods: number | null;
  services: number | null;
}

interface ACS {
  median_income: number | null;
  median_home_value: number | null;
  median_rent: number | null;
  per_capita_income: number | null;
}

/**
 * Generate cost-of-living insights for a metro area.
 * RPP index: 100 = national average, >100 = more expensive.
 */
export function getCostInsights(
  cityName: string,
  rpp: RPP,
  acs: ACS | null,
): Insight[] {
  const insights: Insight[] = [];
  const rppAll = rpp.all ?? 100;

  // 1. Overall cost index vs national average
  const diff = Math.abs(rppAll - 100).toFixed(1);
  if (rppAll > 105) {
    insights.push({
      text: `${cityName} is ${diff}% more expensive than the US average. A household spending $5,000/month nationally would need about $${((5000 * rppAll) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month here for the same standard of living.`,
      sentiment: "negative",
    });
  } else if (rppAll < 95) {
    insights.push({
      text: `${cityName} is ${diff}% cheaper than the US average. Your dollar stretches further here — $80,000 of income buys roughly the same as $${Math.round((80000 * 100) / rppAll).toLocaleString()} in an average-cost metro.`,
      sentiment: "positive",
    });
  } else {
    insights.push({
      text: `${cityName}'s cost of living (index ${rppAll.toFixed(1)}) is within 5% of the US average, meaning day-to-day expenses are comparable to most American metros.`,
      sentiment: "neutral",
    });
  }

  // 2. Housing vs overall
  if (rpp.housing) {
    const housingDiff = rpp.housing - rppAll;
    if (Math.abs(housingDiff) > 10) {
      const direction = housingDiff > 0 ? "higher" : "lower";
      insights.push({
        text: `Housing costs (index ${rpp.housing.toFixed(1)}) run ${Math.abs(housingDiff).toFixed(0)} points ${direction} than the overall index. ${housingDiff > 0 ? "Housing is the primary driver of high costs here — groceries and services may still be reasonable." : "Non-housing expenses contribute more to the cost picture than shelter does."}`,
        sentiment: housingDiff > 15 ? "negative" : housingDiff < -15 ? "positive" : "neutral",
      });
    }
  }

  // 3. Median income vs cost
  if (acs?.median_income) {
    const adjustedIncome = Math.round((acs.median_income * 100) / rppAll);
    const natMedianIncome = 75149; // Census ACS 2023 national median
    const sentiment: Insight["sentiment"] =
      adjustedIncome >= natMedianIncome ? "positive" : "negative";
    insights.push({
      text: `The median household income of $${acs.median_income.toLocaleString()} adjusts to about $${adjustedIncome.toLocaleString()} in purchasing power. ${adjustedIncome >= natMedianIncome ? "Residents here have above-average real buying power." : "Despite the nominal figure, local prices erode some purchasing power."}`,
      sentiment,
    });
  }

  // 4. Rent affordability
  if (acs?.median_rent && acs?.median_income) {
    const annualRent = acs.median_rent * 12;
    const rentBurden = ((annualRent / acs.median_income) * 100).toFixed(1);
    const isBurdened = Number(rentBurden) >= 30;
    insights.push({
      text: `At a median rent of $${acs.median_rent.toLocaleString()}/mo, renters spend about ${rentBurden}% of the median income on housing. ${isBurdened ? "This exceeds the 30% affordability threshold — many renters here are cost-burdened." : "This falls within the 30% affordability guideline recommended by HUD."}`,
      sentiment: isBurdened ? "negative" : "positive",
    });
  }

  // 5. Home value context
  if (acs?.median_home_value && acs?.median_income) {
    const ratio = (acs.median_home_value / acs.median_income).toFixed(1);
    const sentiment: Insight["sentiment"] =
      Number(ratio) > 5 ? "negative" : Number(ratio) < 3 ? "positive" : "neutral";
    insights.push({
      text: `The median home value is ${Number(ratio)}x the median household income (price-to-income ratio). ${Number(ratio) > 5 ? "A ratio above 5x typically signals a market where homeownership is a stretch without dual incomes or significant savings." : Number(ratio) < 3 ? "This ratio suggests homeownership is relatively attainable for median earners." : "This is near the national norm, where homes are accessible but not cheap."}`,
      sentiment,
    });
  }

  return insights;
}
