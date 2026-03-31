import type { Metadata } from "next";
import { EditorNote } from "@/components/EditorNote";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";

const desc = "Learn about CostByCity — free cost of living comparisons for 387+ US metro areas powered by BEA and Census data.";
export const metadata: Metadata = {
  title: "About CostByCity",
  description: desc,
  alternates: { canonical: "/about/" },
  openGraph: { title: "About CostByCity", description: desc, url: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'About CostByCity',
        description: desc, url: 'https://costbycity.com/about/',
        isPartOf: { '@type': 'WebSite', name: 'CostByCity', url: 'https://costbycity.com' },
      }) }} />
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">About CostByCity</h1>

      <EditorNote note="CostByCity is part of the DataPeek Facts network — a collection of 30+ free data tools powered by official government sources." />

      <p>
        CostByCity is a free resource that helps individuals, families, and researchers compare the cost of living
        across 387+ metropolitan areas in the United States. We break down expenses including housing, groceries,
        utilities, transportation, and more.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Relocating or choosing where to live is one of the biggest financial decisions you can make. Our mission is to
        provide transparent, data-driven cost-of-living comparisons so you can make informed decisions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">The DataPeek Network</h2>
      <p>
        CostByCity is part of <a href="https://datapeekfacts.com" className="text-emerald-600 hover:underline">DataPeek Facts</a>,
        a network of specialized data platforms covering salaries, housing, healthcare, education, energy, and more — all built on official data sources.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        Data from the <strong>Bureau of Economic Analysis (BEA)</strong> Regional Price Parities and the <strong>U.S. Census Bureau</strong>.
        See our <a href="/methodology/" className="text-emerald-600 hover:underline">Methodology</a> for full details.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>Visit our <a href="/contact/" className="text-emerald-600 hover:underline">Contact page</a>.</p>

      <CrossSiteLinks current="CostByCity" />
    </article>
  );
}
