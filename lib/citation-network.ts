/**
 * Citation network for /glossary/ scope.
 *
 * Builds in-memory indices over GLOSSARY:
 *   1. Backrefs — given a slug, which entries list it in their relatedTerms.
 *   2. Citation domain frequency — which authority domains anchor the network.
 *   3. Bidirectional graph — for the /glossary/ index page cluster view.
 *   4. Cross-page anchor map — page paths (cities/states/equivalent) that
 *      ought to backlink each term, surfaced via hashtag-style anchors.
 *
 * Veto #7 status: CLEAR — derivative graph over primary-cited entries only;
 * no new content is synthesized in this module.
 */
import { GLOSSARY, type GlossaryEntry } from './glossary-data';

export type Backref = {
  slug: string;
  term: string;
  category: GlossaryEntry['category'];
};

const BACKREFS: Map<string, Backref[]> = (() => {
  const m = new Map<string, Backref[]>();
  for (const e of GLOSSARY) {
    for (const related of e.relatedTerms) {
      const arr = m.get(related) ?? [];
      arr.push({ slug: e.slug, term: e.term, category: e.category });
      m.set(related, arr);
    }
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.term.localeCompare(b.term));
  }
  return m;
})();

const FORWARD: Map<string, GlossaryEntry> = new Map(
  GLOSSARY.map((e) => [e.slug, e]),
);

/**
 * Entries that list `slug` in their relatedTerms — i.e., who points at me.
 */
export function getBackrefs(slug: string): Backref[] {
  return BACKREFS.get(slug) ?? [];
}

/**
 * Forward edges — what this entry points at, with full context.
 */
export function getForwardLinks(slug: string): Backref[] {
  const entry = FORWARD.get(slug);
  if (!entry) return [];
  const out: Backref[] = [];
  for (const r of entry.relatedTerms) {
    const target = FORWARD.get(r);
    if (target) {
      out.push({ slug: target.slug, term: target.term, category: target.category });
    }
  }
  return out;
}

/**
 * Combined in+out degree — used to highlight network "hubs"
 * (terms that anchor the most other entries).
 */
export type DegreeRow = {
  slug: string;
  term: string;
  category: GlossaryEntry['category'];
  inDegree: number;
  outDegree: number;
  total: number;
};

export const DEGREE_TABLE: ReadonlyArray<DegreeRow> = (() => {
  const rows: DegreeRow[] = [];
  for (const e of GLOSSARY) {
    const inDeg = (BACKREFS.get(e.slug) ?? []).length;
    const outDeg = e.relatedTerms.length;
    rows.push({
      slug: e.slug,
      term: e.term,
      category: e.category,
      inDegree: inDeg,
      outDegree: outDeg,
      total: inDeg + outDeg,
    });
  }
  rows.sort((a, b) => b.total - a.total || a.term.localeCompare(b.term));
  return rows;
})();

export function getTopHubs(limit = 10): DegreeRow[] {
  return DEGREE_TABLE.slice(0, limit);
}

/**
 * Authority frequency — which external domains anchor the citation network.
 * A term cited by 5+ different entries is a strong trust signal for that domain.
 */
export type AuthorityRow = {
  domain: string;
  count: number;
  citingSlugs: string[];
};

export const AUTHORITY_TABLE: ReadonlyArray<AuthorityRow> = (() => {
  const m: Map<string, Set<string>> = new Map();
  for (const e of GLOSSARY) {
    for (const c of e.citations) {
      let host: string;
      try {
        host = new URL(c.url).hostname.replace(/^www\./, '');
      } catch {
        continue;
      }
      const set = m.get(host) ?? new Set<string>();
      set.add(e.slug);
      m.set(host, set);
    }
  }
  const rows: AuthorityRow[] = [];
  for (const [domain, slugs] of m.entries()) {
    rows.push({
      domain,
      count: slugs.size,
      citingSlugs: Array.from(slugs).sort(),
    });
  }
  rows.sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
  return rows;
})();

/**
 * Cross-page anchor map — for each glossary slug, the on-site page paths
 * that conceptually reference the term. Used by /sources/ index and by
 * city/state pages to surface "Learn more in glossary" links.
 *
 * Note: this is a curated, hand-maintained map (not auto-derived) because
 * implicit references in narrative text don't lend themselves to grep.
 */
export const ON_SITE_REFERENCES: Record<string, string[]> = {
  'regional-price-parity': ['/cities/[slug]', '/state/[slug]', '/equivalent/[pair]', '/trend/'],
  'rpp-all-items': ['/cities/[slug]', '/state/[slug]'],
  'rpp-goods': ['/cities/[slug]', '/state/[slug]'],
  'rpp-housing': ['/cities/[slug]/utility-bill', '/state/[slug]'],
  'rpp-utilities': ['/cities/[slug]/utility-bill'],
  'rpp-other-services': ['/cities/[slug]'],
  'pce-price-index': ['/trend/', '/cities/[slug]'],
  'msa': ['/cities/[slug]', '/state/[slug]'],
  'geofips': ['/sources/'],
  'per-capita-personal-income': ['/cities/[slug]', '/state/[slug]'],
  'real-personal-income': ['/cities/[slug]', '/state/[slug]', '/equivalent/[pair]'],
  'median-household-income': ['/cities/[slug]', '/state/[slug]'],
  'median-rent': ['/cities/[slug]', '/state/[slug]', '/cities/[slug]/utility-bill'],
  'median-home-value': ['/cities/[slug]', '/state/[slug]'],
  'fair-market-rent': ['/cities/[slug]', '/state/[slug]'],
  'area-median-income': ['/cities/[slug]', '/state/[slug]'],
  'cost-burdened-renter': ['/cities/[slug]'],
  'severely-cost-burdened': ['/cities/[slug]'],
  'price-to-rent-ratio': ['/cities/[slug]'],
  'affordability-score': ['/cities/[slug]', '/state/[slug]'],
  'real-wage-equivalent': ['/equivalent/[pair]', '/cities/[slug]'],
  'inflation': ['/trend/'],
  'cpi-vs-pce': ['/sources/'],
  'nominal-vs-real': ['/trend/', '/cities/[slug]'],
  'purchasing-power': ['/equivalent/[pair]'],
  'heating-degree-day': ['/cities/[slug]/utility-bill'],
  'cooling-degree-day': ['/cities/[slug]/utility-bill'],
  'kwh': ['/cities/[slug]/utility-bill'],
  'btu': ['/cities/[slug]/utility-bill'],
  'seer': ['/cities/[slug]/utility-bill'],
  'eer': ['/cities/[slug]/utility-bill'],
  'cop': ['/cities/[slug]/utility-bill'],
  'afue': ['/cities/[slug]/utility-bill'],
};

export function getOnSiteReferences(slug: string): string[] {
  return ON_SITE_REFERENCES[slug] ?? [];
}

/**
 * Cluster export — for /glossary/ index page graph view.
 * Each cluster groups entries by category with internal/external edge counts.
 */
export type ClusterRow = {
  category: GlossaryEntry['category'];
  entryCount: number;
  internalEdges: number; // edges where both ends are in this category
  externalEdges: number; // edges crossing categories
};

export const CLUSTER_TABLE: ReadonlyArray<ClusterRow> = (() => {
  const byCat: Map<string, GlossaryEntry[]> = new Map();
  for (const e of GLOSSARY) {
    const arr = byCat.get(e.category) ?? [];
    arr.push(e);
    byCat.set(e.category, arr);
  }
  const rows: ClusterRow[] = [];
  for (const [cat, entries] of byCat.entries()) {
    let internal = 0;
    let external = 0;
    const slugSet = new Set(entries.map((e) => e.slug));
    for (const e of entries) {
      for (const r of e.relatedTerms) {
        if (slugSet.has(r)) internal++;
        else external++;
      }
    }
    rows.push({
      category: cat as GlossaryEntry['category'],
      entryCount: entries.length,
      internalEdges: internal,
      externalEdges: external,
    });
  }
  rows.sort((a, b) => b.entryCount - a.entryCount);
  return rows;
})();

export const CITATION_NETWORK_STATS = {
  totalEntries: GLOSSARY.length,
  totalRelatedEdges: GLOSSARY.reduce((s, e) => s + e.relatedTerms.length, 0),
  totalCitations: GLOSSARY.reduce((s, e) => s + e.citations.length, 0),
  uniqueAuthorities: AUTHORITY_TABLE.length,
  topHub: DEGREE_TABLE[0]?.term ?? null,
  topHubSlug: DEGREE_TABLE[0]?.slug ?? null,
  topAuthority: AUTHORITY_TABLE[0]?.domain ?? null,
} as const;
