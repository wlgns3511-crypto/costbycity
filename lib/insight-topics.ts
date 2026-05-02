/**
 * insight-topics.ts — costbycity HCU 5-chunk patch (2026-04-29).
 *
 * Layer 3: cross-cutting insight collection profiles for /insights/[topic]/.
 *
 * Each topic profile bundles:
 *   • slug + title + meta
 *   • Intro narrative (the "why this matters" hook)
 *   • One or two ranked tables — usually paired (e.g. heaviest housing premium
 *     vs lightest), so each page reads as a complete analysis rather than a
 *     one-sided list.
 *   • Outro implication (decision use)
 *
 * Pattern source: salarybycity lib/salary-cluster-insights.ts (list profiles)
 * → adapted to BEA RPP cost domain, with paired ranking tables.
 */

import { getDb } from './db';
import { pickVariant, fmtUSD, fmtIndex, ordinalSuffix } from './content-helpers';
import type { RankingRow } from './cost-facts';
import {
  rankHiddenGems, rankRentBurden, rankFastestRising, rankFastestFalling,
  rankHousingHeavy, rankIncomeLeaders, rankValueLeaders, rankCheapestUtilities,
} from './cost-facts';
import { getMostExpensiveCities, getCheapestCities } from './db';

// ──────────────────────────────────────────────────────────────────
// Topic catalog
// ──────────────────────────────────────────────────────────────────

export type InsightTopic =
  | 'housing-vs-goods'
  | 'rent-burden'
  | 'hidden-gems'
  | 'fastest-changing'
  | 'dollar-stretch'
  | 'real-wages';

export interface InsightTable {
  heading: string;
  caption: string;
  primaryLabel: string;          // column header for primary_value
  secondaryLabel?: string;       // column header for secondary_value
  rows: RankingRow[];
  formatPrimary?: (v: number) => string;
  formatSecondary?: (v: number | null) => string;
}

export interface InsightProfile {
  topic: InsightTopic;
  slug: InsightTopic;
  title: string;
  metaTitle: string;
  metaDescription: string;
  hookHeadline: string;          // big banner H2 right under H1
  hook: string;                  // 2-3 sentence hook narrative
  tables: InsightTable[];
  outro: string;                 // closing narrative paragraph
}

// ──────────────────────────────────────────────────────────────────
// Helpers — reusable formatters per column type
// ──────────────────────────────────────────────────────────────────

const fmtIdx = (v: number) => fmtIndex(v);
const fmtIdxOrNull = (v: number | null) => v == null ? '—' : fmtIndex(v);
const fmtPctVal = (v: number) => `${v.toFixed(1)}%`;
const fmtPtsSigned = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} pts`;
const fmtUsdShort = (v: number) => fmtUSD(v);
const fmtUsdOrNull = (v: number | null) => v == null ? '—' : fmtUSD(v);

// Helper: what the "least housing-heavy" inverse looks like (for pairing)
function rankHousingLight(limit = 30): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(rh.value - ra.value, 1) AS primary_value,
      ra.value AS secondary_value
    FROM metros m
    JOIN rpp ra ON ra.fips=m.fips AND ra.category='all' AND ra.year=(SELECT MAX(year) FROM rpp)
    JOIN rpp rh ON rh.fips=m.fips AND rh.category='housing' AND rh.year=(SELECT MAX(year) FROM rpp)
    ORDER BY (rh.value - ra.value) ASC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

function rankRentEasy(limit = 30): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      ROUND(a.median_rent*12.0/a.median_income*100, 1) AS primary_value,
      a.median_rent AS secondary_value
    FROM metros m
    JOIN acs a ON a.fips=m.fips
    WHERE a.median_rent IS NOT NULL AND a.median_income IS NOT NULL AND a.median_income > 0
    ORDER BY (a.median_rent*1.0/a.median_income) ASC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Median Rent',
  }));
}

function rankMostExpensiveUtilities(limit = 30): RankingRow[] {
  return getDb().prepare(`
    SELECT m.fips, m.slug, m.short_name, m.state,
      r.value AS primary_value,
      ra.value AS secondary_value
    FROM metros m
    JOIN rpp r ON r.fips=m.fips AND r.category='utilities' AND r.year=(SELECT MAX(year) FROM rpp)
    JOIN rpp ra ON ra.fips=m.fips AND ra.category='all' AND ra.year=(SELECT MAX(year) FROM rpp)
    ORDER BY r.value DESC
    LIMIT ?
  `).all(limit).map((row: unknown) => ({
    ...(row as RankingRow),
    secondary_label: 'Cost Index',
  }));
}

// ──────────────────────────────────────────────────────────────────
// Topic builders
// ──────────────────────────────────────────────────────────────────

function topicHousingVsGoods(): InsightProfile {
  const heavy = rankHousingHeavy(30);
  const light = rankHousingLight(30);
  return {
    topic: 'housing-vs-goods',
    slug: 'housing-vs-goods',
    title: 'Housing vs Goods: Where Shelter Drives Costs (and Where It Doesn\'t)',
    metaTitle: 'Housing-Heavy vs Goods-Heavy US Metros — BEA RPP Cost Decomposition',
    metaDescription: 'BEA Regional Price Parities decompose metro costs into housing, goods, utilities, and services. See which US metros run the biggest housing premium and which are driven by goods/services instead.',
    hookHeadline: 'Two Cities Can Have the Same Cost Index — and Wildly Different Spending Profiles',
    hook: 'BEA Regional Price Parities decompose each metro\'s cost into four categories: housing, goods, utilities, and other services. The same overall cost index can come from very different sources — a coastal metro driven by housing premiums, or an inland metro where shelter is cheap but goods and services do the cost work. The pairing below shows the 30 metros where housing pulls the cost index hardest, and the 30 where housing actually drags it down.',
    tables: [
      {
        heading: 'Housing-Heavy Metros — Where Shelter Pulls Cost Up',
        caption: 'Metros with the largest gap between housing index and overall cost index. Positive numbers mean housing runs above the metro\'s overall cost level.',
        primaryLabel: 'Housing Premium',
        secondaryLabel: 'Cost Index',
        rows: heavy,
        formatPrimary: fmtPtsSigned,
        formatSecondary: fmtIdxOrNull,
      },
      {
        heading: 'Goods/Services-Driven Metros — Where Housing Is Cheaper Than Average',
        caption: 'Metros where housing index runs below overall cost — meaning groceries, utilities, and services contribute disproportionately to the cost picture.',
        primaryLabel: 'Housing Discount',
        secondaryLabel: 'Cost Index',
        rows: light,
        formatPrimary: fmtPtsSigned,
        formatSecondary: fmtIdxOrNull,
      },
    ],
    outro: 'For relocators, the housing-vs-goods split matters more than the headline cost index. A housing-heavy metro punishes renters and homebuyers but treats day-to-day spending normally; a goods-driven metro looks cheap on shelter but eats into the food and services budget. BEA RPP makes the decomposition visible — read the housing column independently of the overall figure.',
  };
}

function topicRentBurden(): InsightProfile {
  const burdened = rankRentBurden(30);
  const easy = rankRentEasy(30);
  return {
    topic: 'rent-burden',
    slug: 'rent-burden',
    title: 'Rent Burden Across US Metros: Where Renters Stretch the 30% Rule',
    metaTitle: 'US Rent Burden Rankings — Highest and Lowest Rent-to-Income Ratios',
    metaDescription: 'HUD\'s 30% rule says housing should consume no more than 30% of household income. See which US metros push median renters past that line, and which keep rent comfortably affordable.',
    hookHeadline: 'HUD\'s 30% Affordability Line Is Closer Than You Think in Some Metros',
    hook: 'The 30% rule of thumb says housing costs (rent + utilities) shouldn\'t exceed 30% of household income. Most US metros sit comfortably below the line at the median, but a handful — concentrated in tourism-heavy coastal markets and supply-constrained urban centers — push the median renter close to or past it. The two tables show the metros where rent burden is highest and lowest, both calculated from BEA-tracked metros against ACS median income and rent.',
    tables: [
      {
        heading: 'Most Rent-Burdened Metros — Highest Rent-to-Income Ratios',
        caption: 'Annual median rent (rent × 12) divided by median household income. Higher percentages mean a larger share of income goes to rent.',
        primaryLabel: 'Rent / Income',
        secondaryLabel: 'Median Rent',
        rows: burdened,
        formatPrimary: fmtPctVal,
        formatSecondary: fmtUsdOrNull,
      },
      {
        heading: 'Lowest Rent Burden Metros — Most Rental-Affordable',
        caption: 'Metros where median rent represents the smallest share of median household income — typically lower-cost interior cities with strong wages.',
        primaryLabel: 'Rent / Income',
        secondaryLabel: 'Median Rent',
        rows: easy,
        formatPrimary: fmtPctVal,
        formatSecondary: fmtUsdOrNull,
      },
    ],
    outro: 'Rent burden is a more direct indicator of renter strain than the overall cost index — a metro can be expensive on goods but reasonable on rent, or vice versa. For renters specifically, this is the table to read first: it isolates the affordability question to housing alone.',
  };
}

function topicHiddenGems(): InsightProfile {
  const gems = rankHiddenGems(40);
  const opposite = getMostExpensiveCities(20).map((m) => ({
    fips: m.fips, slug: m.slug, short_name: m.short_name, state: m.state,
    primary_value: m.rpp_all,
    secondary_value: null,
    secondary_label: '',
  })) as RankingRow[];
  return {
    topic: 'hidden-gems',
    slug: 'hidden-gems',
    title: 'Hidden-Value US Metros: Where Real Income Outpaces the Cost Index',
    metaTitle: 'Hidden-Gem US Metros — Best Real (Cost-Adjusted) Income',
    metaDescription: 'Real income = median household income adjusted for the local cost of living. The metros that combine below-average costs with above-average wages deliver the highest real purchasing power.',
    hookHeadline: 'The Best Standard of Living per Dollar Often Isn\'t Where You\'d Expect',
    hook: 'Real income — median household income adjusted by the local BEA cost-of-living index — captures actual purchasing power better than nominal wages. The metros that combine below-average costs with strong wages deliver the highest real income, often outperforming famous high-pay coastal cities once cost of living is netted out. The first list shows the top hidden-value metros; the second shows the headline-expensive metros for contrast.',
    tables: [
      {
        heading: 'Top Hidden-Value Metros — Highest Real Income',
        caption: 'Real income = nominal median income × (100 / RPP_all). Sorted by real-income figure — these metros maximize standard of living per cost dollar.',
        primaryLabel: 'Real Income',
        secondaryLabel: 'Cost Index',
        rows: gems,
        formatPrimary: fmtUsdShort,
        formatSecondary: fmtIdxOrNull,
      },
      {
        heading: 'For Contrast: The Most Expensive US Metros',
        caption: 'The headline-expensive metros where the cost index is high — often paired with high nominal wages, but real income gains are partially offset by cost.',
        primaryLabel: 'Cost Index',
        secondaryLabel: '',
        rows: opposite,
        formatPrimary: fmtIdx,
        formatSecondary: () => '',
      },
    ],
    outro: 'For remote workers and salary-portable professionals, the hidden-value metros are the cost-arbitrage frontier: bringing a coastal-tier salary to one of these cities can raise real purchasing power by 30–60% compared with paying coastal rent at coastal-tier wages. The cost discount and the wage strength compound rather than cancel out.',
  };
}

function topicFastestChanging(): InsightProfile {
  const rising = rankFastestRising(30);
  const falling = rankFastestFalling(30);
  return {
    topic: 'fastest-changing',
    slug: 'fastest-changing',
    title: 'Fastest-Changing US Cost Indices: 5-Year RPP Movements',
    metaTitle: 'US Cost of Living Trends — Fastest-Rising and Fastest-Falling Metros',
    metaDescription: 'BEA Regional Price Parities track metro costs annually. See the US metros with the biggest cost-index changes over the most recent 5-year window.',
    hookHeadline: 'Most US Metros Drift; A Few Move Sharply',
    hook: 'BEA RPP tracks metro cost indices each year. Most metros drift within ±2 points over five years; a few have moved sharply — either climbing as in-migration outpaced housing supply, or easing as cost growth lagged peer metros. The two tables capture the standout movers in each direction over the most recent 5-year window in BEA data.',
    tables: [
      {
        heading: 'Fastest-Rising Cost Indices (5-Year Change)',
        caption: 'Metros where the BEA cost index has gained the most points over the most recent 5-year window. Positive movement = rising cost relative to other US metros.',
        primaryLabel: '5-Year Change',
        secondaryLabel: 'Current Index',
        rows: rising,
        formatPrimary: fmtPtsSigned,
        formatSecondary: fmtIdxOrNull,
      },
      {
        heading: 'Fastest-Falling Cost Indices (5-Year Change)',
        caption: 'Metros where the BEA cost index has fallen the most over the same 5-year span. RPP is relative — declining values can mean other metros rose faster, not necessarily that prices fell.',
        primaryLabel: '5-Year Change',
        secondaryLabel: 'Current Index',
        rows: falling,
        formatPrimary: fmtPtsSigned,
        formatSecondary: fmtIdxOrNull,
      },
    ],
    outro: 'Fast-rising indices often trail housing-cost spikes that began earlier — the cost rise is the lagging indicator. Fast-falling indices can mean either improved affordability or weakening labor markets; pair the trend with population and employment data to read the signal correctly.',
  };
}

function topicDollarStretch(): InsightProfile {
  const cheapest = getCheapestCities(30).map((m, i) => ({
    fips: m.fips, slug: m.slug, short_name: m.short_name, state: m.state,
    primary_value: Math.round(80000 * 100 / m.rpp_all),
    secondary_value: m.rpp_all,
    secondary_label: 'Cost Index',
    _i: i,
  })) as RankingRow[];
  const expensive = getMostExpensiveCities(20).map((m) => ({
    fips: m.fips, slug: m.slug, short_name: m.short_name, state: m.state,
    primary_value: Math.round(80000 * 100 / m.rpp_all),
    secondary_value: m.rpp_all,
    secondary_label: 'Cost Index',
  })) as RankingRow[];
  return {
    topic: 'dollar-stretch',
    slug: 'dollar-stretch',
    title: 'Where $80,000 Buys the Most (and the Least) in the US',
    metaTitle: '$80K Salary Equivalence by US Metro — BEA RPP Adjusted Purchasing Power',
    metaDescription: 'Take an $80,000 salary and adjust for each metro\'s cost of living using BEA Regional Price Parities. See where that paycheck stretches farthest — and where it shrinks most.',
    hookHeadline: 'A $80,000 Salary Doesn\'t Buy the Same Thing Everywhere',
    hook: 'The same paycheck has wildly different purchasing power depending on where you spend it. Using BEA Regional Price Parities to adjust an $80,000 nominal salary for local cost of living gives the cost-equivalent figure in each metro. The two tables show where the dollar stretches the most and the least — useful for comparing offers across metros, or planning a relocation.',
    tables: [
      {
        heading: 'Where $80K Buys the Most — Top 30 Cost-Adjusted Cities',
        caption: 'Adjusted purchasing power = $80,000 × (100 / RPP_all). The figure shows what an $80K salary buys in equivalent national-average dollars.',
        primaryLabel: '$80K Equivalent',
        secondaryLabel: 'Cost Index',
        rows: cheapest,
        formatPrimary: fmtUsdShort,
        formatSecondary: fmtIdxOrNull,
      },
      {
        heading: 'Where $80K Buys the Least — Most Expensive Metros',
        caption: 'Same calculation flipped — high-cost metros shrink an $80K salary considerably in real-purchasing-power terms.',
        primaryLabel: '$80K Equivalent',
        secondaryLabel: 'Cost Index',
        rows: expensive,
        formatPrimary: fmtUsdShort,
        formatSecondary: fmtIdxOrNull,
      },
    ],
    outro: 'For job offers across metros, comparing nominal salaries can be misleading by 20–30%. The BEA RPP adjustment isolates the actual purchasing-power difference. A 90,000 offer in a 105-cost metro and an 80,000 offer in a 90-cost metro have nearly identical real value despite the 12.5% nominal gap.',
  };
}

function topicRealWages(): InsightProfile {
  const valueLeaders = rankValueLeaders(30);
  const incomeLeaders = rankIncomeLeaders(30);
  return {
    topic: 'real-wages',
    slug: 'real-wages',
    title: 'Real Wages Across US Metros: Nominal Income vs Cost-Adjusted Income',
    metaTitle: 'US Real Wage Rankings — Cost-Adjusted Median Income by Metro',
    metaDescription: 'Real wages = median household income adjusted for local cost of living. Compare the nominal-income leaders against the real-income leaders — they\'re not always the same metros.',
    hookHeadline: 'Highest Nominal Salary Doesn\'t Equal Highest Real Pay',
    hook: 'Two ways to rank metros on income: by raw median household income, or by cost-of-living-adjusted (real) income. The two lists overlap but don\'t match — high-cost metros that lead on nominal pay often slip in the real-income rankings, while lower-cost metros with healthy wages climb. This is the picture for households deciding where to live: where does the paycheck actually buy the most?',
    tables: [
      {
        heading: 'Real-Income Leaders — Highest Cost-Adjusted Median Pay',
        caption: 'Real income = nominal median income × (100 / RPP_all). The metros where median households have the most actual purchasing power.',
        primaryLabel: 'Real Income',
        secondaryLabel: 'Median Income',
        rows: valueLeaders,
        formatPrimary: fmtUsdShort,
        formatSecondary: fmtUsdOrNull,
      },
      {
        heading: 'Nominal-Income Leaders — Highest Median Household Income',
        caption: 'Same metros ranked by raw nominal income before any cost adjustment. Includes the cost index for context — high nominal wages here often reflect an expensive metro.',
        primaryLabel: 'Median Income',
        secondaryLabel: 'Cost Index',
        rows: incomeLeaders,
        formatPrimary: fmtUsdShort,
        formatSecondary: fmtIdxOrNull,
      },
    ],
    outro: 'For job seekers comparing offers across metros, real income is the more honest comparison. A nominal-leader metro at 1.2× pay but 1.3× cost delivers worse real income than a mid-list metro at 1.0× pay and 0.9× cost. The two tables make the difference visible — same data, two different stories.',
  };
}

// ──────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────

const PROFILES: Record<InsightTopic, () => InsightProfile> = {
  'housing-vs-goods': topicHousingVsGoods,
  'rent-burden': topicRentBurden,
  'hidden-gems': topicHiddenGems,
  'fastest-changing': topicFastestChanging,
  'dollar-stretch': topicDollarStretch,
  'real-wages': topicRealWages,
};

export function getAllInsightTopics(): InsightTopic[] {
  return Object.keys(PROFILES) as InsightTopic[];
}

export function getInsightProfile(topic: InsightTopic): InsightProfile | null {
  const fn = PROFILES[topic];
  if (!fn) return null;
  return fn();
}

// ──────────────────────────────────────────────────────────────────
// Index page narrative — for /insights/ root
// ──────────────────────────────────────────────────────────────────

export interface InsightIndexNarrative {
  heroHeadline: string;
  hero: string;
  cards: { topic: InsightTopic; title: string; tagline: string }[];
}

export function getInsightIndexNarrative(): InsightIndexNarrative {
  return {
    heroHeadline: 'BEA RPP + ACS, Cut Six Different Ways',
    hero: 'Each topic below takes the same dataset — BEA Regional Price Parities and ACS household income — and asks a different question. Together they cover the angles a single ranking can\'t: the housing-vs-goods split, rent burden, hidden value, cost trajectories, dollar-stretch, and real wages. Pick a topic and read the paired tables.',
    cards: [
      { topic: 'housing-vs-goods', title: 'Housing vs Goods', tagline: 'Where shelter drives costs vs where groceries and services do' },
      { topic: 'rent-burden', title: 'Rent Burden', tagline: 'HUD\'s 30% line — who clears it, who doesn\'t' },
      { topic: 'hidden-gems', title: 'Hidden-Value Metros', tagline: 'Below-average cost meets above-average real income' },
      { topic: 'fastest-changing', title: 'Fastest-Changing Metros', tagline: '5-year cost-index swings — risers and decliners' },
      { topic: 'dollar-stretch', title: 'Dollar Stretch ($80K)', tagline: 'Where an $80K salary buys the most — and the least' },
      { topic: 'real-wages', title: 'Real vs Nominal Wages', tagline: 'Same data, two different income leaderboards' },
    ],
  };
}

// ──────────────────────────────────────────────────────────────────
// Slug-hash heading variation per topic (so corpus reads with diversity)
// ──────────────────────────────────────────────────────────────────

export function getTopicHeadlineVariant(topic: InsightTopic, kind: 'h1' | 'meta-title'): string {
  const profile = getInsightProfile(topic);
  if (!profile) return topic;
  if (kind === 'meta-title') return profile.metaTitle;

  return pickVariant(topic, [
    profile.title,
    profile.hookHeadline,
    `${profile.title} — BEA RPP Analysis`,
  ], kind === 'h1' ? 1 : 2);
}

// Re-export ordinal helper for downstream pages
export { ordinalSuffix };
