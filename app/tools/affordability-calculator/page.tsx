import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AffordabilityCalc } from '@/components/tools/AffordabilityCalc';
import { getMostExpensiveCities, getCityData } from '@/lib/db';

export const dynamic = 'force-static';
export const revalidate = 86400;

const TITLE = 'Affordability Calculator — costbycity';
const DESCRIPTION =
  'Calculator that scores whether your income covers the typical housing, grocery, transport, and utility budget in any U.S. metro, using BEA Regional Price Parities.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/affordability-calculator/' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/tools/affordability-calculator/' },
};

export default function AffordabilityCalculatorPage() {
  // Pick a notable default city (top of expensive list) for the inline calc.
  const top = getMostExpensiveCities(1)[0];
  const data = top ? getCityData(top.slug) : null;
  const fallbackName = top ? `${top.short_name}, ${top.state}` : 'San Francisco, CA';
  const costIndex = data?.rpp.all ?? 115;
  const housingIndex = data?.rpp.housing ?? 150;
  const groceriesIndex = data?.rpp.goods ?? 105;
  const medianIncome = data?.acs?.median_income ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools/' },
          { label: 'Affordability Calculator', href: '/tools/affordability-calculator/' },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Affordability Calculator</h1>
        <p className="mt-2 text-base text-slate-700">{DESCRIPTION}</p>
      </header>

      <p className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        This page uses {fallbackName} as the example metro. To run the calculator on a specific city, navigate to its{' '}
        <a href="/cities/" className="underline">city page</a> — every city page includes the inline affordability calculator with that metro's exact RPP and ACS values.
      </p>

      <AffordabilityCalc
        cityName={fallbackName}
        costIndex={costIndex}
        housingIndex={housingIndex}
        groceriesIndex={groceriesIndex}
        medianIncome={medianIncome}
      />

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-slate-900">How the calculator works</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-800">
          The calculator multiplies four U.S.-average annual budgets — housing $18,840, groceries $6,000, transport $10,000, other $15,000 — by the destination metro's RPP sub-indices (Housing, Goods, all-items proxy for transport and other). Your income is then compared to the resulting total.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          The verdicts (<strong>Comfortable</strong> ≥ 1.30 ratio, <strong>Manageable</strong> ≥ 1.00, <strong>Tight</strong> ≥ 0.75, <strong>Unaffordable</strong> below) are calibrated to leave headroom for taxes, savings, and unplanned expenses. The 30%-housing rule (HUD's cost-burden threshold) is a separate flag.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
          See the <a href="/glossary/affordability-score/" className="text-blue-700 underline">Affordability Score glossary entry</a> for the detailed formula and the <a href="/glossary/cost-burdened-renter/" className="text-blue-700 underline">Cost-Burdened Renter entry</a> for the policy definition behind the 30% threshold.
        </p>
      </section>
    </main>
  );
}
