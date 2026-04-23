import { getMetroBySlug, type Metro } from "@/lib/db";
import { STATE_NAMES } from "@/lib/us-states";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Metadata } from "next";
import * as fs from "fs";
import * as path from "path";

/**
 * /compare/ hub page — 2026-04-23 Phase 2 P3 rewrite.
 *
 * Previously: grid of 20 links from getTopComparisons(20) SQL (RPP-diff sort).
 * Problem: after Phase 2 P0 prune the /compare/ route is dynamicParams=false
 * + static set of featured (20) + GSC whitelist (23) = 43 unique pairs. Any
 * link the hub rendered from the old Top-N SQL had high odds of pointing to
 * a URL that now notFound()s — poor UX, poor internal link equity.
 *
 * New hub: (a) Featured comparisons grouped by editorial theme, (b) full
 * "Browse by State" index covering all 43 pairs, (c) transparency blurb
 * explaining the curation criteria (E-E-A-T).
 *
 * Captures Tier C generic queries per GSC: "cost of living comparison [state]",
 * "compare cities in [state]", "cost comparison tool".
 */

interface FeaturedEntry { slugA: string; slugB: string; theme: string; }
interface WhitelistEntry { slugA: string; slugB: string; imprs: number; }

interface PairWithMetros {
  canonical: string; // sorted slug pair
  a: Metro;
  b: Metro;
  theme?: string;
  imprs?: number;
}

function canonicalPair(a: string, b: string): string {
  return [a, b].sort().join("-vs-");
}

function loadFeatured(): FeaturedEntry[] {
  const p = path.resolve(process.cwd(), "data", "compare-featured.json");
  if (!fs.existsSync(p)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const seen = new Set<string>();
    const out: FeaturedEntry[] = [];
    for (const e of raw.pairs ?? []) {
      const a = String(e.slugA || "");
      const b = String(e.slugB || "");
      const theme = String(e.theme || "other");
      if (!a || !b || a === b) continue;
      const key = canonicalPair(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ slugA: a, slugB: b, theme });
    }
    return out;
  } catch {
    return [];
  }
}

function loadWhitelist(): WhitelistEntry[] {
  const p = path.resolve(process.cwd(), "data", "compare-whitelist.json");
  if (!fs.existsSync(p)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    // Dedupe by canonical pair, sum impressions
    const agg = new Map<string, { slugA: string; slugB: string; imprs: number }>();
    for (const e of raw.entries ?? []) {
      const rel = String(e.path || "")
        .replace(/^\/compare\//, "")
        .replace(/\/$/, "");
      const m = rel.match(/^(.+)-vs-(.+)$/);
      if (!m) continue;
      const [a, b] = [m[1], m[2]].sort();
      const key = `${a}-vs-${b}`;
      const imprs = Number(e.imprs || 0);
      const prev = agg.get(key);
      if (prev) prev.imprs += imprs;
      else agg.set(key, { slugA: a, slugB: b, imprs });
    }
    return Array.from(agg.values());
  } catch {
    return [];
  }
}

function hydrate(slugA: string, slugB: string, theme?: string, imprs?: number): PairWithMetros | null {
  const a = getMetroBySlug(slugA);
  const b = getMetroBySlug(slugB);
  if (!a || !b) return null;
  return { canonical: canonicalPair(slugA, slugB), a, b, theme, imprs };
}

const THEME_LABELS: Record<string, { title: string; blurb: string }> = {
  "tech-migration": {
    title: "Tech Hub Migrations",
    blurb: "Classic Bay Area, Seattle, and Austin relocation pairs — common for remote workers evaluating where a tech salary stretches further.",
  },
  "classic-metro": {
    title: "Major Metro Rivalries",
    blurb: "Big-city head-to-heads people actually compare — NYC vs LA, NYC vs Chicago, Boston, and Miami.",
  },
  "finance-exodus": {
    title: "Finance & Professional Moves",
    blurb: "Documented Wall Street → South Florida relocation pattern.",
  },
  sunbelt: {
    title: "Sunbelt Relocations",
    blurb: "Northern metros vs Sunbelt destinations — Atlanta, Phoenix, Tampa, Las Vegas — the main cost-of-living-driven migration of the decade.",
  },
  "intra-state": {
    title: "Within-State Alternatives",
    blurb: "People evaluating Austin vs Dallas, LA vs San Diego, or Dallas vs Houston without changing state tax regimes.",
  },
  regional: {
    title: "Regional Neighbors",
    blurb: "Nearby metros in the same economic region — the DC↔Baltimore, Denver↔SLC, Atlanta↔Charlotte patterns.",
  },
  other: {
    title: "Other Featured",
    blurb: "Additional editorial selections.",
  },
};

const THEME_ORDER = [
  "tech-migration",
  "classic-metro",
  "finance-exodus",
  "sunbelt",
  "intra-state",
  "regional",
  "other",
];

export const metadata: Metadata = {
  title: "Compare Cost of Living Between US Cities",
  description:
    "Side-by-side cost of living comparisons across major US metro areas. Housing, goods, utilities, and income data for 40+ curated city pairs grouped by theme and state.",
  alternates: { canonical: "/compare/" },
  openGraph: {
    title: "Compare Cost of Living Between US Cities",
    description:
      "40+ curated city-pair cost of living comparisons, grouped by relocation theme and by state. Real BEA RPP and Census ACS data.",
    url: "/compare/",
  },
};

export default function ComparePage() {
  const featured = loadFeatured();
  const whitelist = loadWhitelist();

  // Hydrate to full metro info, drop any orphaned pairs (metro not in DB)
  const hydratedFeatured = featured
    .map((p) => hydrate(p.slugA, p.slugB, p.theme))
    .filter((p): p is PairWithMetros => p !== null);

  // Featured pair canonical set — so whitelist doesn't double-list the same pair
  const featuredCanonical = new Set(hydratedFeatured.map((p) => p.canonical));
  const hydratedWhitelist = whitelist
    .filter((p) => !featuredCanonical.has(canonicalPair(p.slugA, p.slugB)))
    .map((p) => hydrate(p.slugA, p.slugB, undefined, p.imprs))
    .filter((p): p is PairWithMetros => p !== null);

  const allPairs = [...hydratedFeatured, ...hydratedWhitelist];

  // Group featured by theme (preserve THEME_ORDER)
  const byTheme = new Map<string, PairWithMetros[]>();
  for (const p of hydratedFeatured) {
    const t = p.theme ?? "other";
    if (!byTheme.has(t)) byTheme.set(t, []);
    byTheme.get(t)!.push(p);
  }
  const themeSections = THEME_ORDER
    .filter((t) => byTheme.has(t))
    .map((t) => ({ theme: t, pairs: byTheme.get(t)! }));

  // Group all pairs by state — each pair appears under each state it touches
  const byState = new Map<string, PairWithMetros[]>();
  for (const p of allPairs) {
    const states = new Set([p.a.state, p.b.state]);
    for (const s of states) {
      if (!byState.has(s)) byState.set(s, []);
      byState.get(s)!.push(p);
    }
  }
  const stateSections = Array.from(byState.keys())
    .sort((x, y) => (STATE_NAMES[x] || x).localeCompare(STATE_NAMES[y] || y))
    .map((state) => ({
      state,
      fullName: STATE_NAMES[state] || state,
      pairs: byState
        .get(state)!
        .sort((p1, p2) => `${p1.a.short_name} ${p1.b.short_name}`.localeCompare(`${p2.a.short_name} ${p2.b.short_name}`)),
    }));

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare/" },
  ];

  const itemListItems = allPairs.map((p) => ({
    name: `${p.a.short_name} vs ${p.b.short_name}`,
    url: `/compare/${p.canonical}/`,
  }));

  return (
    <div>
      <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

      <h1 className="text-3xl font-bold mb-3">Compare Cost of Living Between US Cities</h1>
      <p className="text-slate-600 mb-6 leading-relaxed">
        Side-by-side cost of living for {allPairs.length} curated US metro pairs. Each comparison uses
        BEA Regional Price Parities for overall cost, housing, goods, and services, plus Census ACS
        income and housing data. Pairs are organized by the relocation patterns people actually research
        — not every possible city × city combination.
      </p>

      {themeSections.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Featured Comparisons</h2>
          <div className="space-y-6">
            {themeSections.map(({ theme, pairs }) => {
              const meta = THEME_LABELS[theme] || THEME_LABELS.other;
              return (
                <div key={theme}>
                  <h3 className="text-lg font-semibold mb-1">{meta.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{meta.blurb}</p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    {pairs.map((p) => (
                      <a
                        key={p.canonical}
                        href={`/compare/${p.canonical}/`}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-emerald-600 hover:underline"
                      >
                        {p.a.short_name} vs {p.b.short_name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {stateSections.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Browse by State</h2>
          <p className="text-sm text-slate-500 mb-4">
            Comparisons involving a metro in each state. Cross-state pairs appear under both states.
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
            {stateSections.map(({ state, fullName, pairs }) => (
              <div key={state}>
                <h3 className="text-base font-semibold mb-2">
                  {fullName} <span className="text-slate-400 font-normal">({pairs.length})</span>
                </h3>
                <ul className="space-y-1 text-sm">
                  {pairs.map((p) => (
                    <li key={p.canonical}>
                      <a href={`/compare/${p.canonical}/`} className="text-emerald-600 hover:underline">
                        {p.a.short_name} vs {p.b.short_name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6 bg-slate-50 rounded-lg p-5 text-sm text-slate-600 leading-relaxed">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">How these pairs are chosen</h2>
        <p className="mb-2">
          We publish {allPairs.length} comparison pages rather than every possible{" "}
          {allPairs.length > 0 ? "384 × 384" : "city × city"} permutation. Curation criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Editorial featured pairs</strong> — documented relocation patterns (tech-hub migration,
            Sunbelt moves, major metro rivalries, within-state alternatives).
          </li>
          <li>
            <strong>Search-validated pairs</strong> — pages that already receive organic search traffic
            (Google Search Console: clicks &gt; 0 or impressions ≥ 3 over 28 days).
          </li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Pair data sources: BEA Regional Price Parities (metro-level, annual) and US Census American
          Community Survey 5-year estimates (median income, home value, rent).
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListSchema("Curated US City Cost of Living Comparisons", "/compare/", itemListItems),
          ),
        }}
      />
    </div>
  );
}
