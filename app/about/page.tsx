import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CostByCity",
  description: "Learn about CostByCity, our mission, and data sources.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">About CostByCity</h1>

      <p>
        CostByCity is a free resource that helps individuals, families, and researchers compare the cost of living
        across 380+ metropolitan areas in the United States. We break down expenses including housing, groceries,
        utilities, transportation, and more to give you a clear picture of what it costs to live in different cities.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Relocating or choosing where to live is one of the biggest financial decisions you can make. Our mission is to
        provide transparent, data-driven cost-of-living comparisons so you can make informed decisions. Whether you are
        considering a job offer in a new city, planning for retirement, or simply curious about regional price
        differences, CostByCity has the data you need.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        Our data comes from the <strong>Bureau of Economic Analysis (BEA)</strong> Regional Price Parities program and
        the <strong>U.S. Census Bureau</strong>. The BEA Regional Price Parities measure the differences in price
        levels across states and metropolitan areas for a given year, expressed as a percentage of the overall national
        price level. We update our data as new releases become available.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact" className="text-emerald-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
