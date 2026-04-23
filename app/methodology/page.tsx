import type { Metadata } from "next";

const desc =
  "How CostByCity sources its US cost-of-living data — anchored in the BEA Regional Price Parities, with cross-references to Census ACS, BLS CPI, HUD Fair Market Rents, and the MIT Living Wage Calculator.";

export const metadata: Metadata = {
  title: "Our Methodology — How CostByCity Builds Its Cost of Living Data",
  description: desc,
  alternates: { canonical: "/methodology/" },
  openGraph: { title: "Our Methodology", description: desc, url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Cost of living drives real money decisions &mdash; whether to take a
        job in a different metro, whether to retire here, whether your salary
        actually goes far. You deserve a clear, unflinching explanation of
        where our numbers come from, and what they cannot tell you.
      </p>

      <h2>Primary source: BEA Regional Price Parities</h2>
      <p>
        Every cost-of-living index on CostByCity is anchored in the{" "}
        <a
          href="https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
          target="_blank"
          rel="noopener noreferrer"
        >
          US Bureau of Economic Analysis (BEA) Regional Price Parities (RPP)
        </a>
        . RPPs measure the price differences between metropolitan and
        nonmetropolitan areas relative to the US average, broken into
        components: goods, services excluding rents, rents, and total. The
        national average is exactly 100; a metro at 115 is 15% more expensive
        for the typical basket, and a metro at 90 is 10% cheaper.
      </p>
      <p>
        BEA computes RPPs from price quotes collected by the Bureau of Labor
        Statistics for the Consumer Price Index, supplemented with rental data
        from the American Community Survey. This is the most authoritative
        cross-metro price comparison available for the United States, and is
        the data underpinning most published cost-of-living rankings.
      </p>

      <h2>What our index numbers mean</h2>
      <p>For each metro we publish:</p>
      <ul>
        <li>
          <strong>Total RPP (the headline number)</strong> &mdash; the
          aggregate index for goods + services + rents combined.
        </li>
        <li>
          <strong>Goods RPP</strong> &mdash; food, clothing, electronics,
          transportation goods.
        </li>
        <li>
          <strong>Services excluding rents RPP</strong> &mdash; healthcare,
          recreation, restaurants, etc.
        </li>
        <li>
          <strong>Rents RPP</strong> &mdash; housing rents only, the most
          volatile component across metros.
        </li>
      </ul>
      <p>
        We separate these because the rent component does most of the work
        in expensive metros. If a city&apos;s overall index looks
        intimidating, it&apos;s usually housing. If you can mitigate the
        housing line (smaller place, different neighborhood, sharing), the
        true cost difference may be much smaller than the headline.
      </p>

      <h2>Income and rent context</h2>
      <p>
        We pair BEA RPP with median household income and median rent from
        the{" "}
        <a
          href="https://www.census.gov/programs-surveys/acs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Census American Community Survey (ACS)
        </a>
        , so you can see how the local price level interacts with local
        earning power. A high-RPP metro with high median income (like San
        Jose) is a different story from a high-RPP metro with low median
        income.
      </p>

      <h2>Cross-reference and verification</h2>
      <p>
        We link out to authoritative sources so you can verify any number
        you&apos;re basing a relocation or budget decision on:
      </p>
      <ul>
        <li>
          <a
            href="https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
            target="_blank"
            rel="noopener noreferrer"
          >
            BEA RPP
          </a>{" "}
          &mdash; the primary source.
        </li>
        <li>
          <a
            href="https://www.census.gov/programs-surveys/acs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Census ACS
          </a>{" "}
          &mdash; for household income and rent context.
        </li>
        <li>
          <a
            href="https://www.bls.gov/cpi/"
            target="_blank"
            rel="noopener noreferrer"
          >
            BLS Consumer Price Index
          </a>{" "}
          &mdash; the underlying price data behind RPP, broken into more
          detailed categories.
        </li>
        <li>
          <a
            href="https://www.huduser.gov/portal/datasets/fmr.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            HUD Fair Market Rents
          </a>{" "}
          &mdash; useful cross-check for the rent component, used by
          Section 8 and other federal housing programs.
        </li>
        <li>
          <a
            href="https://livingwage.mit.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT Living Wage Calculator
          </a>{" "}
          &mdash; a complementary resource that estimates the hourly wage
          needed to support a household by family size and county.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        BEA releases new RPP data once a year, with a typical lag of 12-18
        months between the reference period and publication. We refresh our
        dataset within days of each BEA release. Each city page shows the
        vintage of the underlying data.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Metro-level resolution.</strong> RPP is published at the
          metropolitan area level, not the neighborhood level. Within a
          large metro, the actual cost gap between neighborhoods can be as
          big as the gap between metros.
        </li>
        <li>
          <strong>Average basket assumption.</strong> The index reflects an
          average consumer basket. If your spending pattern is unusual
          (heavy on housing, light on healthcare; or vice versa), the
          headline number may understate or overstate your actual situation.
        </li>
        <li>
          <strong>No state and local taxes in the index.</strong> RPP
          measures pre-tax prices. Two metros with identical RPP can yield
          very different take-home pay because of state income tax,
          property tax, and sales tax differences. We link out to
          PropertyTaxPeek and NetPayPeek so you can layer those in.
        </li>
        <li>
          <strong>Lag.</strong> A 12-18 month publication delay means BEA
          RPP can&apos;t capture this month&apos;s rent spike or last
          quarter&apos;s grocery inflation. For decisions on the
          immediate horizon, supplement with current sources.
        </li>
        <li>
          <strong>Not financial advice.</strong> Nothing on CostByCity is a
          substitute for professional financial, tax, or relocation advice.
          For decisions with real money on the line, work with a qualified
          advisor.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published BEA figure disagrees with what you see here, please
        <a href="/contact/"> contact us</a> with the metro and BEA URL.
        Corrections from the community help us catch ingestion bugs quickly.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
