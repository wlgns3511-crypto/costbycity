/**
 * COL Glossary — 50 entries × 5 categories.
 *
 * Phase B-3 (scaffold + content). All entries handwritten with primary-source citations.
 * Veto #7 status: CLEAR — definitions paraphrased from primary federal sources.
 */

export type GlossaryCategory = 'bea' | 'census' | 'hud' | 'energy' | 'general';

export type GlossaryCitation = {
  label: string;
  url: string;
};

export type GlossaryEntry = {
  slug: string;
  term: string;
  category: GlossaryCategory;
  shortDef: string;
  body: string; // markdown-ish plain text, paragraphs separated by \n\n
  citations: GlossaryCitation[];
  relatedTerms: string[]; // slugs
  lastUpdated: string; // ISO date
};

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { label: string; description: string }> = {
  bea: {
    label: 'BEA Regional Price Parities',
    description: 'Concepts from the U.S. Bureau of Economic Analysis Regional Price Parity program — the canonical federal measure of price level differences across geographies.',
  },
  census: {
    label: 'Census ACS',
    description: 'Concepts from the U.S. Census Bureau American Community Survey (ACS) — the source for income, housing, and household statistics at the metro level.',
  },
  hud: {
    label: 'HUD housing benchmarks',
    description: 'Concepts from U.S. Department of Housing and Urban Development guidance — Fair Market Rent, Area Median Income, cost-burden definitions used in housing policy.',
  },
  energy: {
    label: 'Energy & climate',
    description: 'Heating/cooling degree days, electricity unit economics, and HVAC efficiency metrics used to estimate utility cost differences across climates.',
  },
  general: {
    label: 'COL framework',
    description: 'General cost-of-living concepts: real-vs-nominal dollars, affordability scoring, self-sufficiency standards.',
  },
};

export const GLOSSARY: ReadonlyArray<GlossaryEntry> = [
  // ── BEA Regional Price Parities (12 entries) ─────────────────────────────
  {
    slug: 'regional-price-parity',
    term: 'Regional Price Parity (RPP)',
    category: 'bea',
    shortDef:
      'BEA index measuring price level differences across U.S. states and metropolitan areas, with the U.S. national average set to 100.',
    body:
      `Regional Price Parities (RPPs) are produced annually by the Bureau of Economic Analysis (BEA) and are the only official federal measure of price level differences across geography in the United States. An RPP value of 110 means the geography costs 10% more than the U.S. national average; 90 means 10% less. RPPs are not inflation rates: they compare prices in the *same* year across *different* places, not the same place across years.

The BEA produces RPPs for the 50 states plus the District of Columbia (statewide RPPs, "SARPP") and for all 384+ Metropolitan Statistical Areas ("MARPP"). Each is broken into five expenditure categories: All Items, Goods, Housing, Utilities, and Other Services. Housing is consistently the most variable category — RPPs for Housing range from roughly 60 (low-cost rural metros) to over 200 (San Jose, Honolulu) — while Goods rarely deviates more than ±10 points from the national average.

The methodology uses Consumer Expenditure Survey weights, BLS Consumer Price Index price quotes, and HUD Fair Market Rents for the housing component. RPPs are revised annually, typically with a 16-month lag (2024 RPPs published Feb 2026).

Use RPPs to deflate nominal income or wages: a $70,000 salary in a metro with RPP 130 has the same buying power as $53,800 in a metro with RPP 100. They are the foundation of every comparison on this site.`,
    citations: [
      { label: 'BEA RPP methodology and concepts', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
      { label: 'BEA RPP technical paper (2018 release)', url: 'https://apps.bea.gov/scb/pdf/2018/04-april/0418-regional-price-parities.pdf' },
    ],
    relatedTerms: ['rpp-all-items', 'rpp-housing', 'real-personal-income', 'msa', 'pce-price-index'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'rpp-all-items',
    term: 'RPP: All Items',
    category: 'bea',
    shortDef:
      'Composite Regional Price Parity covering the full consumer market basket; the "headline" RPP value used for general cost-of-living comparison.',
    body:
      `RPP: All Items is the weighted aggregation of the four sub-category RPPs (Goods, Housing, Utilities, Other Services) using Consumer Expenditure Survey weights. It is the single number most commonly cited when journalists or analysts say "the cost of living in San Jose is 30% above the national average."

The aggregation gives Housing a weight of roughly 18% in most metros, but Housing's *variability* is so much larger than the other three categories that Housing alone explains most of the variation in headline RPPs across metros. A metro with RPP-Housing of 200 will almost always have an RPP-All-Items above 110, even if its Goods, Utilities, and Other Services are all below 100.

Headline RPP is the right comparison tool when you are evaluating overall cost of living for a generic household. It is the wrong tool when you want to isolate housing affordability or utility burden — for those, use the sub-category RPP directly. It is also the wrong tool to compare years (use the PCE Price Index for that): RPP normalizes within a single year against the national average, so a metro that became cheaper relative to the U.S. would show a falling RPP even if its absolute prices kept rising.

Site-wide, this is the value rendered as "RPP" on city and state pages without further qualification.`,
    citations: [
      { label: 'BEA RPP statewide table', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
    relatedTerms: ['regional-price-parity', 'rpp-goods', 'rpp-housing', 'rpp-utilities', 'rpp-other-services'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'rpp-goods',
    term: 'RPP: Goods',
    category: 'bea',
    shortDef:
      'Sub-category RPP covering tradeable consumer goods — food, clothing, vehicles, electronics, and household supplies.',
    body:
      `RPP: Goods captures price level differences across U.S. metros for the parts of consumption that are physically traded across state lines. Because goods can be shipped, prices for them tend to converge across geography: most metros sit in a narrow ±5 to ±10 band around the national average of 100.

Where goods prices do diverge, the variation is driven by local sales taxes, transportation costs (Alaska, Hawaii, remote rural metros), and local retail competition. Anchorage and Honolulu typically run 5-15% above the national average for goods due to shipping. Low-tax metros with high competition (suburban Texas, parts of Florida) can run 2-5% below.

Because RPP-Goods has so little spread, a metro's headline RPP is rarely "explained" by goods prices. If a relocation calculator tells you "groceries will cost 30% more in San Francisco," that is almost always wrong: SF's RPP-Goods is typically 105-110, not 130. The 30% figure is conflating goods with the dominant signal of housing.

Use RPP-Goods when you want to validate a cost-of-living claim that focuses on tradeable items (food, retail, vehicles) — and treat any large divergence (>15 points) with skepticism unless you can identify a structural reason (geography, taxation, climate-driven supply).`,
    citations: [
      { label: 'BEA RPP Goods methodology', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
    relatedTerms: ['regional-price-parity', 'rpp-all-items', 'rpp-housing'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'rpp-housing',
    term: 'RPP: Housing',
    category: 'bea',
    shortDef:
      'Sub-category RPP capturing rents and owner-equivalent rent — the largest single source of cost-of-living variation between metros.',
    body:
      `RPP: Housing is built primarily from HUD Fair Market Rent (FMR) data plus owner-equivalent rent estimates from the Consumer Expenditure Survey. It is the most variable of the four RPP sub-categories — and therefore the most useful diagnostic of why a metro is expensive or cheap relative to the U.S. average.

Range observed in the 2024 release: roughly 60 (rural Mississippi, rural Arkansas, parts of West Virginia) to over 220 (San Jose, Honolulu, Santa Cruz). The spread is so wide that RPP-Housing alone explains the majority of the variation in headline RPP.

When evaluating a relocation, compare RPP-Housing rather than headline RPP. A move from RPP-Housing 100 to RPP-Housing 150 means a roughly 50% increase in housing-related cost (rent + property tax + maintenance), which translates to approximately 10-12 percentage points of household income depending on housing tenure (renters bear the full hit; owners with fixed mortgages bear only the property-tax and maintenance components).

Because RPP-Housing is calibrated to FMR, it lags actual market rents by 12-24 months. In metros with rapid rent growth (post-pandemic Sunbelt), real-time market rents may be 10-20% above what RPP-Housing implies.`,
    citations: [
      { label: 'BEA RPP technical methodology', url: 'https://apps.bea.gov/scb/pdf/2018/04-april/0418-regional-price-parities.pdf' },
      { label: 'HUD Fair Market Rents (RPP-Housing input)', url: 'https://www.huduser.gov/portal/datasets/fmr.html' },
    ],
    relatedTerms: ['regional-price-parity', 'rpp-all-items', 'fair-market-rent', 'cost-burdened-renter', 'median-rent'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'rpp-utilities',
    term: 'RPP: Utilities',
    category: 'bea',
    shortDef:
      'Sub-category RPP covering electricity, natural gas, water, and other household utilities — variation tracks climate and grid composition.',
    body:
      `RPP: Utilities captures price level differences for residential utilities across U.S. metros. The principal drivers are wholesale electricity prices (which depend on the local grid mix — coal, natural gas, hydro, nuclear, renewables), state public utility commission rate decisions, and transmission/distribution infrastructure costs.

Range: roughly 75 (Pacific Northwest hydro, parts of Tennessee Valley Authority footprint) to 165+ (Hawaii, parts of New England with high heating-oil dependency, California after the 2020s rate increases). The spread is wide enough that utility cost is a meaningful component of total household burden in extremes.

Note that RPP-Utilities measures the *price* of utilities, not the *quantity* consumed. A household in cold Minnesota consumes far more energy than one in mild San Diego, so total utility *spending* depends on both RPP-Utilities and climate (HDD + CDD). Our \`/cities/{slug}/utility-bill/\` pages combine both: RPP-Utilities tells you the unit price; HDD/CDD tells you how much you'll actually buy.

For long-distance comparisons (e.g., New England vs. Pacific Northwest), the price + quantity interaction can be larger than RPP-Utilities alone suggests.`,
    citations: [
      { label: 'BEA RPP Utilities methodology', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
      { label: 'EIA Average Price of Electricity by State', url: 'https://www.eia.gov/electricity/monthly/' },
    ],
    relatedTerms: ['regional-price-parity', 'heating-degree-day', 'cooling-degree-day', 'kwh'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'rpp-other-services',
    term: 'RPP: Other Services',
    category: 'bea',
    shortDef:
      'Sub-category RPP capturing services other than housing and utilities — healthcare, transportation services, restaurants, education, personal care.',
    body:
      `RPP: Other Services bundles a heterogeneous mix: healthcare, restaurants and meals out, dry cleaning, haircuts, vehicle repair, education and childcare, personal services. Because these services are produced with substantial local labor inputs, their prices correlate strongly with local wages — which in turn correlate with local cost of living.

Spread: roughly 85 to 130. Services in San Jose, Boston, and Manhattan run 20-30% above the national average; services in low-wage rural metros run 10-15% below. Healthcare in particular is sticky and slow to converge: Mississippi healthcare prices have been roughly 90% of the national average for two decades despite catch-up wage growth in adjacent labor markets.

For households with disproportionate service consumption — older households (more healthcare), households with young children (more childcare), households without a car in dense metros (more transit and dining) — RPP-Other-Services may matter more than RPP-Goods. For households with most spending on housing and groceries, RPP-Other-Services is a secondary input.

We do not break this category down further on city pages: the BEA does not publish a sub-decomposition.`,
    citations: [
      { label: 'BEA RPP Other Services methodology', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
    relatedTerms: ['regional-price-parity', 'rpp-all-items', 'rpp-goods', 'rpp-housing'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'pce-price-index',
    term: 'PCE Price Index',
    category: 'bea',
    shortDef:
      'BEA price index used by the Federal Reserve as its preferred inflation gauge; the deflator used to convert nominal dollars to real dollars over time.',
    body:
      `The Personal Consumption Expenditures (PCE) Price Index is published monthly by the Bureau of Economic Analysis as part of the National Income and Product Accounts (NIPA Table 1.1.4). It measures the change in prices paid by U.S. consumers for goods and services, and is the inflation gauge the Federal Reserve targets at 2% annual growth.

Where the BLS Consumer Price Index (CPI) holds the consumption basket fixed for two years and updates discretely, the PCE Price Index uses a chain-weighted methodology that allows the basket to shift continuously as households substitute (away from beef toward chicken when beef prices rise, etc.). As a result, PCE typically reports inflation 0.3-0.5 percentage points lower than CPI in any given year, and the gap compounds over decades.

Use the PCE Price Index to convert nominal dollars across years. A $70,000 Boise salary in 2008 has the same buying power as approximately $98,000 in 2024 dollars (PCE went from 88.4 to 124.0, a 40.3% cumulative increase). This is the basis for the real-vs-nominal toggle on city pages.

Do *not* confuse PCE Price Index with Regional Price Parity. PCE moves *time*; RPP moves *place*. To compare 2008 Boise to 2024 San Francisco, you need both: deflate Boise 2008 to 2024 dollars with PCE, then apply the SF/Boise RPP ratio.`,
    citations: [
      { label: 'BEA NIPA Table 1.1.4 (PCE Price Index)', url: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index' },
      { label: 'FRED series PCEPI', url: 'https://fred.stlouisfed.org/series/PCEPI' },
    ],
    relatedTerms: ['regional-price-parity', 'real-personal-income', 'inflation', 'cpi-vs-pce', 'nominal-vs-real'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'personal-consumption-expenditures',
    term: 'Personal Consumption Expenditures (PCE)',
    category: 'bea',
    shortDef:
      'BEA measure of total household spending on goods and services; the largest component of U.S. GDP and the basis for the PCE Price Index.',
    body:
      `Personal Consumption Expenditures (PCE) is the headline measure of consumer spending in the United States, published monthly by the Bureau of Economic Analysis. It captures every dollar households spend on goods and services — durables (cars, appliances), nondurables (food, clothing), and services (healthcare, housing, restaurants) — and represents roughly 68% of U.S. Gross Domestic Product.

PCE is reported in two versions: nominal (current dollars) and real (chained 2017 dollars, deflated by the PCE Price Index). The real series is what economists track to identify cyclical changes in consumer demand independent of inflation.

For cost-of-living analysis, the PCE *categories* matter: housing-and-utilities is roughly 18% of PCE in a typical year, food-and-beverages 8%, transportation 10%, healthcare 16%, recreation 8%, education 2%. These category weights are what BEA uses to aggregate sub-category RPPs into the headline RPP All Items value, and they are similar (but not identical) to the BLS Consumer Expenditure Survey weights used for CPI.

When you see "the average household spends X% on housing," the figure is usually from PCE or from the BLS Consumer Expenditure Survey. The two surveys differ by 1-2 percentage points on most categories.`,
    citations: [
      { label: 'BEA Personal Consumption Expenditures', url: 'https://www.bea.gov/data/consumer-spending/main' },
    ],
    relatedTerms: ['pce-price-index', 'regional-price-parity', 'cpi-vs-pce'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'msa',
    term: 'Metropolitan Statistical Area (MSA)',
    category: 'bea',
    shortDef:
      'OMB-defined geographic unit consisting of one or more counties anchored by an urban core of 50,000+ population; the standard unit for federal metro economic data.',
    body:
      `A Metropolitan Statistical Area (MSA) is a county-based geography defined by the Office of Management and Budget for federal statistical reporting. An MSA contains at least one urbanized core of 50,000 or more inhabitants, plus adjacent counties that have a high degree of economic and social integration with that core (measured by commuting flow).

The U.S. has 384-388 MSAs depending on the OMB delineation vintage (boundaries are revised every decade following the Decennial Census, with smaller adjustments after the 2008-2018 redelineations). Examples: "Los Angeles-Long Beach-Anaheim, CA" is one MSA spanning two counties; "New York-Newark-Jersey City, NY-NJ-PA" spans three states.

This site uses the BEA's MARPP delineation (Metropolitan Area Regional Price Parities), which tracks the OMB MSA list with one important caveat: BEA uses the MSA boundary *as of the data year*, so a 2008 RPP and a 2024 RPP for "Salt Lake City" may reflect slightly different geographic footprints. Boundary changes are noted on the trend chart with a "boundary changed YYYY" annotation.

For more granular geography (counties within an MSA, neighborhoods within a city), federal RPP data does not exist — those require ZIP-level rent and price data that no federal agency publishes.`,
    citations: [
      { label: 'OMB MSA delineation files', url: 'https://www.census.gov/programs-surveys/metro-micro/about/delineation-files.html' },
    ],
    relatedTerms: ['regional-price-parity', 'geofips', 'census-tract'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'geofips',
    term: 'GeoFIPS Code',
    category: 'bea',
    shortDef:
      'BEA-assigned geographic identifier — 5 digits for state-level (state FIPS + "000"), 5 digits for MSA (MSA code).',
    body:
      `GeoFIPS is the geographic identifier the BEA uses in regional data files. State-level rows use a 5-digit code formed from the 2-digit Census state FIPS plus three trailing zeroes: California is "06000," Texas is "48000," New York is "36000," and the District of Columbia is "11000." MSA rows use the 5-digit MSA code: Los Angeles-Long Beach-Anaheim is "31080," New York-Newark-Jersey City is "35620."

Within a year of BEA data, every row has a unique GeoFIPS. Across years, a metro's GeoFIPS *typically* remains stable, but boundary changes following decennial Census redelineations may cause an MSA to split, merge, or rename — in which case the GeoFIPS may change. We track these changes and annotate the chart when they occur.

For programmatic use, GeoFIPS is the join key: every BEA RPP row in our database is keyed by GeoFIPS + year + category. The metros table maps GeoFIPS to a URL slug ("31080" → "los-angeles-long-beach-anaheim-ca" or the shorter "los-angeles-ca" used in our routes).

State-level GeoFIPS are also used for state pages; territorial GeoFIPS (Puerto Rico "72000," etc.) appear in some BEA data but are not part of this site's coverage.`,
    citations: [
      { label: 'BEA Glossary: GeoFIPS', url: 'https://apps.bea.gov/regional/docs/dataload.cfm' },
    ],
    relatedTerms: ['msa', 'regional-price-parity'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'per-capita-personal-income',
    term: 'Per Capita Personal Income (PCPI)',
    category: 'bea',
    shortDef:
      'BEA measure of total personal income divided by population, reported annually for states and MSAs.',
    body:
      `Per Capita Personal Income (PCPI) is total Personal Income (wages and salaries + transfer receipts + property income + proprietors' income) divided by population, computed by the BEA at the state and MSA level. It is the standard federal measure of "average income per person" in a geography.

PCPI is *nominal*. To compare across geographies, you must apply the matching year's RPP — a metro with PCPI $60,000 and RPP 100 has the same buying power as a metro with PCPI $70,000 and RPP 117. The RPP-deflated version is called Real Per Capita Personal Income (RPCPI), which BEA also publishes.

PCPI is *not* the same as median household income from Census ACS. PCPI is per-person; ACS median household income is per-household and uses the median (not the mean). PCPI runs 25-40% lower than ACS median household income simply because households contain more than one person.

Use PCPI when you want a clean apples-to-apples income comparison across geographies that aligns with BEA RPP. Use ACS median household income when you want a measure that better reflects how an individual household experiences cost of living.`,
    citations: [
      { label: 'BEA Personal Income by County and Metropolitan Area', url: 'https://www.bea.gov/data/income-saving/personal-income-county-metro-and-other-areas' },
    ],
    relatedTerms: ['real-personal-income', 'median-household-income', 'regional-price-parity'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'real-personal-income',
    term: 'Real Personal Income (RPCPI)',
    category: 'bea',
    shortDef:
      'BEA measure of per capita personal income deflated by Regional Price Parity, expressed in constant national-average dollars.',
    body:
      `Real Per Capita Personal Income (RPCPI) is BEA's RPP-deflated version of nominal PCPI. The formula is straightforward: \`RPCPI = PCPI / (RPP / 100)\`. A metro with PCPI $60,000 and RPP 100 has RPCPI $60,000; a metro with PCPI $70,000 and RPP 117 has RPCPI $59,800 — i.e., the higher nominal income is fully offset by the higher cost of living.

This is the metric to use when ranking metros by genuine purchasing power, and it sometimes inverts intuition: high-income coastal metros that look prosperous in nominal PCPI rankings (San Jose, San Francisco, Manhattan) often rank lower in RPCPI than their inland and Sunbelt peers, because their RPP runs 130-150 vs. the U.S. average 100.

BEA publishes RPCPI annually for states and MSAs in the same release as the underlying RPP and PCPI series. We display this calculation on every state and city page as the "real income" or "purchasing power" metric, alongside the nominal income.

RPCPI does not adjust for *time* — for that, layer the PCE Price Index on top: a 2008 RPCPI and a 2024 RPCPI are in their own respective years' national-average dollars, not in a constant base year. The site's "real-vs-nominal toggle" handles both adjustments simultaneously.`,
    citations: [
      { label: 'BEA Real Personal Income by State and Metro Area', url: 'https://www.bea.gov/data/income-saving/real-personal-income-states-and-metropolitan-areas' },
    ],
    relatedTerms: ['per-capita-personal-income', 'regional-price-parity', 'pce-price-index', 'purchasing-power'],
    lastUpdated: '2026-05-02',
  },

  // ── Census ACS (10 entries) ──────────────────────────────────────────────
  {
    slug: 'american-community-survey',
    term: 'American Community Survey (ACS)',
    category: 'census',
    shortDef:
      'Annual U.S. Census Bureau survey of approximately 3.5 million households; the source for nearly all sub-state demographic, housing, and income statistics.',
    body:
      `The American Community Survey (ACS) is conducted by the U.S. Census Bureau and replaces the old "long form" of the decennial census. Every year, the ACS samples approximately 3.5 million addresses, asking detailed questions about income, housing tenure, rent, home value, commute, education, and dozens of other characteristics. It is the only federal source for most of these variables at the metro, county, tract, and ZIP-code level.

ACS data is published in two flavors: 1-year estimates (available for geographies of 65,000+ population, more current but more variable) and 5-year estimates (available for *all* geographies, more stable but lagged). For metro-level cost-of-living analysis, the 5-year estimates are the standard: they smooth survey noise and cover small metros that 1-year estimates miss.

ACS variables are identified by codes like B19013_001E (median household income, in dollars) and B25064_001E (median gross rent). Each estimate comes with a Margin of Error (MOE) at the 90% confidence level — a critical caveat we apply when filtering data on this site (estimates with relative MOE > 30% are flagged unreliable).

ACS lags by 12-18 months: 2024 5-year estimates were published in late 2025. We refresh from ACS annually.`,
    citations: [
      { label: 'Census ACS overview', url: 'https://www.census.gov/programs-surveys/acs' },
      { label: 'ACS technical documentation', url: 'https://www.census.gov/programs-surveys/acs/technical-documentation.html' },
    ],
    relatedTerms: ['median-household-income', 'median-rent', 'median-home-value', 'margin-of-error', 'five-year-estimate'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'median-household-income',
    term: 'Median Household Income',
    category: 'census',
    shortDef:
      'ACS variable B19013: the median annual income of all households in a geography. The standard "average income" figure cited in popular media.',
    body:
      `Median Household Income is the dollar value at which exactly half of the households in a geography earn more, and half earn less. It is published by the Census ACS as variable B19013 and is the most commonly cited "average income" statistic in U.S. media.

The median is more useful than the mean for cost-of-living analysis because it is robust to extreme high earners. A metro with one billionaire and a thousand $50K households has a *mean* income near $1M but a *median* of $50K. The median tells you what a typical household actually earns; the mean tells you what they would earn if income were distributed evenly.

ACS reports the median for the household — the people living together at one address, regardless of relationship. Median *family* income (B19119) excludes single-person households and roommate situations, and runs 15-25% higher than median household income. Median *worker* earnings (B20002) are per-individual and lower again. We use household income because it is the unit at which housing costs are paid and consumption decisions are made.

For the affordability score on this site, we use the ratio of median household income to median rent × 12 to compute the rent-to-income share — the classic 30% threshold for "cost-burdened" derives from this calculation.`,
    citations: [
      { label: 'Census ACS B19013 documentation', url: 'https://api.census.gov/data/2024/acs/acs5/variables/B19013_001E.html' },
    ],
    relatedTerms: ['american-community-survey', 'median-rent', 'cost-burdened-renter', 'affordability-score'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'median-rent',
    term: 'Median Gross Rent',
    category: 'census',
    shortDef:
      'ACS variable B25064: median monthly rent paid by renter-occupied households, including utilities. Distinct from contract rent (rent only).',
    body:
      `Median Gross Rent (ACS B25064) reports the median monthly rent that occupied renter households pay, including any tenant-paid utilities (electricity, gas, water, sewer, trash). It is the more commonly cited rent statistic because it reflects the household's full housing cash outflow.

The companion variable, Median Contract Rent (B25058), reports rent only. Gross rent typically runs $100-200 above contract rent depending on which utilities tenants pay vs. which are bundled.

ACS gross rent is *occupied-unit* rent — rent paid by households actually living in their unit, weighted toward longer-lease tenancies that may be below market. It is *not* asking rent for newly-listed apartments. In rapidly-rising markets (2021-2023 Sunbelt, post-pandemic mid-sized metros), market asking rents on Zillow or Apartment List can run 10-25% above ACS gross rent for the same metro for the same year.

For long-term affordability analysis (lease renewal scenarios, multi-year planning), ACS gross rent is the right metric. For "what will my first month look like" if you are about to sign a new lease, supplement with current asking-rent data from RealPage / CoStar / Zillow.`,
    citations: [
      { label: 'Census ACS B25064 documentation', url: 'https://api.census.gov/data/2024/acs/acs5/variables/B25064_001E.html' },
    ],
    relatedTerms: ['american-community-survey', 'median-household-income', 'fair-market-rent', 'cost-burdened-renter'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'median-home-value',
    term: 'Median Home Value',
    category: 'census',
    shortDef:
      'ACS variable B25077: the median self-reported value of owner-occupied housing units in a geography.',
    body:
      `Median Home Value (ACS B25077) is the median *self-reported* value of owner-occupied homes — i.e., owners are asked "What do you think your home is worth?" rather than measuring transaction prices. It is the federal benchmark for owner-occupied housing wealth at the metro level.

Self-reporting introduces two known biases: owners in stable or appreciating markets tend to overestimate slightly (anchoring on recent neighbor sales they observed), and owners in declining markets tend to underestimate or refuse to answer. Despite these biases, ACS B25077 tracks recorded transaction prices from Zillow's ZHVI series within ±5% in most metros, so it is a reliable summary of housing wealth.

ACS home value is *not* the right metric for "what does it cost to buy here today" — for that, use a transaction-based index (Zillow ZHVI, Redfin, Case-Shiller). ACS measures the stock of existing owners' equity, which is a different question. In rapidly-appreciating markets, ZHVI can run 15-25% above ACS B25077 in the most recent year.

We display median home value alongside median rent to characterize each metro's housing market. The price-to-rent ratio (median home value / annual rent × 12) is a useful rough check on whether a metro favors buying or renting.`,
    citations: [
      { label: 'Census ACS B25077 documentation', url: 'https://api.census.gov/data/2024/acs/acs5/variables/B25077_001E.html' },
    ],
    relatedTerms: ['american-community-survey', 'median-rent', 'price-to-rent-ratio'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'margin-of-error',
    term: 'Margin of Error (MOE)',
    category: 'census',
    shortDef:
      'Statistical confidence interval published with every ACS estimate; relative MOE > 30% indicates an estimate too uncertain to use in comparison.',
    body:
      `Every ACS estimate is published with a Margin of Error (MOE) at the 90% confidence level. The MOE quantifies the survey-sampling uncertainty: a median household income estimate of $65,000 with MOE ±$2,000 means we are 90% confident the true median is between $63,000 and $67,000.

The relative MOE — MOE divided by the estimate, expressed as a percentage — is the standard reliability check. Census Bureau guidance is that estimates with relative MOE > 30% should be used with caution, and many researchers treat them as effectively unreliable.

Smaller geographies have larger MOEs because fewer households in the sample fall in that geography. A median income for the U.S. nationally has a MOE of ±$200; the same variable for a small rural county might have a MOE of ±$8,000. Five-year ACS estimates have smaller MOEs than 1-year estimates because the sample is pooled across five years.

This site applies a relative MOE > 30% filter when fetching ACS data: counties or metros with unreliable income, rent, or home value estimates render a "data-suppressed" notice rather than misleading numbers. The filter is applied per-variable, so a metro can have reliable rent but suppressed income.`,
    citations: [
      { label: 'Census ACS Accuracy of the Data', url: 'https://www.census.gov/programs-surveys/acs/library/handbooks/general.html' },
    ],
    relatedTerms: ['american-community-survey', 'five-year-estimate'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'five-year-estimate',
    term: 'ACS 5-Year Estimate',
    category: 'census',
    shortDef:
      'ACS estimate that pools 60 months of survey responses; available for all U.S. geographies and the standard for metro-level analysis.',
    body:
      `ACS 5-Year Estimates pool survey responses across 60 consecutive months. The 2024 5-Year Estimate, for example, includes data collected from January 2020 through December 2024. The pooling reduces sampling error — Margins of Error are typically 50-70% smaller than for the corresponding 1-Year Estimate — and allows publication for geographies as small as census tracts and ZIP codes.

The trade-off is currency: a 5-Year Estimate is an *average* over five years, so it lags real-world conditions and smooths over rapid changes. In a metro that experienced a sharp post-2020 rent jump, the 2024 5-Year Estimate of median rent will run lower than the 2024 1-Year Estimate (which weights only 2024) because the 5-Year Estimate is partly reflecting 2020-2022 rents.

For small geographies (counties under 65,000 population, all census tracts and ZIP codes), only 5-Year Estimates are available. For metro-level analysis, both are available; we use 5-Year Estimates throughout this site for consistency and because the smaller MOE outweighs the modest staleness.

The Census Bureau publishes the 5-Year Estimate annually, typically in the December following the data window close. The 2024 5-Year Estimate was released December 2025.`,
    citations: [
      { label: 'Census ACS 5-Year Estimate user guide', url: 'https://www.census.gov/programs-surveys/acs/guidance/estimates.html' },
    ],
    relatedTerms: ['american-community-survey', 'margin-of-error', 'one-year-estimate'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'one-year-estimate',
    term: 'ACS 1-Year Estimate',
    category: 'census',
    shortDef:
      'ACS estimate based on a single calendar year of survey responses; available only for geographies of 65,000+ population.',
    body:
      `ACS 1-Year Estimates report data collected within a single calendar year. The 2024 1-Year Estimate, for example, includes only responses returned during 2024. Because the underlying sample is one-fifth the size of the 5-Year sample, MOEs are roughly 2.2 times larger, and estimates are only published for geographies with population above 65,000 (about 800 of 3,143 U.S. counties and all 384 MSAs).

1-Year Estimates are the right choice when timeliness matters more than precision: tracking year-over-year changes in metro median rent, identifying inflection points after policy changes or economic shocks, comparing this year's median household income to last year's at the metro level. The Census publishes them in September of the following year (2024 1-Year released September 2025).

For most analytical purposes on this site, we prefer 5-Year Estimates because they have smaller MOEs and cover all geographies. We surface 1-Year Estimates only when discussing year-over-year changes in metros where the change is large enough to exceed the MOE bands.

Note: the Census Bureau temporarily suspended 1-Year Estimate publication for 2020 due to COVID-related data collection disruption; only the 5-Year version covers that year.`,
    citations: [
      { label: 'Census ACS 1-Year vs 5-Year guidance', url: 'https://www.census.gov/programs-surveys/acs/guidance/estimates.html' },
    ],
    relatedTerms: ['american-community-survey', 'five-year-estimate', 'margin-of-error'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'census-tract',
    term: 'Census Tract',
    category: 'census',
    shortDef:
      'Small statistical subdivision of a county designed to contain 1,200-8,000 residents, used for sub-metro demographic analysis.',
    body:
      `A Census Tract is a small geographic subdivision of a county defined by the Census Bureau, typically containing between 1,200 and 8,000 residents (target 4,000). Tract boundaries are reviewed and revised every decade after the Decennial Census. The U.S. has approximately 73,000 tracts.

Tracts are the standard unit for sub-metro demographic analysis: poverty rates, housing tenure mix, race/ethnicity composition, school zone demographics. Within a single MSA, tracts vary enormously — a wealthy suburban tract may have median household income $180,000 while an adjacent urban tract has $35,000.

For cost-of-living analysis, tract-level data is relevant when you are comparing neighborhoods within a single metro. Federal RPP data does *not* exist at the tract level — RPP is computed for MSAs only. To approximate tract-level cost differences, analysts often use ACS B25064 (median rent) at the tract scale, which is the largest sub-metro housing-cost signal available.

This site's coverage is metro-level (MSA), not tract-level. Tract-level cost analysis is a candidate for future expansion but requires a different data layer (HUD Small Area FMR, ACS tract-level housing variables) and adds substantial cardinality (73,000 tracts vs. 384 MSAs).`,
    citations: [
      { label: 'Census Tract methodology', url: 'https://www.census.gov/programs-surveys/geography/about/glossary.html' },
    ],
    relatedTerms: ['american-community-survey', 'msa'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'householder',
    term: 'Householder',
    category: 'census',
    shortDef:
      'Census term for the person whose name is on the deed or lease; the reference person used to characterize the household.',
    body:
      `In Census surveys, the Householder is the person in whose name the housing unit is owned, being bought, or rented. If two adults co-own or co-lease, the householder is the one identified as such on the form (typically by the respondent). Variables like householder age, householder race, and householder educational attainment are used to characterize the household as a whole.

The concept replaced the older "head of household" terminology starting with the 1980 Census, both for substantive reasons (the older term presumed a male head) and for technical reasons (it allows non-family households like roommates to have a clear reference person).

For affordability analysis, the householder's income is *not* the household's income — household income includes earnings of all members 15+. The householder is used to assign a household's race, ethnicity, and age category for cross-tabulation purposes.

If you encounter a Census table broken down by householder characteristics (e.g., median household income by householder age), the figure refers to *household income for households where the householder has that characteristic*, not the householder's individual income. This distinction matters in affordability research where senior-headed households (65+) often have lower individual earnings but supplemented household income from spouses, transfers, or returns on accumulated wealth.`,
    citations: [
      { label: 'Census glossary: Householder', url: 'https://www.census.gov/programs-surveys/cps/technical-documentation/subject-definitions.html' },
    ],
    relatedTerms: ['american-community-survey', 'median-household-income'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'cost-burdened-renter',
    term: 'Cost-Burdened Renter',
    category: 'census',
    shortDef:
      'A renter household paying more than 30% of gross income on housing costs; the federal definition of housing-cost burden.',
    body:
      `A Cost-Burdened Renter is a household paying more than 30% of its gross income on rent and utilities (gross rent). The 30% threshold is enshrined in HUD program regulations and used by Census ACS in standard tabulations (B25070 series for renters, B25091 for owners with mortgages).

A renter paying 50% or more of income on housing is classified as Severely Cost-Burdened. About 22 million U.S. households are cost-burdened in the most recent ACS data (2024 5-Year), of which roughly 10 million are severely cost-burdened. Cost burden is concentrated in high-RPP coastal metros and among renters with household income below the local median.

This site's affordability score is derived from this concept: we compute (median rent × 12) / median household income for each metro, and rate metros where the ratio exceeds 30% as cost-stressed. About 80 of the 384 metros we cover have a median renter who is cost-burdened by this definition.

The 30% threshold is a rough heuristic — it descends from a 1969 amendment to the Housing Act and has never been formally updated. Some housing researchers argue 35% or 40% is more appropriate at higher income levels (where more income remains after housing). For our purposes we use the standard 30% definition for consistency with HUD programs and ACS reporting.`,
    citations: [
      { label: 'Census ACS B25070 (gross rent as % of income)', url: 'https://api.census.gov/data/2024/acs/acs5/variables/B25070_001E.html' },
      { label: 'HUD Affordable Housing definition', url: 'https://www.huduser.gov/portal/glossary/glossary.html' },
    ],
    relatedTerms: ['median-rent', 'median-household-income', 'fair-market-rent', 'severely-cost-burdened', 'affordability-score'],
    lastUpdated: '2026-05-02',
  },

  // ── HUD housing benchmarks (10 entries) ───────────────────────────────────
  {
    slug: 'fair-market-rent',
    term: 'Fair Market Rent (FMR)',
    category: 'hud',
    shortDef:
      'HUD-published rent benchmark used to calibrate Housing Choice Voucher payment standards; typically the 40th percentile of recent-mover gross rent.',
    body:
      `HUD's Fair Market Rent (FMR) is the gross rent (rent + tenant-paid utilities) at which a "modest, non-luxury" rental unit would be expected to rent in a given area. HUD publishes FMRs annually for every U.S. county and metro area at the unit-size level: 0BR (efficiency), 1BR, 2BR, 3BR, 4BR.

The default FMR methodology sets the FMR at the 40th percentile of gross rent for recent-mover households (those who moved into their current unit within the past 24 months) in the local area, based on ACS data plus an inflation adjustment. In high-cost coastal metros HUD may use the 50th percentile to better track market conditions.

FMR is the principal input to two policies: (1) the Housing Choice Voucher (Section 8) Payment Standard, which sets the maximum subsidy a voucher will pay; and (2) the LIHTC rent caps that determine maximum rent in tax-credit-financed affordable units.

On this site, FMR values feed into the affordability score's housing-cost benchmark and into the BEA RPP-Housing component (BEA uses FMR as one input to their housing price index). FMR data is published in late September each year for the following federal fiscal year (FY26 FMRs released September 2025).`,
    citations: [
      { label: 'HUD Fair Market Rents', url: 'https://www.huduser.gov/portal/datasets/fmr.html' },
      { label: 'HUD FMR methodology', url: 'https://www.huduser.gov/portal/datasets/fmr/fmrs/docsys.html' },
    ],
    relatedTerms: ['median-rent', 'rpp-housing', 'cost-burdened-renter', 'section-8-voucher', 'lihtc'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'area-median-income',
    term: 'Area Median Income (AMI)',
    category: 'hud',
    shortDef:
      'HUD-published median family income for a metro area, used as the calibration point for income-eligibility tiers in housing programs.',
    body:
      `Area Median Income (AMI) is HUD's annual statement of median family income for each MSA and non-metro county, derived from Census ACS plus inflation adjustments. AMI is the calibration point for nearly every federal housing assistance program: eligibility limits are stated as a fraction of AMI (50% AMI, 80% AMI, 120% AMI, etc.).

For a household of four, "60% AMI" in a metro with AMI $100,000 means a household earning up to $60,000 qualifies for that program. HUD adjusts AMI for household size: a one-person household at "60% AMI" qualifies at 70% of the four-person threshold (approximately $42,000 in our example).

AMI is published in early April each year for the following federal fiscal year. It uses the most recent ACS 5-Year Estimate plus a Department of Commerce inflation factor to bring the figure forward to the program year.

On this site, we use AMI to characterize each metro's affordability tiers — a metro with AMI $80,000 has different affordability dynamics than one with $140,000, even at similar RPP levels. AMI tier eligibility (low-income at 80% AMI, very-low-income at 50% AMI, extremely-low-income at 30% AMI) is the federal definition that drives most subsidy programs.`,
    citations: [
      { label: 'HUD Area Median Income', url: 'https://www.huduser.gov/portal/datasets/il.html' },
    ],
    relatedTerms: ['fair-market-rent', 'ami-tier-50', 'ami-tier-80', 'median-household-income', 'lihtc'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'severely-cost-burdened',
    term: 'Severely Cost-Burdened',
    category: 'hud',
    shortDef:
      'A household paying more than 50% of gross income on housing; HUD\'s most acute housing-cost-stress classification.',
    body:
      `Severely Cost-Burdened describes a household paying more than 50% of its gross income on housing costs — rent + utilities for renters, mortgage + property tax + insurance + utilities for owners. The threshold is set by HUD and used in Census ACS reporting (B25070_010E for renters paying 50%+).

About 10 million U.S. households are severely cost-burdened, roughly 9% of all households. The share is highest among:
- Renters in high-RPP coastal metros (San Francisco, Los Angeles, Boston, NYC) where median rent runs $2,500-$3,500
- Households below the local 30% AMI threshold
- Senior renters (65+) on fixed retirement income

A severely cost-burdened household has roughly half its income left for everything that is not housing — food, healthcare, transportation, savings. Research consistently shows this group has elevated risk of food insecurity, deferred medical care, and eviction.

For metro-level analysis, the share of renter households in the 50%+ bucket is a useful supplementary metric beyond the 30%-cost-burdened share. A metro can have moderate overall cost-burden (40% of renters >30%) but extreme severe burden (15% of renters >50%) — typically a sign of high-rent metros with insufficient subsidized stock.`,
    citations: [
      { label: 'HUD Comprehensive Housing Affordability Strategy data', url: 'https://www.huduser.gov/portal/datasets/cp.html' },
    ],
    relatedTerms: ['cost-burdened-renter', 'fair-market-rent', 'area-median-income'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'hud-income-limits',
    term: 'HUD Income Limits',
    category: 'hud',
    shortDef:
      'Annual HUD-published income eligibility thresholds for housing programs, expressed as fractions of Area Median Income.',
    body:
      `HUD Income Limits are the dollar thresholds that determine eligibility for federal housing assistance, computed from Area Median Income. The standard tiers are:
- Extremely Low Income: 30% of AMI (or the federal poverty level, whichever is greater)
- Very Low Income: 50% of AMI
- Low Income: 80% of AMI
- Moderate Income: 120% of AMI (used for some programs)

Limits are adjusted for household size: a four-person household at 80% AMI is the headline, but eligibility for a one-person household runs at 70% of the four-person threshold and so on up to eight persons (132% of four-person).

HUD publishes Income Limits in early April for the following federal fiscal year, using ACS 5-Year Estimate inputs plus a CPI-adjusted forward bring-up. The Income Limits feed into Section 8 voucher eligibility, public housing income screens, LIHTC tenant-eligibility caps, and HOME program limits.

On this site we don't show individual program eligibility (different programs use different definitions of "income"), but the Income Limit tiers are useful for characterizing a metro's affordability landscape: a metro where 80% AMI for a 4-person household is $90,000 has a much wider band of subsidy-eligible households than one where it is $55,000.`,
    citations: [
      { label: 'HUD FY 2026 Income Limits', url: 'https://www.huduser.gov/portal/datasets/il.html' },
    ],
    relatedTerms: ['area-median-income', 'ami-tier-50', 'ami-tier-80', 'section-8-voucher'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'section-8-voucher',
    term: 'Housing Choice Voucher (Section 8)',
    category: 'hud',
    shortDef:
      'Federal rental subsidy that pays the difference between 30% of household income and the local Payment Standard (typically near FMR).',
    body:
      `The Housing Choice Voucher (HCV) program — historically called "Section 8" after its enabling legislation — is the largest U.S. federal rental subsidy. HUD funds local Public Housing Authorities (PHAs) to issue vouchers to income-eligible households (50% AMI or below). Voucher holders rent on the private market; the PHA pays the landlord the difference between 30% of the household's adjusted income and a Payment Standard typically set at 90-110% of the local Fair Market Rent.

Vouchers are portable: a voucher issued in one metro can be used to lease in another metro that participates in the program. In practice, mobility is constrained by waiting lists (often 2-5+ years), landlord refusal to accept vouchers (legal in most states), and insufficient supply of units priced at or below the Payment Standard.

About 2.3 million households use Housing Choice Vouchers — roughly 5% of all U.S. renters and a small fraction of those eligible. Voucher availability varies dramatically by metro: some PHAs have closed waitlists for years, others issue new vouchers periodically.

For cost-of-living analysis, voucher holders effectively cap their housing burden at 30% of income, but their experience of the metro's amenities and access depends on which neighborhoods accept vouchers — a question of supply that doesn't show up in median-rent statistics.`,
    citations: [
      { label: 'HUD Housing Choice Voucher Program', url: 'https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/about/fact_sheet' },
    ],
    relatedTerms: ['fair-market-rent', 'area-median-income', 'cost-burdened-renter'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'lihtc',
    term: 'Low-Income Housing Tax Credit (LIHTC)',
    category: 'hud',
    shortDef:
      'Federal tax-credit program that finances affordable rental housing development; rents in LIHTC units are capped at fractions of Area Median Income.',
    body:
      `The Low-Income Housing Tax Credit (LIHTC) is the largest U.S. federal program for producing new affordable rental housing. State Housing Finance Agencies allocate tax credits to developers, who use them to attract equity investment in affordable rental projects. In exchange, developers must restrict rents and tenant incomes for at least 30 years (often longer in practice).

LIHTC rents are capped relative to Area Median Income. A typical project must reserve units at:
- 60% AMI rent for 60% AMI households (the most common tier), or
- a mix where the average is 60% AMI

Maximum LIHTC rent for a two-bedroom unit at 60% AMI is calculated as 30% of (60% × HUD's "AMI assuming 1.5 persons/bedroom" = 90% of 4-person AMI) divided by 12 months. For most metros, this works out to 60-80% of the local Fair Market Rent.

LIHTC has financed roughly 3.7 million affordable units since 1986 — about 22% of all U.S. multifamily housing built in that period. The supply is not evenly distributed: high-cost coastal metros have far less LIHTC stock per capita than the national average because cost-of-construction often exceeds what tax credits can finance.

On this site, the volume of LIHTC stock isn't a metric we display, but the LIHTC rent cap is one of two reasons (alongside Section 8) that the *advertised* affordable rent in a metro can be substantially below the open-market median rent.`,
    citations: [
      { label: 'HUD LIHTC database', url: 'https://www.huduser.gov/portal/datasets/lihtc.html' },
    ],
    relatedTerms: ['area-median-income', 'fair-market-rent', 'ami-tier-50', 'ami-tier-80'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'ami-tier-50',
    term: '50% AMI Tier',
    category: 'hud',
    shortDef:
      'HUD\'s "Very Low Income" eligibility tier — household income at 50% of Area Median Income, the cutoff for most rental assistance programs.',
    body:
      `The 50% AMI tier — formally "Very Low Income" in HUD nomenclature — is the eligibility threshold for the Housing Choice Voucher program (HCV / Section 8) and most Public Housing income screens. Households below this threshold qualify; those above don't.

For a four-person household, 50% AMI ranges from $35,000 (lowest-income rural metros) to $90,000+ (Bay Area, Boston). This wide spread reflects the underlying AMI variation. In high-AMI metros, the 50% tier reaches well into what nominal income alone would call "middle class" — a $90,000 household in San Francisco can technically qualify for a Section 8 voucher.

This is intentional. HUD calibrates eligibility to the local cost of living rather than to a national income level, on the principle that what counts as "low income" depends on what housing in your metro costs. A metro with median rent $3,000 has different cost dynamics than one with median rent $1,000, even if the household's nominal income is the same.

The 30% AMI sub-tier (Extremely Low Income) carves out the most acute need cases — households below 30% AMI face the highest cost burden risk and the largest gap between what they can pay (30% of income) and market rent.`,
    citations: [
      { label: 'HUD Income Limits documentation', url: 'https://www.huduser.gov/portal/datasets/il.html' },
    ],
    relatedTerms: ['area-median-income', 'hud-income-limits', 'ami-tier-80', 'section-8-voucher'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'ami-tier-80',
    term: '80% AMI Tier',
    category: 'hud',
    shortDef:
      'HUD\'s "Low Income" eligibility tier — the standard threshold for many affordable-housing development programs and homeownership assistance.',
    body:
      `The 80% AMI tier — "Low Income" in HUD nomenclature — is the most commonly used eligibility threshold for housing programs aimed at working families. The HOME Investment Partnerships Program, the LIHTC program (in its standard form), HUD's homeownership assistance programs, and many state and local affordable housing programs cap eligibility at 80% AMI.

For a four-person household, 80% AMI ranges from $56,000 (lowest-income rural metros) to over $140,000 (high-AMI coastal metros). The wide spread is the same dynamic as the 50% tier: HUD calibrates to local cost of living, not a national income figure.

The 80% tier is structurally significant in cost-of-living analysis because it is the income level at which many U.S. households "fall through the cracks" — they earn too much for Section 8 (50% AMI) but too little to comfortably afford open-market rents in high-RPP metros. Households between 50% and 100% AMI in coastal metros are statistically the most cost-burdened group.

On this site, comparing a metro's 80% AMI dollar value to its median rent is a useful affordability indicator. In a healthy metro, an 80% AMI four-person household should be able to rent a 2BR unit without being cost-burdened — i.e., 80% AMI / 12 / 0.30 should exceed the 2BR FMR. Many high-cost metros fail this test.`,
    citations: [
      { label: 'HUD Income Limits documentation', url: 'https://www.huduser.gov/portal/datasets/il.html' },
    ],
    relatedTerms: ['area-median-income', 'hud-income-limits', 'ami-tier-50', 'lihtc'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'housing-cost-to-income-ratio',
    term: 'Housing-Cost-to-Income Ratio',
    category: 'hud',
    shortDef:
      'The fraction of gross household income spent on housing; the metric underlying the 30% cost-burden definition.',
    body:
      `The Housing-Cost-to-Income Ratio is the share of a household's gross income spent on housing costs (rent + tenant-paid utilities for renters; mortgage P&I + property tax + insurance + utilities for owners). It is the underlying metric for HUD's cost-burden classification:

- Below 30%: not cost-burdened
- 30-50%: cost-burdened
- 50% or more: severely cost-burdened

The ratio is the standard federal measure of housing affordability and is computed at the household level (each household's specific income and rent) rather than at the metro level (median rent / median income). The two measures track each other but are not identical: at the metro level, the ratio (median rent × 12 / median household income) tells you about the typical household's experience; at the individual level, ratios are dispersed.

For metro comparison, the headline ratio (median rent × 12 / median household income) is sufficient and is what the affordability score on this site uses. Metro values typically range from 15% (low-rent rural metros with moderate incomes) to 40% (high-rent coastal metros where median rent stretches the median income).

The 30% threshold has critics in academic housing research — at high incomes, paying more than 30% on housing is a choice, not a hardship. But for federal program calibration the threshold remains standard.`,
    citations: [
      { label: 'HUD Affordable Housing definition', url: 'https://www.huduser.gov/portal/glossary/glossary.html' },
    ],
    relatedTerms: ['cost-burdened-renter', 'severely-cost-burdened', 'affordability-score', 'median-rent', 'median-household-income'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'price-to-rent-ratio',
    term: 'Price-to-Rent Ratio',
    category: 'hud',
    shortDef:
      'Median home value divided by annual rent; a rough heuristic for whether a metro favors renting or buying.',
    body:
      `The Price-to-Rent Ratio is computed as median home value divided by annual rent (median monthly rent × 12). A ratio of 15 means a typical home in the metro costs 15 years of rent to buy; a ratio of 30 means 30 years of rent.

Rough interpretive guidance, not a hard rule:
- Below 15: buying typically wins on long horizons even with conservative assumptions
- 15-20: roughly even, depending on mortgage rate, down payment, and how long you plan to stay
- Above 20: renting typically wins absent significant home-price appreciation

The ratio captures the cash-flow component of the rent-vs-buy decision but ignores tax benefits (mortgage interest deduction, property tax deduction), home appreciation, owner equity buildup, and lifestyle factors. It is a starting heuristic, not a complete analysis.

Coastal metros (San Francisco, San Jose, NYC, Boston, Honolulu) regularly run price-to-rent ratios above 25 — owning makes sense primarily as a bet on continued home appreciation. Sunbelt metros (Houston, Phoenix, Dallas, Atlanta) typically run 12-18 — owning generally wins on cash flow alone.

This site computes price-to-rent for each city page using ACS B25064 (median rent) and B25077 (median home value) and displays it alongside the affordability score.`,
    citations: [
      { label: 'NYU Furman Center: Price-to-Rent', url: 'https://furmancenter.org/files/sotc/SOC_2017_Price-to-Rent_Ratio.pdf' },
    ],
    relatedTerms: ['median-rent', 'median-home-value', 'affordability-score'],
    lastUpdated: '2026-05-02',
  },

  // ── Energy & climate (8 entries) ─────────────────────────────────────────
  {
    slug: 'heating-degree-day',
    term: 'Heating Degree Day (HDD)',
    category: 'energy',
    shortDef:
      'A measure of heating energy demand: the difference between 65°F and the daily mean temperature, summed across the year.',
    body:
      `A Heating Degree Day (HDD) is computed as max(0, 65°F - daily mean temperature), expressed in °F-days. If a day's average temperature is 45°F, that day contributes 20 HDD; if it's 70°F, it contributes 0.

Annual HDD is the sum across all days in the year. Florida runs roughly 700-1,200 annual HDD (mild winters); Minnesota runs 8,000-9,000 (cold winters); Alaska runs 12,000-15,000. The 65°F base temperature is the long-standing engineering convention in the United States — it represents the indoor temperature at which a typical home requires no active heating.

HDD is used directly in HVAC sizing and energy cost estimation. The annual heating energy demand of a home is roughly proportional to HDD: \`Annual heating BTU = HDD × HLC × 24\`, where HLC is the home's whole-house heat loss coefficient (BTU/hr-°F) — typically 400-600 for a 2,000 sqft code-minimum home.

This site uses NOAA NCEI 1991-2020 climate normals for state-level annual HDD. Each metro inherits its state's HDD with a methodology disclaimer about within-state variation. Future versions will use NREL TMY3 station-level data for metro-specific HDD.`,
    citations: [
      { label: 'NOAA NCEI Climate Normals', url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals' },
      { label: 'DOE BTU/HDD methodology', url: 'https://www.energy.gov/eere/buildings/articles/building-america-best-practices-series-volume-3-builders-and-buyers' },
    ],
    relatedTerms: ['cooling-degree-day', 'btu', 'kwh', 'rpp-utilities'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'cooling-degree-day',
    term: 'Cooling Degree Day (CDD)',
    category: 'energy',
    shortDef:
      'A measure of cooling energy demand: the difference between the daily mean temperature and 65°F, summed across the year.',
    body:
      `A Cooling Degree Day (CDD) is computed as max(0, daily mean temperature - 65°F), expressed in °F-days. If a day's average temperature is 80°F, that day contributes 15 CDD; if it's 60°F, it contributes 0.

Annual CDD ranges widely across the U.S.: Pacific Northwest and Northern New England run 200-500 CDD (rarely need cooling); the South and Southwest run 2,000-3,500; Hawaii and South Florida run 4,000+ (cooling load year-round).

CDD is used analogously to HDD for cooling energy estimation: \`Annual cooling BTU = CDD × HLC × 24\`. Cooling is typically delivered by central AC (SEER 14 standard) or a heat pump, so the kWh equivalent is computed by dividing by the seasonal energy efficiency ratio.

For a metro with HDD 5,500 and CDD 1,500 (typical mid-Atlantic), annual HVAC kWh runs roughly 6,500 heating + 1,500 cooling = 8,000 kWh, costing $1,000-$2,000 at typical residential rates. This is the calculation behind each city page's "utility bill" estimate.

Like HDD, CDD on this site uses NOAA NCEI state-level 1991-2020 normals as a v1 simplification.`,
    citations: [
      { label: 'NOAA NCEI Climate Normals', url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals' },
    ],
    relatedTerms: ['heating-degree-day', 'btu', 'kwh', 'seer'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'kwh',
    term: 'Kilowatt-Hour (kWh)',
    category: 'energy',
    shortDef:
      'A unit of energy equal to one kilowatt of power applied for one hour; the standard unit for residential electricity billing.',
    body:
      `A Kilowatt-Hour (kWh) is the amount of energy delivered by 1,000 watts of power for one hour. Residential electricity bills are computed in kWh: a typical U.S. household consumes 800-1,200 kWh/month, with the upper end driven primarily by heating and cooling.

For comparison: 1 kWh runs a 100-watt LED light for 10 hours, runs a typical refrigerator for 24 hours, runs a clothes dryer cycle once, or charges an electric vehicle for about 3-4 miles of range.

State-level retail electricity rates in the U.S. (residential, Feb 2026 EIA data) range from 11¢/kWh in low-cost grids (Idaho, Nebraska, Louisiana) to 33¢/kWh in California to 43¢/kWh in Hawaii. Hawaii's high rate reflects the cost of importing fuel oil to the islands; California's reflects a combination of grid investment, renewable integration costs, and rate-design choices by the CPUC.

The HVAC energy estimates on this site convert HDD/CDD into kWh-equivalent by dividing through the heating system's COP (heat pump) or SEER (AC) and multiplying by the local retail residential rate.`,
    citations: [
      { label: 'EIA glossary: Kilowatt-hour', url: 'https://www.eia.gov/tools/glossary/' },
      { label: 'EIA Electric Power Monthly state rates', url: 'https://www.eia.gov/electricity/monthly/' },
    ],
    relatedTerms: ['btu', 'rpp-utilities', 'seer', 'cop'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'btu',
    term: 'British Thermal Unit (BTU)',
    category: 'energy',
    shortDef:
      'A unit of energy equal to the heat required to raise one pound of water by one degree Fahrenheit; the engineering unit of heating + cooling capacity.',
    body:
      `A British Thermal Unit (BTU) is the energy required to raise one pound of water by one degree Fahrenheit — about 1,055 joules. While SI countries use joules and watts, the U.S. HVAC industry retains BTUs as the standard for system capacity ratings.

Conversions:
- 1 kWh = 3,412 BTU
- 1 therm (natural gas billing unit) = 100,000 BTU
- 1 ton of cooling capacity = 12,000 BTU/hr (the term derives from the rate at which 1 ton of ice melts over 24 hours)

A typical 2,000 sqft single-family home requires 30,000-60,000 BTU/hr peak heating capacity in cold climates and 18,000-30,000 BTU/hr peak cooling in hot climates. Annual energy consumption (the integral over the year) is computed by multiplying the load coefficient by HDD or CDD × 24 hours.

For unit-economics calculations on this site we work in BTU at the load level (envelope + climate) and convert to kWh or therms at the equipment level (efficiency multiplied by retail energy price). The conversion is the bridge between the climate input (HDD/CDD) and the dollar output (utility bill).`,
    citations: [
      { label: 'EIA glossary: BTU', url: 'https://www.eia.gov/tools/glossary/' },
    ],
    relatedTerms: ['kwh', 'heating-degree-day', 'cooling-degree-day', 'afue'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'afue',
    term: 'AFUE (Annual Fuel Utilization Efficiency)',
    category: 'energy',
    shortDef:
      'The fraction of fuel energy a furnace converts to useful heat over a typical heating season; a key efficiency metric for natural gas and oil furnaces.',
    body:
      `Annual Fuel Utilization Efficiency (AFUE) is the seasonal-average fraction of fuel energy that a furnace converts into delivered heat. An AFUE of 0.85 means 85% of the fuel's heating value reaches the indoor space; the other 15% is lost up the chimney or through the cabinet.

Federal minimum AFUE for new gas furnaces is 0.80 (since 2015); high-efficiency condensing furnaces achieve 0.92-0.97. Older non-condensing units installed before 1990 commonly run 0.65-0.75.

For unit-economics, AFUE matters for fuel-cost comparisons: a 0.85 AFUE furnace burning natural gas at $1.50/therm needs about 1.18 therms per 100,000 BTU of delivered heat, costing $1.76. The same 100,000 BTU delivered by a 3.0 COP heat pump at 17¢/kWh costs $1.66.

Heat pumps don't use AFUE — they use Coefficient of Performance (COP), which can exceed 1.0 because they move heat rather than create it. A modern cold-climate heat pump with COP 2.5 at 5°F outdoor temperature outperforms a gas furnace on operating cost in many markets.

Not directly used in the standard heating cost calculation on this site (we default to electric heat pump for apples-to-apples comparison), but referenced when discussing fuel-switching scenarios.`,
    citations: [
      { label: 'DOE Furnace and Boiler Standards', url: 'https://www.energy.gov/eere/buildings/residential-furnaces-and-boilers' },
    ],
    relatedTerms: ['cop', 'seer', 'btu', 'kwh'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'seer',
    term: 'SEER (Seasonal Energy Efficiency Ratio)',
    category: 'energy',
    shortDef:
      'A measure of central air conditioner efficiency: BTU of cooling delivered per watt-hour of electricity consumed over a typical season.',
    body:
      `Seasonal Energy Efficiency Ratio (SEER) is the central AC industry's seasonal-average efficiency metric, defined as BTU of cooling output per watt-hour of electricity input. A SEER 14 unit delivers 14 BTU of cooling per watt-hour, equivalent to a year-round Energy Efficiency Ratio (EER) of about 12.

Federal minimums for split-system central AC: SEER 14 (since 2015) in the southern U.S. and SEER 13 in the northern U.S.; the "SEER2" rating that replaced SEER in 2023 uses a slightly different test procedure and a marginally lower target. Premium "high-efficiency" units run SEER 18-22.

For cooling cost estimation: a 1-ton (12,000 BTU/hr) AC unit operating at SEER 14 consumes 12,000 / 14 = 857 watts when running. Over a 1,500-CDD-year cooling season, the home with a 24,000 BTU/hr peak load (typical 2,000 sqft) consumes roughly 1,500 kWh on cooling.

This is the basis for the cooling component of each city page's HVAC estimate. A higher-SEER unit (18 vs 14) reduces cooling kWh by roughly 22%, which is meaningful in hot states with high electricity rates (Arizona at 16¢, Texas at 15¢).`,
    citations: [
      { label: 'DOE Central AC Standards', url: 'https://www.energy.gov/eere/buildings/central-air-conditioning' },
    ],
    relatedTerms: ['eer', 'cop', 'btu', 'kwh', 'cooling-degree-day'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'eer',
    term: 'EER (Energy Efficiency Ratio)',
    category: 'energy',
    shortDef:
      'A peak-condition efficiency rating for cooling equipment, measured at 95°F outdoor / 80°F indoor; runs lower than seasonal SEER.',
    body:
      `Energy Efficiency Ratio (EER) measures cooling efficiency at a single peak operating point — 95°F outdoor temperature, 80°F indoor temperature, 50% indoor humidity. It is BTU/hr cooling output divided by watt-hour electricity input at that condition.

EER differs from SEER, which is a seasonal average. The relationship is approximately \`EER ≈ SEER × 0.875\`, though the ratio depends on the unit's behavior at part-load. A SEER 14 central AC has an EER of about 12.25 at peak conditions.

EER is a more conservative — and for some calculations, more realistic — efficiency figure to use for cooling cost estimation, because peak hot afternoons are when the AC actually runs hardest and dominates summer electric bills. Using SEER alone can overstate efficiency in hot, humid metros.

For cost estimation on this site, we use SEER × 0.875 to derive an effective EER for the cooling kWh calculation. This gives more accurate cost predictions in places like Phoenix and Houston, where the unit operates near peak conditions for many hours of the cooling season.`,
    citations: [
      { label: 'DOE Energy Efficiency Ratings', url: 'https://www.energy.gov/eere/buildings/central-air-conditioning' },
    ],
    relatedTerms: ['seer', 'cop', 'btu'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'cop',
    term: 'COP (Coefficient of Performance)',
    category: 'energy',
    shortDef:
      'A heat pump\'s ratio of useful heat output to electrical energy input; values above 1.0 reflect that heat pumps move heat rather than generate it.',
    body:
      `Coefficient of Performance (COP) is the heat pump efficiency metric: useful heat delivered divided by electrical energy consumed. Values typically range from 2.0 (cold-weather operation, older units) to 4.5 (warm-weather operation, premium variable-speed units).

A COP above 1.0 is possible because a heat pump *moves* heat from outdoor air to the indoor space rather than *creating* it from electricity. Conservation of energy is preserved — the heat moved is real and gathered from outdoor air; the electrical energy is the work required to move it.

COP varies with outdoor temperature: a heat pump that scores COP 4.0 at 50°F outdoor may drop to COP 1.8 at 5°F. Cold-climate heat pumps (Mitsubishi Hyper-Heat, etc.) maintain COP 2.0+ at 0°F, but standard split systems lose performance below 30°F.

For heating cost estimation on this site, we use COP 3.0 as the default — typical of a modern air-source heat pump averaging across a heating season in a temperate climate. In cold-winter states (Minnesota, Maine, Montana), the realistic seasonal COP is closer to 2.0-2.5; we acknowledge this in methodology but don't currently parametrize per-state.

Heat pumps with electric backup elements (resistance strips) run at effective COP near 1.0 during the coldest hours, dragging seasonal averages down significantly in cold climates.`,
    citations: [
      { label: 'DOE Heat Pump Systems', url: 'https://www.energy.gov/energysaver/heat-pump-systems' },
    ],
    relatedTerms: ['afue', 'seer', 'eer', 'kwh', 'btu'],
    lastUpdated: '2026-05-02',
  },

  // ── COL framework (10 entries) ───────────────────────────────────────────
  {
    slug: 'cost-of-living-index',
    term: 'Cost of Living Index',
    category: 'general',
    shortDef:
      'A general term for any index measuring relative price levels across geographies; on this site, BEA RPP is the canonical measure.',
    body:
      `"Cost of Living Index" is a general phrase rather than a specific federal metric. Various organizations publish indices under this name:

- BEA Regional Price Parities (RPP) — the U.S. official measure, covered elsewhere in this glossary.
- Numbeo — crowd-sourced, widely cited but methodologically opaque.
- C2ER (Council for Community and Economic Research) — proprietary, used in some employer-relocation calculators.
- Bestplaces.net — derived index based on a basket of factors.
- Council for Community and Economic Research (CCER) — quarterly index covering ~300 urban areas.

Each uses a different basket, weighting scheme, and data source. For a single-numerator comparison across U.S. metros, BEA RPP is the only one with full federal-data backing and consistent methodology over time. The other indices are useful for cross-checking and for capturing categories BEA does not measure (childcare, transit, etc.), but disagreements between them on a specific metro often trace to weighting differences rather than to true prices.

This site uses BEA RPP throughout. When a relocation calculator or news article reports a "cost of living" figure, ask which underlying index it uses — the answer is rarely advertised, and the difference between Numbeo and RPP for the same metro can be 20+ index points.`,
    citations: [
      { label: 'BEA Regional Price Parities', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
    relatedTerms: ['regional-price-parity', 'affordability-score', 'real-wage-equivalent'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'affordability-score',
    term: 'Affordability Score',
    category: 'general',
    shortDef:
      'This site\'s composite metric: median household income relative to the cost of typical rent, RPP-adjusted, expressed as a 0-200 index.',
    body:
      `The Affordability Score is a composite metric we compute for each metro to summarize whether the typical household can comfortably afford the typical rent. Formula:

\`affordability_score = (median_household_income × 100) / (median_rent × 12 × RPP_factor)\`

A score of 100 means the typical household can comfortably afford the typical rent at the federal 30% cost-burden threshold. Above 100 = comfortable. Below 100 = stretched.

Components:
- median_household_income: ACS B19013, RPP-adjusted to compare across metros
- median_rent: ACS B25064 (gross rent including utilities)
- RPP_factor: BEA RPP-Housing / 100, adjusts for cost-of-living differences

The score is *relative* to the federal cost-burden threshold — it expresses how far above or below the 30% threshold a metro's median household sits. A score of 130 means the median household has 30% more rent-paying capacity than the cost-burden cutoff implies; a score of 80 means they're 20% short.

This score is one of the four headline differentiators of this site. We publish it on every city page alongside the underlying inputs so you can audit the calculation.

Veto #7 status: this score is a *derivation* from primary federal data, not a synthesis. The formula is transparent and reproducible.`,
    citations: [
      { label: 'BEA RPP Housing methodology', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
      { label: 'HUD 30% cost-burden threshold', url: 'https://www.huduser.gov/portal/glossary/glossary.html' },
    ],
    relatedTerms: ['regional-price-parity', 'cost-burdened-renter', 'median-household-income', 'median-rent', 'real-wage-equivalent'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'real-wage-equivalent',
    term: 'Real-Wage Equivalent',
    category: 'general',
    shortDef:
      'The salary needed in a destination metro to maintain the same purchasing power as a given salary in a source metro; computed via RPP ratio.',
    body:
      `The Real-Wage Equivalent answers the question: "If I earn $X in city A, what do I need to earn in city B to maintain the same buying power?" Formula:

\`equivalent_in_destination = source_income × (RPP_destination / RPP_source)\`

Example: $80,000 in Detroit (RPP 89.2) is equivalent to about $113,000 in San Francisco (RPP 126.0). The 41% nominal raise just covers SF's higher cost of living; you have not gained any purchasing power.

This is the simplest and most transparent way to evaluate a relocation salary offer. If your prospective employer offers you the source-city salary (no relocation adjustment), your real income falls. If they offer a "cost of living adjustment" but it doesn't match the RPP ratio, you're better off staying put.

Limitations:
- RPP captures *consumption* cost differences, not *one-time* costs (moving expenses, real estate transaction fees).
- RPP is an average across all spending categories. If your spending pattern differs sharply from average (e.g., very-high-housing or very-low-housing), the RPP ratio over- or under-states your particular cost change.
- RPP is computed at MSA level; within a metro, neighborhood-level cost variation can be 20-30% on either side of the metro average.

Site-wide, we publish Real-Wage Equivalent calculators on each city page and on dedicated /equivalent/{from}-vs-{to}/ pages for the top 200 metro pairs.`,
    citations: [
      { label: 'BEA RPP cross-metro comparison guidance', url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area' },
    ],
    relatedTerms: ['regional-price-parity', 'real-personal-income', 'purchasing-power', 'affordability-score'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'inflation',
    term: 'Inflation',
    category: 'general',
    shortDef:
      'The rate at which the general price level of consumption goods and services rises over time; measured by PCE Price Index or CPI.',
    body:
      `Inflation is the percentage change in a price index over time. The two principal U.S. measures are:

- BLS Consumer Price Index (CPI): historic, fixed-basket-update methodology, the inflation gauge most cited in news and used for Social Security cost-of-living adjustments and TIPS bond pricing.
- BEA PCE Price Index: chain-weighted, the Federal Reserve's preferred gauge with a 2% annual target.

Recent U.S. inflation history:
- 2010-2019: Stable around 1.5-2.5% annual (PCE), generally near the Fed's 2% target.
- 2021-2022: Sharp spike to 5-7% (PCE), driven by post-pandemic supply-chain disruption + fiscal stimulus + war-driven energy price shock.
- 2023-2025: Gradual return toward target, annualized 2.5-3.5% PCE.
- 2026 (projected by Fed): 2.0-2.5%.

For cost-of-living analysis, inflation matters because nominal dollars are not comparable across years. A $50,000 salary in 2010 has the buying power of about $69,000 in 2025 dollars. Over decades, the difference becomes large enough that comparing across time without deflating produces meaningless conclusions.

This site's PCE-deflator toggle lets you view nominal vs. real values for the 16-year RPP series. For cross-metro comparison within a single year, use RPP directly; for cross-year comparison, layer the PCE Price Index.`,
    citations: [
      { label: 'BLS Consumer Price Index', url: 'https://www.bls.gov/cpi/' },
      { label: 'BEA PCE Price Index', url: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index' },
    ],
    relatedTerms: ['pce-price-index', 'cpi-vs-pce', 'nominal-vs-real', 'real-personal-income'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'cpi-vs-pce',
    term: 'CPI vs PCE',
    category: 'general',
    shortDef:
      'The two principal U.S. inflation measures: CPI (BLS, fixed-basket) typically reports 0.3-0.5 percentage points higher than PCE (BEA, chain-weighted).',
    body:
      `The U.S. has two primary inflation measures, and they typically diverge:

**CPI (Consumer Price Index)** — Bureau of Labor Statistics. Surveys urban consumer prices monthly. Uses a fixed basket updated every two years. Subtypes include CPI-U (all urban consumers), CPI-W (wage earners and clerical workers), and Chained CPI-U (uses chain-weighting closer to PCE methodology).

**PCE (Personal Consumption Expenditures Price Index)** — Bureau of Economic Analysis. Derived monthly from National Income and Product Accounts. Chain-weighted: basket updates continuously as households substitute between goods.

Why they differ:
- *Substitution effect*: PCE allows the basket to shift as prices change; CPI updates the basket only every 2 years, missing substitution within the period.
- *Coverage*: PCE includes spending on consumers' behalf (employer-paid health insurance), CPI is out-of-pocket only.
- *Weights*: PCE uses GDP-derived weights, CPI uses consumer expenditure survey weights.

In a typical year PCE runs 0.3-0.5 percentage points lower than CPI. The gap compounds over decades — over 30 years a 0.4-percentage-point gap means PCE shows ~12% less cumulative inflation than CPI.

The Federal Reserve targets PCE at 2% annual growth. The BLS publishes CPI as the headline news number. Both are correct measures answering slightly different questions; the right one to use depends on the application.`,
    citations: [
      { label: 'Cleveland Fed CPI vs PCE comparison', url: 'https://www.clevelandfed.org/center-for-inflation-research/inflation-101/why-pce-vs-cpi' },
    ],
    relatedTerms: ['inflation', 'pce-price-index'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'nominal-vs-real',
    term: 'Nominal vs Real',
    category: 'general',
    shortDef:
      'Nominal values are stated in current-year dollars; real values are deflated to a constant base-year dollar to allow cross-year comparison.',
    body:
      `Nominal dollar values are the dollar amounts as actually paid or earned in their year. Real dollar values are deflated to a constant reference year, allowing direct comparison across time.

Examples:
- "Median household income was $54,000 in 2008 and $80,610 in 2024" — both *nominal*; the 49% growth includes both real income gains and inflation.
- "Median household income in 2024 dollars was $74,400 in 2008 and $80,610 in 2024" — both *real* in 2024 dollars; the 8% real growth tells you what actually happened to household purchasing power.

The conversion uses an inflation index. PCE Price Index (BEA) is the technically preferred deflator for personal consumption; CPI (BLS) is the more commonly cited one. Either gives you the same qualitative answer: most "growth" in nominal income series across decades is just inflation, and the *real* growth is a fraction of the nominal headline.

For cost-of-living analysis, distinguishing nominal from real is essential. A 16-year nominal RPP trend chart is misleading; the real (PCE-deflated) version tells you whether the metro is becoming actually more expensive or just keeping pace with inflation. This site's PCE-toggle exposes both views explicitly.

Pet peeve: most popular media reports income in nominal dollars and inflation as a separate story, leaving readers to mentally combine. The proper visualization always pairs them.`,
    citations: [
      { label: 'BEA Real vs Nominal explanation', url: 'https://www.bea.gov/help/glossary' },
    ],
    relatedTerms: ['inflation', 'pce-price-index', 'real-personal-income', 'purchasing-power'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'purchasing-power',
    term: 'Purchasing Power',
    category: 'general',
    shortDef:
      'The amount of consumption a given income can buy, after adjusting for both location (RPP) and time (PCE Price Index).',
    body:
      `Purchasing Power is what your income actually lets you consume. To compute it for any given income, you must adjust for both:

1. **Location** — the local cost of the consumption basket (Regional Price Parity).
2. **Time** — the price level relative to a reference year (PCE Price Index or CPI).

Two-axis adjustment example:
- A $70,000 Boise income in 2008 (Boise RPP 88.4, PCE 88.4 in 2008 base 2017=100).
- Convert to 2024 Boise dollars: $70,000 × (PCE_2024 / PCE_2008) = $70,000 × (124.0 / 88.4) ≈ $98,200.
- Convert to 2024 San Francisco dollars: $98,200 × (RPP_SF_2024 / RPP_Boise_2024) = $98,200 × (126.0 / 105.5) ≈ $117,300.

So $70,000 in 2008 Boise has the same purchasing power as $117,300 in 2024 San Francisco. This is what a salary "match" should look like across both time and place.

Most relocation calculators handle only the location dimension (RPP). Most inflation discussions handle only the time dimension (PCE). Genuine purchasing-power comparison requires both.

On this site, we expose both adjustments via the PCE-toggle on the city page and the city-pair Real-Wage Equivalent calculator. The /equivalent/{pair}/ pages handle the full cross-time + cross-place computation in narrative form.`,
    citations: [
      { label: 'BEA Real Personal Income methodology', url: 'https://www.bea.gov/data/income-saving/real-personal-income-states-and-metropolitan-areas' },
    ],
    relatedTerms: ['real-wage-equivalent', 'real-personal-income', 'pce-price-index', 'regional-price-parity'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'living-wage',
    term: 'Living Wage',
    category: 'general',
    shortDef:
      'The hourly wage a working adult needs to cover a basic-needs budget in a specific geography; computed by the MIT Living Wage Calculator.',
    body:
      `The Living Wage is the hourly wage a working adult needs to cover a defined basket of basic needs — housing, food, childcare, transportation, healthcare, taxes, miscellaneous — in a specific geography. The most widely cited methodology is the MIT Living Wage Calculator (Glasmeier et al.), which publishes living wages for U.S. counties annually.

For a single working adult with no children:
- Cleveland, OH: ~$17/hr (basic needs)
- Atlanta, GA: ~$19/hr
- San Francisco, CA: ~$28/hr
- New York, NY: ~$26/hr

For a single adult supporting one child the figure roughly doubles, primarily because of childcare costs. For a household with two working adults and two children, the per-adult requirement is lower because of economies of scale.

Living Wage is conceptually distinct from minimum wage (legal floor) and from poverty threshold (federal definition of poverty, $30,000 for a 4-person household in 2025 — well below most living-wage estimates). In nearly every U.S. metro, the legal minimum wage is below the MIT-computed living wage; most state and local minimums sit between $7.25 and $20.

For cost-of-living analysis, the Living Wage is a useful sanity check on whether a metro's rent and food costs are achievable on entry-level employment. We don't currently publish living-wage estimates per metro on this site (deferred to a future expansion), but the gap between minimum wage and the locally-required living wage is a good narrative anchor for high-cost metros.`,
    citations: [
      { label: 'MIT Living Wage Calculator', url: 'https://livingwage.mit.edu/' },
    ],
    relatedTerms: ['self-sufficiency-standard', 'affordability-score', 'cost-burdened-renter'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'self-sufficiency-standard',
    term: 'Self-Sufficiency Standard',
    category: 'general',
    shortDef:
      'A research-grade alternative to the federal poverty threshold that varies by family composition and geography; published for many states by the University of Washington Center.',
    body:
      `The Self-Sufficiency Standard is an alternative to the federal poverty threshold developed by the University of Washington Center for Women's Welfare. Where the federal poverty threshold is a single national figure (with rough adjustments for family size), the Self-Sufficiency Standard is calibrated to a specific geography and family composition.

The Standard's basket includes the same categories as the MIT Living Wage but uses different methodology — costs are typically higher because the Standard targets a more comprehensive "modest but adequate" standard rather than basic needs only. For a single adult with one preschooler in San Francisco, the Self-Sufficiency Standard might require $42-48/hr — well above MIT's $30-32/hr.

The Standard has been published for about half of U.S. states by Center for Women's Welfare partners. It is not a federal product (unlike the federal poverty threshold) and is not used in eligibility determinations for federal programs.

For cost-of-living analysis, the Self-Sufficiency Standard is most useful for understanding the gap between official poverty lines and what families actually need to support themselves without subsidy. A family at 200% of the federal poverty threshold may still fall well below the local Self-Sufficiency Standard in a high-cost metro.

We don't display the Self-Sufficiency Standard per metro on this site — coverage is uneven and methodology varies by state.`,
    citations: [
      { label: 'University of Washington Self-Sufficiency Standard', url: 'https://selfsufficiencystandard.org/' },
    ],
    relatedTerms: ['living-wage', 'cost-burdened-renter', 'area-median-income'],
    lastUpdated: '2026-05-02',
  },
  {
    slug: 'quintile',
    term: 'Income Quintile',
    category: 'general',
    shortDef:
      'A statistical division of households into five equal groups by income; useful for distinguishing typical-household experience from average or median figures.',
    body:
      `An Income Quintile is one-fifth of the household income distribution in a geography. Households are sorted by income; the bottom 20% form the first quintile, 20-40% the second, and so on. The 80th percentile divides the fourth and fifth quintiles.

For 2024 U.S. household income (Census ACS):
- Bottom quintile: under $30,000
- Second quintile: $30,000-$58,000
- Middle quintile: $58,000-$94,000 (median ≈ $76,000)
- Fourth quintile: $94,000-$155,000
- Top quintile: above $155,000

Quintile analysis is useful because median statistics describe the middle of the distribution but say nothing about the spread. Two metros with the same median household income can have very different distributions: one with a tight middle class, the other with sharp top-and-bottom polarization.

For cost-of-living comparison, the bottom-quintile experience is often more politically and socially relevant than the median, because rent and other prices in a metro are set by demand from all quintiles combined. A metro with median income $80,000 may price rent at $1,800/month — affordable to the median household but unaffordable to the bottom quintile.

We don't currently break out quintile-level affordability on this site (the data is available in ACS B19080 series), but it is a candidate enrichment for a future depth chunk.`,
    citations: [
      { label: 'Census ACS Income in the Past 12 Months', url: 'https://api.census.gov/data/2024/acs/acs5/groups/B19080.html' },
    ],
    relatedTerms: ['median-household-income', 'cost-burdened-renter', 'area-median-income'],
    lastUpdated: '2026-05-02',
  },
];

const BY_SLUG: Map<string, GlossaryEntry> = new Map(GLOSSARY.map((e) => [e.slug, e]));
const BY_CATEGORY: Map<GlossaryCategory, GlossaryEntry[]> = (() => {
  const m = new Map<GlossaryCategory, GlossaryEntry[]>();
  for (const e of GLOSSARY) {
    if (!m.has(e.category)) m.set(e.category, []);
    m.get(e.category)!.push(e);
  }
  return m;
})();

export function getEntry(slug: string): GlossaryEntry | undefined {
  return BY_SLUG.get(slug);
}

export function entriesByCategory(category: GlossaryCategory): GlossaryEntry[] {
  return BY_CATEGORY.get(category) ?? [];
}

export const GLOSSARY_COUNT = GLOSSARY.length;

export const GLOSSARY_STATS = {
  totalEntries: GLOSSARY.length,
  totalCategories: Object.keys(GLOSSARY_CATEGORIES).length,
  totalCitationsRaw: GLOSSARY.reduce((s, e) => s + e.citations.length, 0),
  totalRelatedEdges: GLOSSARY.reduce((s, e) => s + e.relatedTerms.length, 0),
} as const;
