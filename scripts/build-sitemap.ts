#!/usr/bin/env tsx
/**
 * build-sitemap.ts — costbycity static sitemap generator.
 * Generates public/sitemap.xml (index) + public/sitemap-N.xml shards.
 *
 * PRUNING HISTORY (HCU March 2026 Tier F — 2026-04-23):
 *   Pre-prune: ~1,830 URLs. Bloat source:
 *     /es/ + /es/cities/ × 387 = 388 thin translation URLs over identical
 *     census cost-of-living data, 21% of sitemap.
 *   Post-prune: ~1,440 URLs.
 *   /es/cities/ stays live via dynamicParams; just not announced to Google.
 *
 * Dynamic routes:
 *   cities/[slug]   dynamicParams=false → all metros (getAllMetros)
 *   compare/[slugs] dynamicParams=true → top 10000 prerender + all valid comparisons on demand
 *   state/[state]   no dynamicParams annotation → dynamicParams=true, all states
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllMetros, getAllStates, getStatesWithMinMetros, getComparisonsPage, getComparisonCount } from '../lib/db';
import { stateCodeToSlug } from '../lib/us-states';
import { getAllPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://costbycity.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }

function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}

function writeShard(id: number, es: Entry[]) {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    es.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

// ---- Collect entries with dedup ----
const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages (EN only — /es/ mirror dropped 2026-04-23 Tier F)
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/cities/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/compare/`, priority: '0.9', changefreq: 'monthly' });

// Blog
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Guides
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// National rankings
for (const t of ['most-expensive-cities', 'most-affordable-cities', 'cheapest-housing', 'most-expensive-housing']) {
  add({ url: `${SITE_URL}/rankings/${t}/`, priority: '0.8', changefreq: 'monthly' });
}

// State-level rankings
for (const sc of getStatesWithMinMetros(3)) {
  const ss = stateCodeToSlug(sc);
  for (const t of ['most-expensive-cities', 'most-affordable-cities', 'cheapest-housing', 'most-expensive-housing']) {
    add({ url: `${SITE_URL}/rankings/${t}-in-${ss}/`, priority: '0.6', changefreq: 'monthly' });
  }
}

// Cities: dynamicParams=false → ALL metros (getAllMetros), EN only.
// /es/cities/ × 387 thin-translation mirror DROPPED 2026-04-23 Tier F.
// Route stays live via dynamicParams; just not announced to Google.
const metros = getAllMetros();
for (const m of metros) {
  add({ url: `${SITE_URL}/cities/${m.slug}/`, priority: '0.8', changefreq: 'monthly' });
}

// City housing-breakdown deep-dive (387 — Tier S HCU expansion 2026-04-21)
for (const m of metros) {
  add({ url: `${SITE_URL}/cities/${m.slug}/housing-breakdown/`, priority: '0.75', changefreq: 'monthly' });
}

// City utility-bill deep-dive (387 — Tier S HCU Batch 9 2026-04-21)
for (const m of metros) {
  add({ url: `${SITE_URL}/cities/${m.slug}/utility-bill/`, priority: '0.72', changefreq: 'monthly' });
}

// States: dynamicParams=true → all states
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.toLowerCase()}/`, priority: '0.7', changefreq: 'monthly' });
}

// Compare pages excluded from sitemap (2026-04-17)
// GSC-whitelist approach generated 404s for entries not in generateStaticParams.
// Thin synthetic matrix (city×city) is doorway-prone per Google scaled-content policy.
// Pages still render via generateStaticParams; just not announced in sitemap.

// ─── Cardinality guard ────────────────────────────────────────────────────
if (entries.length > 1800 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `costbycity sitemap has ${entries.length.toLocaleString()} URLs — Tier F budget is ~1.44K.\n` +
      `Did /es/cities/ (387) get re-added?\n` +
      `That's exactly the loop that caused the original cardinality collapse.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ---- Write sharded output ----
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) {
    writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  }
  const indexXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) =>
      `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`
    ).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), indexXml);
}

console.log(`✓ costbycity sitemap: ${entries.length} unique URLs, ${shardCount || 1} shard(s)`);
