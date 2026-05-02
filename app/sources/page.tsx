import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CITATION_NETWORK_STATS } from '@/lib/citation-network';
import { GLOSSARY_STATS } from '@/lib/glossary-data';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Federal Data Sources — costbycity primary references';
const DESCRIPTION =
  'Every metric on costbycity traces back to a primary federal release. This page lists each source agency, the exact dataset and table used, the vintage we currently serve, and what we do with it.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/sources/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/sources/' },
};

type SourceRow = {
  agency: string;
  dataset: string;
  vintage: string;
  url: string;
  cadence: string;
  use: string;
  reach: string;
};

const SOURCES: SourceRow[] = [
  {
    agency: 'BEA — Bureau of Economic Analysis',
    dataset: 'Regional Price Parities (SARPP / MARPP) — all-items, goods, services-less-rents, rents',
    vintage: '2008–2024 annual (release Dec 2025)',
    url: 'https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area',
    cadence: 'Annual, with a 12-month lag.',
    use: 'The single anchor of every cost-of-living index on the site. We render the full 16-year series on /trend/rpp-all/, /trend/rpp-housing/, and inside each city page; we also use it for the relocation salary multiplier and the affordability score.',
    reach: 'All 387 metro pages, all 51 state pages, all 200 /equivalent/[pair]/ pages, the relocation calculator, the affordability calculator.',
  },
  {
    agency: 'BEA — Bureau of Economic Analysis',
    dataset: 'NIPA Table 1.1.4 — Personal Consumption Expenditures Price Index (PCEPI), monthly + annual',
    vintage: '1929–2025 annual (current as of release schedule)',
    url: 'https://www.bea.gov/itable/national-gdp-and-personal-income',
    cadence: 'Monthly release; we re-fetch annual averages quarterly.',
    use: 'Inflation deflator for converting nominal RPP and ACS dollar values into constant-dollar terms. Powers the /trend/pce-deflator/ page and the real-vs-nominal toggle component.',
    reach: '/trend/pce-deflator/, /trend/real-vs-nominal/, every glossary cross-reference for inflation, the relocation calculator footnote.',
  },
  {
    agency: 'Census — U.S. Census Bureau',
    dataset:
      'American Community Survey (ACS) 5-Year — B19013 (median household income), B25064 (median gross rent), B25077 (median home value), B19301 (per-capita income)',
    vintage: '2019–2023 5-year estimates (release Dec 2024)',
    url: 'https://www.census.gov/programs-surveys/acs/',
    cadence: 'Annual 5-year vintage release each December.',
    use: 'Income, rent, and home-value context for every metro page and pair page. We use 5-year (not 1-year) estimates because they cover all 387 metro areas including those below the 65,000-population 1-year threshold.',
    reach: '387 metro pages, 200 pair pages, the affordability score gauge, the income column on every state page table.',
  },
  {
    agency: 'HUD — Department of Housing and Urban Development',
    dataset: 'Fair Market Rents (FMR) FY 2026 — 0–4 bedroom by metro / county subarea',
    vintage: 'FY 2026 (effective October 1, 2025)',
    url: 'https://www.huduser.gov/portal/datasets/fmr.html',
    cadence: 'Annual; HUD publishes proposed FMRs in August and finalises in October.',
    use: 'Cost-burden threshold (the 30%-of-income rule) and rent-payment standards for housing-voucher contexts. Used as a sanity reference against ACS B25064 in the housing-breakdown deep dives.',
    reach: 'Every /cities/[slug]/housing-breakdown/ page, glossary entries on cost-burdened renters and HUD income limits.',
  },
  {
    agency: 'NOAA — National Centers for Environmental Information',
    dataset: '1991–2020 U.S. Climate Normals — heating and cooling degree-days (HDD / CDD), state-level',
    vintage: '1991–2020 normals (released May 2021, valid through 2030)',
    url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals',
    cadence: 'Decadal; the next release will be 2001–2030 normals around 2031.',
    use: 'Annual heating and cooling demand for the HVAC-energy estimate on each utility-bill deep dive. Combined with home thermal-load and HVAC-efficiency assumptions to model annual kWh.',
    reach: '387 /cities/[slug]/utility-bill/ pages via the ClimateEnergyCost component, glossary entries on HDD, CDD, and the HVAC formula.',
  },
  {
    agency: 'EIA — U.S. Energy Information Administration',
    dataset: 'Form EIA-861M Electric Power Monthly — Table 5.6.A residential average retail price (¢/kWh)',
    vintage: 'February 2026 release (data through December 2025)',
    url: 'https://www.eia.gov/electricity/monthly/',
    cadence: 'Monthly; we re-fetch quarterly because state averages move slowly.',
    use: 'State residential electricity rate fed into the HVAC kWh estimate to produce a $/year heating + cooling cost. EIA rate × NOAA degree-day demand = the energy half of the utility breakdown.',
    reach: '387 utility-bill pages, glossary entry on residential electricity rate, the climate-energy component.',
  },
  {
    agency: 'BLS — Bureau of Labor Statistics',
    dataset: 'CPI-U All Urban Consumers, U.S. city average + four regions (CUUR0000SA0, CUUR0100SA0, etc.)',
    vintage: 'Through latest monthly release',
    url: 'https://www.bls.gov/cpi/',
    cadence: 'Monthly, mid-month release.',
    use: 'Cross-reference for the BEA PCE deflator (BLS CPI is more familiar to readers; we link both). Used in the glossary CPI-vs-PCE comparison entry to explain why the Federal Reserve targets PCE rather than CPI.',
    reach: 'Glossary entries on CPI, PCE, real vs nominal; the methodology page; a footnote on every pair page that mentions inflation.',
  },
];

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Sources', href: '/sources/' }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{TITLE}</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-700">{DESCRIPTION}</p>
      </header>

      <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">Citation network at a glance</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Glossary entries" value={GLOSSARY_STATS.totalEntries.toString()} />
          <Stat label="Internal cross-refs" value={CITATION_NETWORK_STATS.totalRelatedEdges.toString()} />
          <Stat label="External citations" value={CITATION_NETWORK_STATS.totalCitations.toString()} />
          <Stat label="Authority domains" value={CITATION_NETWORK_STATS.uniqueAuthorities.toString()} />
        </div>
        <p className="mt-3 text-sm text-blue-900">
          Top hub:{' '}
          <Link href={`/glossary/${CITATION_NETWORK_STATS.topHubSlug}/`} className="underline">
            {CITATION_NETWORK_STATS.topHub}
          </Link>{' '}
          · Top external authority: <code className="rounded bg-white px-1 py-0.5">{CITATION_NETWORK_STATS.topAuthority}</code>
        </p>
      </section>

      <ol className="space-y-6">
        {SOURCES.map((s, i) => (
          <li key={s.agency + s.dataset} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-baseline gap-3">
              <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="text-lg font-bold text-slate-900">{s.agency}</h2>
            </div>
            <p className="text-sm font-medium text-slate-800">{s.dataset}</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-600">Vintage</dt>
                <dd className="text-slate-800">{s.vintage}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Cadence</dt>
                <dd className="text-slate-800">{s.cadence}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-600">How we use it</dt>
                <dd className="text-slate-800">{s.use}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-600">Pages affected</dt>
                <dd className="text-slate-800">{s.reach}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-600">Primary URL</dt>
                <dd>
                  <a className="text-blue-700 underline" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.url}
                  </a>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50/60 p-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Editorial standards</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            <strong>Public-domain only.</strong> Every dataset above is U.S. federal output, in the public domain. We do not paywall, we
            do not obscure provenance, and we link the upstream URL on every page.
          </li>
          <li>
            <strong>No synthesised baseline.</strong> Per Veto #7, we never generate values where the federal release is missing. If a
            metro is below the ACS 1-year threshold or HUD doesn&apos;t publish an FMR, we either fall back to the 5-year ACS
            estimate or display a transparent &quot;data unavailable&quot; notice.
          </li>
          <li>
            <strong>Vintage on every page.</strong> Every dollar figure on the site is stamped with its source vintage in the
            FreshnessTag and TrustBlock components, so readers can decide whether the number is current enough for their decision.
          </li>
          <li>
            <strong>Glossary cross-link.</strong> Every primary source has a corresponding{' '}
            <Link href="/glossary/" className="text-blue-700 underline">
              glossary entry
            </Link>{' '}
            with the formula or methodology in plain English.
          </li>
          <li>
            <strong>Methodology page.</strong> The companion{' '}
            <Link href="/methodology/" className="text-blue-700 underline">
              methodology page
            </Link>{' '}
            documents the formulas (real-wage equivalent, affordability score, HVAC kWh) that combine these sources.
          </li>
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}
