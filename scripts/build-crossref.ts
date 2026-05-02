#!/usr/bin/env tsx
/**
 * Audit + emit citation network snapshot for /glossary/.
 *
 * Reads:  lib/glossary-data.ts (50 entries) via lib/citation-network.ts
 * Writes: lib/generated/citation-network.json (stats + graph)
 *
 * Use the JSON snapshot for sitemap/SEO debugging (sources page, network audit)
 * and to verify no orphan terms (in/out degree = 0).
 *
 * Usage: npx tsx scripts/build-crossref.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  AUTHORITY_TABLE,
  CITATION_NETWORK_STATS,
  CLUSTER_TABLE,
  DEGREE_TABLE,
  ON_SITE_REFERENCES,
} from '../lib/citation-network';
import { GLOSSARY } from '../lib/glossary-data';

const DST = join(process.cwd(), 'lib/generated/citation-network.json');

function audit(): void {
  // Orphan check — every entry must have at least one in or out edge.
  const orphans = DEGREE_TABLE.filter((r) => r.total === 0);
  if (orphans.length > 0) {
    console.error('[B-5] orphan entries (no edges):');
    for (const o of orphans) {
      console.error(`  ${o.slug} (${o.term})`);
    }
    process.exit(1);
  }

  // Dangling related terms — every related slug must point to an existing entry.
  const known = new Set(GLOSSARY.map((e) => e.slug));
  const dangling: string[] = [];
  for (const e of GLOSSARY) {
    for (const r of e.relatedTerms) {
      if (!known.has(r)) {
        dangling.push(`${e.slug} → ${r}`);
      }
    }
  }
  if (dangling.length > 0) {
    console.error('[B-5] dangling related terms:');
    for (const d of dangling) console.error(`  ${d}`);
    process.exit(1);
  }

  // Asymmetry warning — A → B but not B → A is allowed but flagged.
  const asym: Array<[string, string]> = [];
  const edgeSet = new Set<string>();
  for (const e of GLOSSARY) {
    for (const r of e.relatedTerms) {
      edgeSet.add(`${e.slug}→${r}`);
    }
  }
  for (const e of GLOSSARY) {
    for (const r of e.relatedTerms) {
      if (!edgeSet.has(`${r}→${e.slug}`)) {
        asym.push([e.slug, r]);
      }
    }
  }

  console.log(`[B-5] entries: ${GLOSSARY.length}`);
  console.log(`[B-5] edges (forward): ${CITATION_NETWORK_STATS.totalRelatedEdges}`);
  console.log(`[B-5] citations: ${CITATION_NETWORK_STATS.totalCitations}`);
  console.log(`[B-5] unique authority domains: ${CITATION_NETWORK_STATS.uniqueAuthorities}`);
  console.log(`[B-5] top hub: ${CITATION_NETWORK_STATS.topHub}`);
  console.log(`[B-5] top authority: ${CITATION_NETWORK_STATS.topAuthority}`);
  console.log(`[B-5] one-way edges: ${asym.length} (informational only)`);
}

function emit(): void {
  const snapshot = {
    generated_at: new Date().toISOString(),
    stats: CITATION_NETWORK_STATS,
    clusters: CLUSTER_TABLE,
    top_hubs: DEGREE_TABLE.slice(0, 15),
    authorities: AUTHORITY_TABLE,
    on_site_references: ON_SITE_REFERENCES,
    full_degree_table: DEGREE_TABLE,
  };
  mkdirSync(dirname(DST), { recursive: true });
  writeFileSync(DST, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`[B-5] wrote ${DST}`);
}

audit();
emit();
