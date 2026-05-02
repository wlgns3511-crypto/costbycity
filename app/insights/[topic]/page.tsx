import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getInsightProfile, getAllInsightTopics, type InsightTopic,
} from "@/lib/insight-topics";
import { datasetSchema, itemListSchema } from "@/lib/schema";

/**
 * 2026-04-29 HCU 5-chunk patch — /insights/[topic]/.
 *
 * 6 topic profiles, each rendering paired ranking tables with hook + outro
 * narrative. Counterpart to /rankings/[type]/ which is single-axis per page.
 *
 * dynamicParams = false: unknown topics return real HTTP 404, not Next.js 16
 * soft-404. Mirror of the /rankings/[type] pattern.
 */

interface Props { params: Promise<{ topic: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllInsightTopics().map((t) => ({ topic: t }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const profile = getInsightProfile(topic as InsightTopic);
  if (!profile) return {};
  return {
    title: profile.metaTitle,
    description: profile.metaDescription,
    alternates: { canonical: `/insights/${topic}/` },
    openGraph: {
      title: profile.metaTitle,
      description: profile.metaDescription,
      url: `/insights/${topic}/`,
    },
  };
}

export default async function InsightTopicPage({ params }: Props) {
  const { topic } = await params;
  const profile = getInsightProfile(topic as InsightTopic);
  if (!profile) notFound();

  // Cross-topic nav pills
  const allTopics = getAllInsightTopics();
  const navItems = allTopics.map((t) => {
    const p = getInsightProfile(t);
    return { topic: t, label: p?.title.split(':')[0].trim() || t };
  });

  // Combined ItemList for SEO — first table's rows
  const firstRows = profile.tables[0]?.rows ?? [];
  const listItems = firstRows.slice(0, 25).map((c) => ({
    name: c.short_name,
    url: `/cities/${c.slug}/`,
  }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(profile.title, `/insights/${topic}/`, listItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(profile.title, profile.metaDescription, `/insights/${topic}/`)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <a href="/insights/" className="hover:underline">Insights</a>
        {' / '}
        <span className="text-slate-800">{profile.title.split(':')[0]}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{profile.title}</h1>

      {/* Hook narrative */}
      <section className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h2 className="font-semibold text-emerald-800 text-lg mb-2">{profile.hookHeadline}</h2>
        <p className="text-sm text-slate-700 leading-relaxed">{profile.hook}</p>
      </section>

      {/* Cross-topic nav pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {navItems.map((item) => (
          <a key={item.topic} href={`/insights/${item.topic}/`}
            className={`px-3 py-1 rounded-full text-xs border ${item.topic === topic ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 hover:bg-emerald-50'}`}>
            {item.label}
          </a>
        ))}
      </div>

      {/* Paired tables */}
      {profile.tables.map((tbl, idx) => (
        <section key={idx} className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-1">{tbl.heading}</h2>
          <p className="text-sm text-slate-500 mb-3 max-w-3xl">{tbl.caption}</p>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 p-3 bg-slate-100 text-sm font-semibold">
              <span>#</span>
              <span>City</span>
              <span className="text-right">{tbl.primaryLabel}</span>
              {tbl.secondaryLabel && <span className="text-right text-slate-500 hidden sm:block">{tbl.secondaryLabel}</span>}
            </div>
            {tbl.rows.map((c, i) => (
              <a key={`${idx}-${c.slug}`} href={`/cities/${c.slug}/`}
                className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 items-center p-3 hover:bg-emerald-50 border-b border-slate-100">
                <span className="text-slate-400">{i + 1}.</span>
                <span className="text-sm">{c.short_name}{c.state ? `, ${c.state}` : ''}</span>
                <span className="text-sm font-semibold text-slate-900 text-right">
                  {tbl.formatPrimary ? tbl.formatPrimary(c.primary_value) : c.primary_value}
                </span>
                {tbl.secondaryLabel && (
                  <span className="text-xs text-slate-500 text-right hidden sm:block">
                    {tbl.formatSecondary ? tbl.formatSecondary(c.secondary_value) : (c.secondary_value ?? '—')}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      ))}

      {/* Outro implication */}
      <section className="my-8 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold mb-2 text-slate-900">What to Take Away</h2>
        <p className="text-slate-700 leading-relaxed">{profile.outro}</p>
      </section>

      <div className="mt-6 text-sm text-slate-500">
        <a href="/insights/" className="text-emerald-600 hover:underline">← All insights</a>
        {' · '}
        <a href="/rankings/" className="text-emerald-600 hover:underline">Single-axis rankings →</a>
      </div>
    </div>
  );
}
