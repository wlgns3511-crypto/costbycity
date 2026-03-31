import type { Metadata } from "next";
import { EditorNote } from "@/components/EditorNote";
import { DataSourceBadge } from "@/components/DataSourceBadge";

const desc = "Learn how CostByCity collects, processes, and verifies regional price parity and cost of living comparisons using BEA data.";
export const metadata: Metadata = {
  title: "Our Methodology",
  description: desc,
  alternates: { canonical: "/methodology/" },
  openGraph: { title: "Our Methodology", description: desc, url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>

      <EditorNote note="CostByCity processes Regional Price Parities (RPP) from the Bureau of Economic Analysis and Census ACS data. Every data point traces back to an official source." />

      <p className="lead text-lg text-slate-600">
        CostByCity is committed to providing accurate, comprehensive, and up-to-date cost of living data.
        This page explains how we collect, process, and verify our information.
      </p>

      <h2>Data Sources</h2>
      <p>
        Our data is sourced from authoritative, publicly available databases: <strong>U.S. Bureau of Economic Analysis (BEA) Regional Price Parities</strong> and <strong>Census American Community Survey (ACS)</strong>.
      </p>

      <h2>Data Collection Process</h2>
      <ol>
        <li><strong>Automated Ingestion</strong> — We use automated pipelines to regularly pull data from our primary sources.</li>
        <li><strong>Normalization</strong> — Raw data is cleaned, standardized, and structured into our unified database schema.</li>
        <li><strong>Cross-Validation</strong> — We compare data points across multiple sources to identify discrepancies.</li>
        <li><strong>Expert Review</strong> — Our editorial team reviews flagged entries and applies domain expertise.</li>
      </ol>

      <h2>Update Frequency</h2>
      <p>Databases are updated when new BEA releases become available. Each page displays a verification timestamp.</p>

      <h2>Limitations</h2>
      <p>While we strive for accuracy, our data reflects the most recent publicly available information and may not capture real-time changes.</p>

      <DataSourceBadge sources={[
        { name: "BEA", url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area" },
        { name: "Census ACS", url: "https://www.census.gov/programs-surveys/acs" },
      ]} />

      <h2>Contact</h2>
      <p>Found an error? <a href="/contact/">Contact us</a>.</p>
    </article>
  );
}
