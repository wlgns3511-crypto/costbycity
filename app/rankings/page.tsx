import type { Metadata } from "next";

/**
 * 2026-04-29 HCU 5-chunk patch — new /rankings/ index page (was 404).
 *
 * Lists all 12 ranking types grouped by theme so visitors can land on the right
 * cut without trial-and-error. Counterpart to /insights/ which groups the same
 * data by topic (paired tables) instead of single-axis ranking.
 */

export const metadata: Metadata = {
  title: "All US Cost-of-Living Rankings — 12 Lists by City",
  description: "All 12 cost-of-living rankings on CostByCity: most/least expensive, housing extremes, hidden-value metros, rent burden, fastest-changing, real-income leaders, cheapest utilities.",
  alternates: { canonical: "/rankings/" },
  openGraph: {
    title: "All US Cost-of-Living Rankings — 12 Lists",
    description: "Twelve different ways to rank US metros: cost extremes, housing, real income, trends, utilities.",
    url: "/rankings/",
  },
};

const GROUPS = [
  {
    label: 'Overall Cost Extremes',
    description: 'Top and bottom of the BEA Regional Price Parity overall index.',
    cards: [
      { slug: 'most-expensive-cities', title: 'Most Expensive Cities', tagline: 'Top of the BEA cost index — usually paired with high pay.', tone: 'red' },
      { slug: 'most-affordable-cities', title: 'Most Affordable Cities', tagline: 'Bottom of the BEA cost index — many are also hidden-value metros.', tone: 'green' },
    ],
  },
  {
    label: 'Housing-Specific',
    description: 'BEA decomposes cost into housing + goods + utilities + services. These rank on housing alone.',
    cards: [
      { slug: 'cheapest-housing', title: 'Cheapest Housing', tagline: 'Lowest BEA housing index — most affordable shelter.', tone: 'green' },
      { slug: 'most-expensive-housing', title: 'Most Expensive Housing', tagline: 'Highest BEA housing index — supply-constrained markets.', tone: 'red' },
      { slug: 'housing-heavy', title: 'Housing-Heavy Profiles', tagline: 'Where housing pulls cost above the metro\'s overall index by the largest margin.', tone: 'violet' },
      { slug: 'rent-burden-highest', title: 'Heaviest Rent Burden', tagline: 'Rent as a share of median income — closest to HUD\'s 30% line.', tone: 'amber' },
    ],
  },
  {
    label: 'Income & Real Wages',
    description: 'Nominal income vs cost-adjusted (real) income — same data, two different leaderboards.',
    cards: [
      { slug: 'income-leaders', title: 'Highest Median Income', tagline: 'Nominal household income, before any cost adjustment.', tone: 'indigo' },
      { slug: 'value-leaders', title: 'Real-Income Leaders', tagline: 'Cost-adjusted household income — what the paycheck actually buys.', tone: 'teal' },
      { slug: 'hidden-gems', title: 'Hidden-Value Metros', tagline: 'Below-average cost meets above-average wages.', tone: 'emerald' },
    ],
  },
  {
    label: 'Trends',
    description: 'Year-over-year movement in the BEA cost index over the most recent 5-year window.',
    cards: [
      { slug: 'fastest-rising', title: 'Fastest-Rising Costs', tagline: 'Biggest 5-year cost-index increases — most metros barely move.', tone: 'orange' },
      { slug: 'fastest-falling', title: 'Fastest-Easing Costs', tagline: 'Biggest 5-year cost-index decreases — relative to peer metros.', tone: 'sky' },
    ],
  },
  {
    label: 'Utilities',
    description: 'BEA tracks utilities (electricity, gas, water) as a distinct category.',
    cards: [
      { slug: 'cheapest-utilities', title: 'Cheapest Utilities', tagline: 'Lowest BEA utilities index — useful for fixed-cost modelling.', tone: 'cyan' },
    ],
  },
] as const;

const TONE: Record<string, { border: string; bg: string; text: string }> = {
  red: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700' },
  green: { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' },
  violet: { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
  indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  teal: { border: 'border-teal-200', bg: 'bg-teal-50', text: 'text-teal-700' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700' },
  sky: { border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-sky-700' },
  cyan: { border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-700' },
};

export default function RankingsIndex() {
  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <span className="text-slate-800">Rankings</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">All US Cost-of-Living Rankings</h1>
      <p className="text-slate-600 mb-2 max-w-3xl">
        Twelve ranked lists covering BEA Regional Price Parities and ACS household income across
        387 US metros. Pick the angle you care about — overall cost, housing-specific, income/real-wages,
        trends, or utilities.
      </p>
      <p className="text-sm text-slate-500 mb-8 max-w-3xl">
        Looking for paired analysis (e.g. fastest-rising <em>and</em> fastest-falling on one page)?
        Try <a href="/insights/" className="text-emerald-600 hover:underline">topic-based insights</a> instead — same data, six themed angles.
      </p>

      {GROUPS.map((g) => (
        <section key={g.label} className="mb-10">
          <h2 className="text-xl font-bold mb-1">{g.label}</h2>
          <p className="text-sm text-slate-500 mb-4">{g.description}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.cards.map((c) => {
              const tone = TONE[c.tone] || TONE.green;
              return (
                <a key={c.slug} href={`/rankings/${c.slug}/`}
                  className={`block rounded-lg border ${tone.border} ${tone.bg} p-5 hover:shadow-sm transition`}>
                  <h3 className={`font-semibold mb-1 ${tone.text}`}>{c.title}</h3>
                  <p className="text-sm text-slate-600">{c.tagline}</p>
                </a>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mt-12 p-5 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Methodology Notes</h2>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li><strong>Cost Index</strong> = BEA Regional Price Parities (RPP). 100 = US average; 110 = 10% above, 90 = 10% below.</li>
          <li><strong>Real Income</strong> = nominal median household income × (100 / RPP). Captures cost-adjusted purchasing power.</li>
          <li><strong>Rent Burden</strong> = (median rent × 12) ÷ median household income. HUD considers above 30% &ldquo;cost-burdened.&rdquo;</li>
          <li><strong>Housing Premium</strong> = housing-category RPP minus overall RPP. Positive means housing pulls cost up; negative means goods/services do.</li>
          <li><strong>5-Year Change</strong> = current-year RPP minus the figure from 5 years earlier. RPP is relative to other US metros, not absolute.</li>
        </ul>
      </section>
    </div>
  );
}
