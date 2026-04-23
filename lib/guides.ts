/**
 * Long-form evergreen guides — US cost of living methodology and decision-making.
 * Hub pages that link deep into the cities × compare matrix.
 * Each guide targets a high-intent relocation or comparison question.
 */

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string; // HTML
  sections: Array<{ heading: string; html: string }>;
  faqs: Array<{ question: string; answer: string }>;
  category: string;
  updatedAt: string;
}

const u = '2026-04-10';

export const guides: Guide[] = [
  {
    slug: 'cost-of-living-index-explained',
    title: 'Cost of Living Index Explained: What That "100 = Average" Number Actually Means',
    description: 'How cost of living indexes are constructed, what the base 100 reference means, the difference between BLS and Numbeo methodologies, and how to read the numbers without getting fooled.',
    category: 'Methodology',
    updatedAt: u,
    intro: `<p>Every cost of living comparison you'll see uses some version of an index — typically with the national average set to 100. New York City might be 187, Memphis 89, San Francisco 195. These numbers are everywhere, but most people don't know exactly what they measure, how they're calculated, or which sources are trustworthy. This guide explains the math behind the index, the components, and how to read it accurately so you don't get tricked by misleading numbers.</p>`,
    sections: [
      {
        heading: 'What the index actually represents',
        html: `<p>A cost of living index is a single number that summarizes the relative cost of a standard "basket of goods and services" in different locations. The reference point is set to 100 — usually the US national average. Locations more expensive than average get numbers above 100; cheaper locations get numbers below 100.</p><p>An index of 130 means the location is <strong>30 percent more expensive</strong> than the national average for the same basket. Index of 80 means 20 percent cheaper. The math is simple: divide the cost of the basket in your target location by the cost in the reference location, multiply by 100.</p><p>The challenge is the "basket" — what to include and how to weight it. Different sources use different baskets, which is why two indexes can give different numbers for the same city.</p>`,
      },
      {
        heading: 'The major sources and their methodologies',
        html: `<p>Five major COL data sources, each with its own approach:</p><ul><li><strong>BLS Regional Price Parities (RPP):</strong> the federal government's official measure. Based on Consumer Price Index (CPI) data with regional adjustments. National average = 100. Most authoritative; updated annually.</li><li><strong>Council for Community and Economic Research (C2ER):</strong> the original "100 = average" index, used by relocation services and chambers of commerce. Surveys ~300 cities quarterly. Different basket from BLS.</li><li><strong>Numbeo:</strong> crowd-sourced from user submissions. Largest coverage globally. Less consistent than official sources because it relies on volunteer data quality.</li><li><strong>NerdWallet, Bankrate, Bestplaces:</strong> aggregators that combine multiple sources. Useful for quick lookup but less precise than primary sources.</li><li><strong>MIT Living Wage Calculator:</strong> not exactly a COL index, but calculates a minimum income threshold to cover basic needs by region and family size. Useful complement.</li></ul><p>For US comparisons, BLS RPP is the gold standard because it uses official federal data and consistent methodology. For global comparisons, Numbeo is broader but less reliable.</p>`,
      },
      {
        heading: 'Why two indexes can disagree by 30 percent',
        html: `<p>If you look up Austin, Texas in different sources, you might see indices ranging from 95 to 115 — a 20 percent gap for the same city. The reasons:</p><ol><li><strong>Different baskets.</strong> Index A includes housing-heavy weighting (40% housing, 15% transport, 15% food, etc.). Index B uses different proportions. A city with cheap housing but expensive food will rank differently in each.</li><li><strong>Different reference periods.</strong> Some indexes update annually, some quarterly, some monthly. Austin's housing market in early 2024 looks dramatically different from late 2024.</li><li><strong>Different geography.</strong> "Austin" can mean the city limits, the Austin-Round Rock MSA, or Travis County. Each has different costs.</li><li><strong>Different data sources.</strong> BLS uses CPI surveys; C2ER uses local price collectors; Numbeo uses crowdsourced submissions. Each has selection bias.</li></ol><p>When comparing cities, always use the SAME source for both. Comparing BLS Austin to Numbeo San Francisco is meaningless because the methodologies differ.</p>`,
      },
      {
        heading: 'What 100 actually represents',
        html: `<p>The "100 = national average" reference is a synthetic construct, not an actual city. It's calculated as a population-weighted average of all US metropolitan areas. The closest real cities to 100 are typically mid-sized inland metros: Indianapolis, Kansas City, Columbus, Nashville (varies year to year).</p><p>This means: if you currently live in Indianapolis (close to 100) and move to San Francisco (around 195), your cost of living roughly doubles. If you move from Indianapolis to Memphis (89), it drops about 11 percent.</p><p>The 100 reference is not "the cheapest possible" — there are cities below 100. It's the average. Cities can be substantially cheaper (some Mississippi and Alabama metros at 81-85) or substantially more expensive (Manhattan often above 230).</p>`,
      },
      {
        heading: 'Component breakdown: what makes up the index',
        html: `<p>Most COL indexes weight categories approximately like this:</p><ul><li><strong>Housing:</strong> 40-45% (largest single component)</li><li><strong>Transportation:</strong> 12-15%</li><li><strong>Food (grocery + restaurant):</strong> 12-15%</li><li><strong>Healthcare:</strong> 8-10%</li><li><strong>Utilities:</strong> 6-8%</li><li><strong>Goods and services:</strong> 10-15%</li></ul><p>Notice that housing is dominant. This means a city with low housing but expensive food will look much cheaper than a city with expensive housing but cheap food, even if the total spending is similar. The index's housing weight effectively magnifies housing differences.</p><p>This is why San Francisco (high housing, moderate other costs) ranks dramatically higher than Detroit (low housing, mid-range other costs) — even though groceries and gas are roughly comparable in both.</p>`,
      },
      {
        heading: 'How to use COL data correctly',
        html: `<p>Three rules:</p><ol><li><strong>Compare cities using the same source.</strong> Always use BLS RPP or C2ER consistently. Never mix indexes.</li><li><strong>Apply the index to your actual spending pattern.</strong> A retiree (low transportation, high healthcare) and a young commuter (high transportation, low healthcare) face different real costs even at the same nominal index.</li><li><strong>Cross-check with rent data.</strong> Housing dominates the index, so the index is mostly a function of rent. If your specific rent number differs from the city average, your personal cost of living will differ from the index proportionally.</li></ol><p>Use our <a href="/cities/">city pages</a> for current data and the <a href="/compare/">compare tool</a> for side-by-side analysis.</p>`,
      },
    ],
    faqs: [
      { question: 'What is a cost of living index?', answer: 'A single number summarizing the relative cost of goods and services in a location, with the national average set to 100. An index of 130 means the location is 30 percent more expensive than average; 80 means 20 percent cheaper.' },
      { question: 'Is BLS or Numbeo more accurate for cost of living?', answer: 'For US comparisons, BLS Regional Price Parity (RPP) is more authoritative because it uses official federal CPI data with consistent methodology. Numbeo is more useful for global comparisons because it covers far more international cities, but data quality varies based on volunteer submissions.' },
      { question: 'Why do different sources show different cost of living for the same city?', answer: 'Different baskets, different weighting (especially housing), different geographies, different data periods, and different data sources. Always use the same source when comparing two cities.' },
      { question: 'What does an index of 100 mean?', answer: '100 represents the national average for the standard basket of goods and services. Cities at 100 cost about average; cities at 130 cost 30 percent more than average; cities at 80 cost 20 percent less. The 100 reference is a population-weighted average, not a specific city.' },
      { question: 'Why is housing such a large part of the cost of living index?', answer: 'Because housing is the largest single household expense, typically 25-40 percent of income. COL indexes weight housing at 40-45% to reflect its real impact. This means cities with cheap housing rank lower on the index even if other costs are similar.' },
      { question: 'How do I use a cost of living index for relocation?', answer: 'Compare your current city\'s index to the target city. If you make $100,000 in a city with index 110 and move to a city with index 90, you maintain the same purchasing power on $81,800. But always cross-check with actual rent and real local prices for your specific lifestyle.' },
    ],
  },
  {
    slug: 'col-categories-housing-dominates',
    title: 'The 7 Categories Inside a COL Index (And Why Housing Dominates)',
    description: 'A breakdown of how cost of living indexes weight housing, food, transportation, healthcare, utilities, and other categories — and why housing-heavy weighting can mislead specific household types.',
    category: 'Methodology',
    updatedAt: u,
    intro: `<p>Cost of living indexes are not arbitrary — they're calculated using fixed weights for different spending categories. Housing dominates at 40-45 percent, with transportation, food, healthcare, utilities, and other categories filling in. This weighting matches typical US household spending, but it can dramatically misrepresent costs for retirees, students, families with children, or anyone whose spending differs from the "average household." This guide breaks down each category, the weights, and why your personal cost of living might be very different from the headline index.</p>`,
    sections: [
      {
        heading: 'The 7 categories and their weights',
        html: `<p>Approximate weights for major US cost of living indexes (BLS C-CPI-U and similar):</p><ol><li><strong>Housing:</strong> 42% — rent/owner equivalent, utilities, insurance, repairs</li><li><strong>Transportation:</strong> 17% — vehicles, gas, insurance, public transit</li><li><strong>Food:</strong> 13% — groceries (8%) + restaurants (5%)</li><li><strong>Healthcare:</strong> 8% — insurance premiums, services, prescriptions</li><li><strong>Recreation and entertainment:</strong> 6%</li><li><strong>Education and communication:</strong> 6%</li><li><strong>Other goods and services:</strong> 8% — personal care, household supplies, etc.</li></ol><p>These weights are based on the BLS Consumer Expenditure Survey, which tracks actual spending of American households. They represent the "average" household — and that average is the source of the methodology's biggest blind spot. Real households deviate substantially from average.</p>`,
      },
      {
        heading: 'Housing: the dominant variable',
        html: `<p>Housing's 42 percent weight means it accounts for almost half of any cost of living comparison. The reason: housing is the largest single household expense for most Americans, and the cost varies more dramatically across cities than any other category.</p><p>Housing component breakdown:</p><ul><li><strong>Shelter (rent + owner equivalent):</strong> 32% of the total index</li><li><strong>Energy services (electricity, gas):</strong> 4%</li><li><strong>Other housing:</strong> insurance, repairs, household furnishings — 6%</li></ul><p>San Francisco vs Memphis comparison: SF rent is roughly 4x Memphis rent, but groceries are only about 1.3x more expensive. The 4x rent difference, weighted at 32%, dominates the index difference even though most non-housing costs are far closer.</p>`,
      },
      {
        heading: 'Transportation: car vs transit cities',
        html: `<p>Transportation at 17% varies enormously by city design. In car-dependent metros (most US cities), the average household spends:</p><ul><li>Vehicle purchase: 4% of income</li><li>Gas: 3-5% of income (varies with prices)</li><li>Insurance: 2-3% of income</li><li>Maintenance and repairs: 1-2% of income</li><li>Total: 10-14% of household income</li></ul><p>In transit-friendly cities (NYC, SF, Boston, DC), residents who don't own cars often spend just 3-5% of income on transit passes. The savings from going car-free can offset 10-15% of housing cost premiums in expensive coastal cities, which is one reason urban living is sometimes cheaper than suburban living for equivalent quality.</p><p>The COL index assumes the average car-dependent transportation pattern, so it understates the value of going car-free in transit-friendly cities and overstates the cost of suburban locations.</p>`,
      },
      {
        heading: 'Food: where the index works well',
        html: `<p>Food (13%) is one of the most stable components of the index. Grocery prices vary by 20-30% across US cities, but rarely more. Restaurant prices vary somewhat more (50-100% range from cheapest to most expensive metros).</p><p>The food component is especially well-measured by the BLS, which collects price data on a standard basket of foods every month. Anyone whose food spending matches the average will find the food component reliable.</p><p>Outliers: Hawaii is dramatically more expensive for groceries (often 60% above mainland average). Alaska is similar. Grocery-heavy households moving to Hawaii or Alaska should add 10-15% to the COL index estimate.</p>`,
      },
      {
        heading: 'Healthcare: the wildcard',
        html: `<p>Healthcare (8%) is the most variable component for individual households. The "average" US household spends about 8% of income on healthcare, but this hides huge variation:</p><ul><li><strong>Healthy young adults with employer coverage:</strong> 2-4% of income</li><li><strong>Average family with employer coverage:</strong> 6-10%</li><li><strong>Self-employed or uninsured:</strong> 15-25%+</li><li><strong>Retirees with chronic conditions:</strong> 15-30%</li></ul><p>State-by-state healthcare cost variation is also significant. Healthcare costs in Massachusetts and Connecticut are about 30% above national average; healthcare costs in Tennessee and Mississippi are about 15% below. The COL index averages these out, but your actual cost depends entirely on your insurance, age, and medical needs.</p>`,
      },
      {
        heading: 'When the index misleads',
        html: `<p>Three household types where the standard COL index gives misleading numbers:</p><ol><li><strong>Childless renters in urban cores.</strong> Without a car, education costs, or recreational spending, real cost of living is much lower than the index suggests because the index assumes you're spending in those categories.</li><li><strong>Retirees.</strong> Healthcare-heavy, transportation-light, education-zero. The index understates retiree cost in expensive healthcare states (MA, CT) and overstates it in cheap healthcare states (TN, MS).</li><li><strong>Families with children.</strong> Childcare costs (often 15-25% of income for working parents) are barely captured by the index. Cities with extreme childcare costs (Boston, NYC, SF) are even more expensive than the index shows for families with young kids.</li></ol><p>Always sanity-check the index against your specific spending pattern. If you spend twice the average on healthcare, double the healthcare component's contribution. If you spend nothing on transportation, subtract the transportation component.</p>`,
      },
    ],
    faqs: [
      { question: 'What categories make up a cost of living index?', answer: 'Housing (about 42%), transportation (17%), food (13%), healthcare (8%), recreation (6%), education and communication (6%), and other goods and services (8%). These weights are based on average US household spending.' },
      { question: 'Why is housing weighted so heavily in cost of living indexes?', answer: 'Because housing is the single largest expense for most American households, typically 25-40% of income. COL indexes weight it at 42% to reflect its real impact. Housing also varies more across cities than any other category, so it drives most of the difference between metros.' },
      { question: 'Does the COL index include taxes?', answer: 'Income tax: usually no, because COL indexes measure prices, not net income. Some indexes include sales tax in their goods baskets indirectly. Always factor in income tax separately when comparing cities — California vs Texas income tax is a 10-13% gap that COL indexes don\'t capture.' },
      { question: 'Why does my actual cost of living feel different from the index?', answer: 'Because the index assumes "average" spending. If you don\'t own a car, don\'t have kids, are healthy, or spend differently from the average, your real cost of living deviates from the index. Adjust mentally for your specific lifestyle.' },
      { question: 'How does the index handle childcare?', answer: 'Poorly. Childcare is grouped under "education and communication" or sometimes "other services" and is significantly under-weighted relative to its real impact on families. Working parents in expensive metros (Boston, NYC, SF) face $20K-$30K+ annual childcare costs that the index understates.' },
      { question: 'Should I trust the index for retirement planning?', answer: 'Use it as a starting point but adjust upward for healthcare in expensive-healthcare states (MA, CT, NY). Retirees typically spend 15-25% on healthcare versus the 8% index assumption. Transportation costs are usually lower than the index assumption.' },
    ],
  },
  {
    slug: 'relocating-for-work-breakeven',
    title: 'Relocating for Work: The Breakeven Math on a Salary Cut for Lower COL',
    description: 'How to calculate whether a $90K offer in Austin actually beats $120K in San Francisco — moving costs, career trajectory, tax differences, and the real breakeven horizon.',
    category: 'Decision Frameworks',
    updatedAt: u,
    intro: `<p>"You're taking a $30,000 pay cut, but the cost of living is so much lower" — this is the most common framing for relocating from a high-cost city to a lower-cost one. It's also incomplete. The real math has to include moving costs, tax differences, career trajectory impact, and retirement savings rate. When you do the full math, some apparent savings flip into losses, and some apparent losses flip into gains. This guide shows you exactly how to run the numbers before you accept a relocation offer.</p>`,
    sections: [
      {
        heading: 'The naive comparison',
        html: `<p>Most people compare two offers like this:</p><ul><li><strong>San Francisco:</strong> $150,000 gross, COL index 195</li><li><strong>Austin:</strong> $115,000 gross, COL index 102</li></ul><p>Naive math: SF "real income" = $150,000 / 1.95 = $76,923. Austin "real income" = $115,000 / 1.02 = $112,745. Austin wins by $35,822.</p><p>This is the standard cost-of-living-adjusted comparison, and it's what most relocation guides will show you. It's also wrong because it ignores 5 major factors that can flip the answer.</p>`,
      },
      {
        heading: 'Factor 1: Federal income tax (yes, at the same gross)',
        html: `<p>Federal income tax is progressive, so the higher gross salary pays a higher effective rate. SF's $150,000 has higher federal tax than Austin's $115,000:</p><ul><li>SF $150K federal tax: ~$25,800 (single filer, standard deduction)</li><li>Austin $115K federal tax: ~$17,300</li></ul><p>So even ignoring state tax, SF takes home $124,200 and Austin takes home $97,700. The $35,000 nominal gap shrinks to $26,500 in net terms.</p><p>This is before state tax, which favors Austin even more (CA 9.3% vs TX 0%).</p>`,
      },
      {
        heading: 'Factor 2: State and local tax difference',
        html: `<p>Including state tax (CA 9.3% effective on $150K, TX 0%):</p><ul><li>SF after federal + state: $124,200 - $13,950 = $110,250 - SDI 1.1%~$1,650 = ~$108,600</li><li>Austin after federal + state: $97,700 (no state tax)</li></ul><p>Net gap: SF takes home $10,900 MORE in absolute dollars, despite the $35K nominal gap. Now apply COL adjustment:</p><ul><li>SF real (after-tax / 1.95): $55,692</li><li>Austin real (after-tax / 1.02): $95,784</li></ul><p>Austin still wins, but by $40,092 in real terms — much larger than the naive $35,822 gap suggested. This is because SF takes a double hit: high COL AND high tax.</p>`,
      },
      {
        heading: 'Factor 3: Moving costs and transition friction',
        html: `<p>Relocation costs are real. Plan for:</p><ul><li><strong>Moving company:</strong> $4,000-$15,000 for cross-country</li><li><strong>Lease break or sale:</strong> 1-2 months rent or 6% home selling cost</li><li>3-6 months of duplicate housing or temporary housing</li><li><strong>Furniture and setup:</strong> $5,000-$15,000 if you don't move everything</li><li><strong>State driver's license, vehicle registration, professional license transfer</strong></li><li><strong>Spouse career disruption:</strong> often 6-12 months of transition unemployment</li></ul><p>Total: $15,000-$40,000 of transition cost. This is real money out of pocket in the first 6 months.</p><p>Amortized over a 5-year stay, that's $3,000-$8,000 per year off the apparent benefit. Over 2 years, $7,500-$20,000/year — a substantial chunk of any savings.</p>`,
      },
      {
        heading: 'Factor 4: Career trajectory impact',
        html: `<p>The hardest factor to quantify, and often the most important: does the move affect your career trajectory?</p><p>Cases where relocation HELPS career trajectory:</p><ul><li>Moving from a saturated market to a growing one</li><li>Promotion comes with the move</li><li>Employer is a meaningfully better company</li><li>Removing geographic constraints opens new networks</li></ul><p>Cases where relocation HURTS career trajectory:</p><ul><li>Moving away from a hub for your industry (NYC for finance, SF for tech, LA for entertainment)</li><li>Smaller employer pool in the new city</li><li>Slower local economic growth</li><li>Diluting professional network you built over years</li><li>Lower local salary ceiling for your role</li></ul><p>A career trajectory hit of 1 promotion delay (typically 10-20% future income) can wipe out all the COL savings over 5-10 years. This is why "follow the money to a low-cost area" works for some careers and fails for others — it depends entirely on whether your industry is hub-concentrated.</p>`,
      },
      {
        heading: 'Factor 5: Savings rate and lifestyle inflation',
        html: `<p>The dirty secret of relocation: many people who move to a lower-cost area don't actually save more money. They upgrade their lifestyle to match their take-home, buying a bigger house, a bigger car, and more discretionary spending.</p><p>If you move to Austin and rent the same size apartment as in SF, you save tons. If you upgrade to a 4-bedroom house with a yard, your housing cost may exceed what you were paying in SF, even at lower per-square-foot prices.</p><p>The math only works if you actually pocket the cost savings. Most people don't — they spend the difference on lifestyle. Plan your post-move budget BEFORE the move and commit to a specific savings rate. Otherwise the COL advantage evaporates.</p>`,
      },
      {
        heading: 'A worked decision example',
        html: `<p>Returning to the original example: SF $150K vs Austin $115K, single filer, no children, plan to stay 5 years.</p><ol><li><strong>Take-home after federal + state + local:</strong> SF $108,600 vs Austin $97,700. Gap: SF wins by $10,900 nominal.</li><li><strong>COL-adjusted real income:</strong> SF $55,692 vs Austin $95,784. Gap: Austin wins by $40,092 real.</li><li><strong>Subtract amortized moving cost:</strong> -$5,000/year. Austin advantage: $35,092/year.</li><li><strong>Subtract estimated career trajectory cost</strong> (career hub effect, depends on your role): -$5,000 to -$15,000/year. Austin advantage: $20,000-$30,000/year.</li><li><strong>Lifestyle inflation discount:</strong> assume you save 60% of the gap, spend 40% on upgrades. Real annual benefit: $12,000-$18,000.</li></ol><p>So the actual annual benefit of moving from SF to Austin in this example is roughly $12,000-$18,000 — not the $40,000 the naive COL math suggested. Still positive, but much smaller, and contingent on actually committing to higher savings.</p><p>Run this exact spreadsheet for your own offer pair. The conclusion often surprises people — sometimes positive, sometimes negative, but rarely matching the naive comparison.</p>`,
      },
    ],
    faqs: [
      { question: 'How do I calculate if a salary cut for lower cost of living is worth it?', answer: 'Five steps: (1) calculate take-home for both offers including federal, state, and local tax; (2) divide by COL index to get real purchasing power; (3) subtract amortized moving costs; (4) subtract career trajectory cost (lower for hub cities); (5) discount for lifestyle inflation. The naive COL-adjusted comparison usually overstates the benefit by 30-50 percent.' },
      { question: 'How much should I budget for moving costs?', answer: 'Plan for $15,000-$40,000 in total transition costs: $4K-$15K for movers, lease/home transition, 3-6 months of overlap or temporary housing, furniture, and other setup. Spouse career disruption can add another $10K-$30K of opportunity cost.' },
      { question: 'What is career trajectory impact?', answer: 'How a move affects your future income growth. Moving from a hub city (NYC for finance, SF for tech, LA for entertainment) to a smaller market often slows promotion velocity and reduces salary ceilings, costing 10-20% of long-term income. Moving in the other direction can accelerate career growth.' },
      { question: 'Will I actually save money by moving to a cheaper city?', answer: 'Only if you commit to a specific savings rate before moving. Most people upgrade their lifestyle (bigger house, more discretionary spending) to match their take-home, eliminating the cost-of-living advantage. Plan your post-move budget in advance and stick to it.' },
      { question: 'How long do I need to stay to make a relocation worth it?', answer: 'Usually 3-5 years to break even on moving costs, longer if the new salary is significantly lower. A short stay (under 2 years) almost always loses money after transition costs are factored in.' },
      { question: 'Is relocating for a lower cost of living always a good idea?', answer: 'No. It depends on your career, industry, family situation, and ability to maintain a high savings rate. For hub-concentrated careers, the trajectory cost often exceeds the COL savings. For remote-friendly careers without hub dependence, the math usually favors moving.' },
    ],
  },
  {
    slug: 'numbeo-vs-bls-vs-others',
    title: 'Numbeo vs BLS vs Bestplaces vs NerdWallet: Why Your City Looks 30% Different',
    description: 'A comparison of major cost of living data sources, methodology differences, sampling bias, and which source to trust when their numbers disagree.',
    category: 'Data Sources',
    updatedAt: u,
    intro: `<p>Look up Austin, Texas in different cost of living sources and you'll see indices ranging from 90 to 115. That's a 25 percent gap for the same city in the same year. The difference comes from methodology, basket composition, geography definition, and data collection — and understanding the differences is essential for making accurate comparisons. This guide compares the major sources (BLS RPP, C2ER, Numbeo, Bestplaces, NerdWallet, Bankrate) and tells you which to trust for which questions.</p>`,
    sections: [
      {
        heading: 'BLS Regional Price Parities (RPP): the gold standard',
        html: `<p>The Bureau of Economic Analysis publishes Regional Price Parities annually, comparing price levels in every US metropolitan area to the national average (set to 100). Methodology:</p><ul><li><strong>Data source:</strong> Consumer Price Index (CPI) data, which the BLS collects monthly from a sample of about 24,000 stores across 87 urban areas</li><li><strong>Update frequency:</strong> annually, with a 1-2 year lag</li><li><strong>Basket:</strong> standard CPI categories, weighted by national consumer expenditure patterns</li><li><strong>Coverage:</strong> all US metropolitan areas plus state-level estimates</li></ul><p>BLS RPP is the most authoritative source for US comparisons because it uses official federal data, consistent methodology, and is peer-reviewed. The drawback: 1-2 year lag, so recent rapid changes (like Austin's housing market 2021-2024) may not be captured.</p><p>Use BLS RPP when: comparing US metros for serious financial decisions, when accuracy matters more than recency, when you need consistent state-level data.</p>`,
      },
      {
        heading: 'C2ER (Council for Community and Economic Research)',
        html: `<p>C2ER publishes the original "Cost of Living Index" used by the chambers of commerce, relocation services, and many news outlets. Methodology:</p><ul><li><strong>Data source:</strong> volunteer price collectors at chambers of commerce, who survey local prices quarterly using a standardized list of items</li><li><strong>Update frequency:</strong> quarterly</li><li><strong>Basket:</strong> 60+ items in 6 categories: grocery, housing, utilities, transportation, healthcare, miscellaneous</li><li><strong>Coverage:</strong> ~300 US cities (smaller than BLS, but includes some non-metro cities)</li></ul><p>C2ER is more current than BLS RPP (quarterly updates) and is the source most commonly cited in news articles about "the most expensive cities." It is reasonably accurate for the cities it covers but has a smaller universe and less rigorous methodology than BLS.</p><p>Use C2ER when: you need quarterly updates, you want a familiar "100 = average" number for non-technical audiences, you're looking up a specific mid-sized city not in BLS data.</p>`,
      },
      {
        heading: 'Numbeo: crowd-sourced global coverage',
        html: `<p>Numbeo is a crowd-sourced cost of living database covering thousands of cities globally. Methodology:</p><ul><li><strong>Data source:</strong> volunteer user submissions of prices for a standard list of items</li><li><strong>Update frequency:</strong> continuous (each submission updates the average)</li><li><strong>Basket:</strong> 50+ items in 8 categories</li><li><strong>Coverage:</strong> 9,000+ cities worldwide, including small cities and international destinations</li></ul><p>Numbeo's coverage is unmatched — it includes thousands of cities that no other source covers. The drawback: data quality varies wildly. Cities with many submissions (London, NYC, SF) have reliable data. Small cities with 5-10 submissions can be misleading because of selection bias (submitters tend to be expats and educated urbanites who pay more than locals).</p><p>Use Numbeo when: you need international city comparisons, you're looking up a small or non-US city, you want a quick rough estimate. AVOID Numbeo for serious decisions about US metros where BLS or C2ER are available.</p>`,
      },
      {
        heading: 'Aggregators: Bestplaces, NerdWallet, Bankrate',
        html: `<p>Several websites aggregate data from multiple sources and present a unified COL number for each city:</p><ul><li><strong>Bestplaces:</strong> uses C2ER data plus its own enhancements. Free to use. Reasonably accurate for US cities. Easy to use interface.</li><li><strong>NerdWallet Cost of Living Calculator:</strong> uses ACCRA (C2ER) data with simplified presentation. Good for quick comparisons.</li><li><strong>Bankrate:</strong> similar to NerdWallet, draws from C2ER. Includes salary calculator integration.</li><li><strong>Numbeo's own aggregator:</strong> "Quality of Life Index" combining COL with crime, pollution, etc.</li></ul><p>Aggregators are convenient but have no original data. They're as good as their underlying source. For a quick lookup, any of them is fine; for a serious decision, go to the primary source.</p>`,
      },
      {
        heading: 'Why sources disagree by 30 percent for the same city',
        html: `<p>Three reasons two sources can show very different numbers for the same city:</p><ol><li><strong>Different baskets.</strong> BLS includes more services and weighting nuance; C2ER uses a fixed 60-item basket; Numbeo uses a different 50-item basket. A city that's expensive for one basket may be cheap for another.</li><li><strong>Different geographies.</strong> "Austin" can mean the city of Austin, the Austin-Round Rock MSA, or Travis County. Each has different cost levels because suburbs are typically cheaper than the urban core. Always check what geography the source uses.</li><li><strong>Different update timing.</strong> Austin's housing market in early 2024 vs late 2024 vs 2025 looks different. A source updated annually with old data will show very different numbers from a source updated quarterly.</li><li><strong>Sampling bias.</strong> Numbeo's volunteer submitters tend to be expats and white-collar workers; C2ER's collectors tend to focus on chamber-of-commerce-friendly metrics; BLS uses a stratified random sample. Each captures a slightly different "city."</li></ol>`,
      },
      {
        heading: 'How to choose the right source',
        html: `<p>Decision tree:</p><ul><li><strong>US metros, serious financial decision:</strong> BLS Regional Price Parity. Most authoritative, peer-reviewed.</li><li><strong>US smaller cities or quarterly updates:</strong> C2ER (via Bestplaces, NerdWallet, or directly).</li><li><strong>International cities:</strong> Numbeo. Lowest accuracy but only source with global coverage.</li><li><strong>Quick lookup, casual decision:</strong> any aggregator (Bestplaces, NerdWallet) is fine.</li><li><strong>Comparing two specific cities:</strong> use the SAME source for both. Never mix BLS for City A with Numbeo for City B.</li></ul><p>Our <a href="/cities/">city pages</a> use multiple sources where available, allowing you to cross-check the numbers and see how much they agree.</p>`,
      },
    ],
    faqs: [
      { question: 'Which cost of living source is most accurate?', answer: 'For US metropolitan areas, BLS Regional Price Parity (RPP) is the most authoritative source. It uses official federal Consumer Price Index data with rigorous methodology. The drawback is a 1-2 year lag.' },
      { question: 'Why does Numbeo show different numbers than BLS?', answer: 'Different methodologies. BLS uses official price collection from a stratified random sample. Numbeo uses crowd-sourced user submissions, which has selection bias (mostly expats and white-collar workers) and varies by city based on how many people submit data.' },
      { question: 'Should I trust Numbeo for US cost of living?', answer: 'For US metros, prefer BLS RPP or C2ER (via Bestplaces or NerdWallet) over Numbeo. Numbeo is best for international cities where BLS data does not exist. For US cities, the volunteer submission bias makes Numbeo less accurate.' },
      { question: 'What is the difference between BLS and C2ER?', answer: 'BLS uses official Consumer Price Index data with stratified random sampling, updated annually. C2ER uses chamber of commerce volunteers collecting prices on a 60-item basket, updated quarterly. BLS is more authoritative; C2ER is more current and covers some smaller cities BLS does not.' },
      { question: 'Why do two sources show different cost of living for the same city?', answer: 'Different baskets, different geographies, different update timing, and different data collection methods. Always use the same source for both cities when comparing, and check whether the geography (city limits vs metro area vs county) matches.' },
      { question: 'How often is cost of living data updated?', answer: 'BLS RPP: annually, with 1-2 year lag. C2ER: quarterly. Numbeo: continuously (every submission updates averages). Aggregators (Bestplaces, NerdWallet) update with their underlying source.' },
    ],
  },
  {
    slug: 'hidden-col-factors',
    title: 'Hidden Cost of Living Factors Your Index Doesn\'t Show',
    description: 'Why the COL index misses commute time, taxes, school costs, healthcare disparities, and quality-of-life factors that affect your real cost of living more than the headline number.',
    category: 'Methodology',
    updatedAt: u,
    intro: `<p>Cost of living indexes give you one number per city. That number captures rent, food, utilities, and a few other categories — but it misses several factors that often have larger real-world impact than the items it measures. Commute time, state income tax differences, public school quality, healthcare cost variation by state, and climate-driven costs are all invisible to the standard COL index. This guide explains the hidden factors and how to adjust your decision when they apply to your situation.</p>`,
    sections: [
      {
        heading: 'Commute time: the largest invisible cost',
        html: `<p>Cost of living indexes do not include the value of your time. A 90-minute commute each way (3 hours/day, 15 hours/week, 750 hours/year) is essentially free in the index — but if you value your time at $30/hour (a modest estimate for a $60K worker), that's $22,500/year of "invisible cost."</p><p>This matters most when comparing:</p><ul><li><strong>Suburban with cheap housing + long commute</strong> vs <strong>urban with expensive housing + short commute</strong>. The index makes the suburb look cheaper, but factoring in commute time often flips the result.</li><li><strong>City with sprawling layout (LA, Houston, Atlanta)</strong> vs <strong>city with transit and walkability (NYC, SF, Boston, DC)</strong>. The walkable city looks more expensive but commute costs are far lower.</li></ul><p>Hedonic studies of housing markets consistently show that a 1-hour reduction in daily commute is worth roughly 15-25% of monthly rent in willingness-to-pay terms. The COL index captures none of this.</p>`,
      },
      {
        heading: 'State income tax (often missing from COL)',
        html: `<p>Most cost of living indexes measure prices, not income tax. This is a critical omission for high earners. A California worker earning $150K pays roughly $13,950 in state income tax + $1,650 in SDI = $15,600/year that the COL index doesn't capture.</p><p>For a Texas worker at the same gross, that's $0. The 9-13% state income tax difference between CA and TX is invisible in the headline COL index.</p><p>This is why the standard advice "compare cities by COL" fails for high earners moving between states with different tax structures. Always add state income tax to the comparison separately. Use our linked tools at <a href="https://netpaypeek.com/country/united-states/">netpaypeek</a> or your own calculator to apply state tax before the COL adjustment.</p>`,
      },
      {
        heading: 'Public school quality (the family-specific factor)',
        html: `<p>For families with children, public school quality is often the largest single cost-of-living variable — but it never appears in the index. Two cities with identical headline COL can have completely different family costs:</p><ul><li><strong>City A: high COL, excellent public schools.</strong> Family pays high housing but $0 for K-12 education.</li><li><strong>City B: lower COL, weak public schools.</strong> Family must pay $20,000-$40,000/year per child for private school OR move to a specific suburb with high housing costs.</li></ul><p>Cities with strong public school districts (typically suburbs of NYC, Boston, DC, SF, Seattle) have housing premiums of 20-40% over similar areas with weaker schools. This premium is part of "buying" school quality through housing — it's invisible in the COL index but very real for families.</p><p>If you have school-age children, look up GreatSchools ratings, district-level test scores, and graduation rates for the specific neighborhoods you're considering. The cost difference between "good" and "average" school districts often dwarfs the headline COL difference between cities.</p>`,
      },
      {
        heading: 'Healthcare cost variation by state',
        html: `<p>Healthcare costs vary by state by a factor of 2-3x for the same procedures. Medicare Part B premiums are uniform nationally, but private insurance, hospital charges, and prescription costs vary dramatically:</p><ul><li><strong>High healthcare cost states:</strong> Massachusetts, Connecticut, Alaska, New York — about 30% above national average</li><li><strong>Low healthcare cost states:</strong> Tennessee, Mississippi, Alabama — about 15% below national average</li></ul><p>For a healthy young adult, this is a small effect. For a family with chronic conditions or for retirees, the healthcare cost difference can be $5,000-$15,000/year between states. The COL index averages these out into a single 8% category, hiding the actual variation.</p><p>If you have medical conditions or are approaching retirement, look up specific procedure costs at hospitals in your candidate cities. Tools like Healthcare Bluebook give cash-pay prices for major procedures.</p>`,
      },
      {
        heading: 'Climate-driven costs',
        html: `<p>Climate creates real costs that vary by region:</p><ul><li><strong>Heating costs:</strong> Northeast and Midwest winters add $1,000-$3,000/year to utility bills compared to mild-climate regions</li><li><strong>Cooling costs:</strong> Southwest and Southeast summers add $1,000-$2,500/year to utility bills</li><li><strong>Insurance:</strong> hurricane-prone (FL, LA, TX coast), wildfire-prone (CA), tornado-prone (KS, OK) areas have homeowners insurance 2-5x national average</li><li><strong>Vehicle:</strong> snowy regions require winter tires, snow removal equipment, more frequent vehicle maintenance</li><li><strong>Healthcare:</strong> very hot or very cold regions have higher seasonal illness rates</li></ul><p>Climate costs are partially captured by the COL index's utilities and insurance components, but they don't fully reflect the variation. A property in coastal Florida can have homeowners insurance of $6,000-$10,000/year compared to $800-$1,500 in low-risk regions. That gap dwarfs many other COL differences.</p>`,
      },
      {
        heading: 'Quality of life factors that affect spending',
        html: `<p>Quality of life affects spending in ways the index can't capture:</p><ul><li><strong>Walkability and transit:</strong> can eliminate car ownership, saving $8,000-$12,000/year</li><li><strong>Outdoor recreation access:</strong> free hiking and beaches reduce entertainment spending</li><li><strong>Cultural amenities:</strong> may increase entertainment spending (museums, concerts, restaurants) but you're getting more value for the money</li><li><strong>Crime levels:</strong> high-crime areas often require home security spending, lower property insurance ratings, and higher car insurance</li><li><strong>Climate suitability for your lifestyle:</strong> if you love skiing, living in Denver vs Miami has very different real costs to access your hobby</li></ul><p>These don't show up in the COL index but affect how you actually spend money in a given city.</p>`,
      },
      {
        heading: 'A practical adjustment checklist',
        html: `<p>Before finalizing a relocation decision based on COL data, adjust for these factors:</p><ol><li><strong>Add state and local income tax</strong> to your take-home calculation</li><li><strong>Factor commute time</strong> at $20-$40/hour for your situation</li><li><strong>Investigate school quality</strong> if you have or plan to have children</li><li><strong>Estimate insurance costs</strong> for the specific climate region (homeowners, auto, health)</li><li><strong>Adjust healthcare costs</strong> based on your medical needs and the state's cost level</li><li><strong>Consider lifestyle fit</strong> — a city that suits your hobbies and preferences will lead to lower discretionary spending than a city where you have to drive everywhere or pay for things you'd get free elsewhere</li></ol><p>The headline COL index is a starting point, not a final answer. The real cost of living for your specific household can be 20-40% higher or lower than the index suggests, depending on which hidden factors apply.</p>`,
      },
    ],
    faqs: [
      { question: 'Does the cost of living index include income tax?', answer: 'Most cost of living indexes do not include income tax — they measure prices of goods and services. For high earners, state income tax differences (CA 13.3% vs TX 0%) can add or subtract $10,000-$20,000/year that the COL index ignores. Always add state tax separately to your comparison.' },
      { question: 'How do I account for commute time in cost of living?', answer: 'Estimate the value of your time (e.g., $30/hour for a $60K worker), multiply by hours commuting per year (typically 250-750 hours for daily commuters), and subtract from the apparent cost savings of cheaper housing. A 90-minute daily commute can cost $15,000-$25,000/year in unpaid time.' },
      { question: 'Why does the COL index miss school quality?', answer: 'Public schools are technically free, so their cost is $0 in the index. But the housing premium for living in a top school district (often 20-40% above similar areas with weaker schools) is part of "buying" school quality. For families with children, this is one of the largest hidden costs.' },
      { question: 'How much does healthcare cost vary between states?', answer: '2-3x for similar procedures. Massachusetts, Connecticut, Alaska, and New York are about 30% above national average. Tennessee, Mississippi, and Alabama are about 15% below. For families with chronic conditions or retirees, the difference can be $5,000-$15,000/year.' },
      { question: 'What about insurance differences between states?', answer: 'Homeowners insurance can vary 5x between low-risk and high-risk states. Coastal Florida averages $6,000-$10,000/year vs $800-$1,500 in low-risk states. Hurricane, wildfire, and flood risk drive most of the variation. Auto insurance also varies dramatically by state.' },
      { question: 'How should I adjust the COL index for my specific situation?', answer: 'Add state income tax to your comparison, factor commute time as a real cost, investigate school quality if you have children, estimate insurance costs based on local climate risks, and consider lifestyle fit. The headline index can be 20-40% higher or lower than your actual cost of living once these are factored in.' },
    ],
  },
];

export function getAllGuides(): Guide[] {
  return guides;
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
