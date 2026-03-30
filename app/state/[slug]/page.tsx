import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMetrosByStateCode, getAllStates } from "@/lib/db";
import { formatIndex, formatPctDiffShort } from "@/lib/format";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = slug.toUpperCase();
  return {
    title: `Cost of Living in ${state} - City Comparison`,
    description: `Compare cost of living across cities in ${state}. See which cities are most and least expensive.`,
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = slug.toUpperCase();
  const cities = getMetrosByStateCode(state);
  if (cities.length === 0) notFound();

  const states = getAllStates();

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Cost of Living in {state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Cost of Living in {state}</h1>
      <p className="text-slate-600 mb-6">{cities.length} metro areas ranked by cost of living</p>

      <EditorNote note={`Cost of living in ${state} varies widely across metro areas. Indices above 100 mean higher than the national average, while below 100 means more affordable. These figures reflect regional price parities from the BLS.`} />

      <div className="flex flex-wrap gap-2 mb-8">
        {states.map((s) => (
          <a key={s} href={`/state/${s.toLowerCase()}`}
            className={`px-3 py-1 rounded-full text-sm border ${s === state ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        {cities.map((c, i) => (
          <a key={c.fips} href={`/cities/${c.slug}`}
            className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100">
            <span className="text-sm">
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {c.short_name}
            </span>
            <span className={`text-sm font-semibold ${c.rpp_all > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPctDiffShort(c.rpp_all)}
            </span>
          </a>
        ))}
      </div>

      <DidYouKnow fact="Housing typically accounts for the largest share of cost-of-living differences between metro areas. A city with an overall index of 110 may have housing costs 30-40% above the national average while groceries differ by only 5-10%." />

      <DataSourceBadge sources={[
        { name: "BLS CPI", url: "https://www.bls.gov/cpi/" },
        { name: "Census Bureau", url: "https://www.census.gov" },
      ]} />

      <CrossSiteLinks current="CostOfLiving" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: `Cost of Living in ${state}`,
          description: `Compare cost of living across ${cities.length} metro areas in ${state}.`,
          url: `https://costoflivingpeek.com/state/${slug}`,
          dateModified: "2026-03-31",
          author: { "@type": "Organization", name: "DataPeek" },
        }) }}
      />
    </div>
  );
}
