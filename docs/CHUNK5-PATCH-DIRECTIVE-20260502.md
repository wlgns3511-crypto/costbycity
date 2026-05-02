# costbycity HCU 5-청크 patch directive (2026-05-02)

> **Tier S Depth Expansion** + **COL Dictionary** + **16-year RPP Trend** + **Climate-Adjusted Energy Cost** + **Affordability Score**
> Following oshapeek/taxdeductionpeek/salarybycity pattern. Veto #7 CLEAR, Veto #8 ADOPTED.

---

## §0 Veto #7 status + Veto #8 application

### Veto #7 (Synthetic data prevalence)
**STATUS: CLEAR.** All proposed additions use REAL primary-source data:
- BEA Regional Price Parities 2008-2024 (16 years)
- US Census ACS 5-year median income/rent/home value
- NREL Heating/Cooling Degree-Days (climate)
- EIA average residential electricity rate by state
- BLS Glossary + Investopedia + IRS public terminology

No synthetic generation. No interpolation. No "estimated" placeholders.

### Veto #8 (data/raw/ check before declaring source blocked)
**APPLIED.** Pre-flight verified:
- `data/raw/` does **NOT EXIST** (folder absent) → all source CSVs must be re-downloaded
- `data/costliving.db` (9.9 MB) has 5 years RPP (2020-2024) → 12 more years for full history
- `data/costbycity.db` and `data/main.db` are 0 bytes → unused
- `scripts/fetch-data.py` exists (proven download path)
- BEA RPP fetch path proven (BEA SARPP/MARPP CSV, free, annual update)
- NREL HDD/CDD fetch new (need new script)
- EIA electricity rate new (need new script)

---

## §1 Pre-flight gates (G1-G9)

| Gate | Check | Status | Action if FAIL |
|------|-------|--------|----------------|
| G1 | `git status` clean (or only intentional WIP) | check before Phase A | commit/stash WIP |
| G2 | `costliving.db` has 5 years RPP (9,675 rows) | ✅ verified | re-import if missing |
| G3 | BEA RPP 2008-2019 download successful | ❌ NOT YET | Phase B-1 task |
| G4 | NREL HDD/CDD CSV downloaded (387 metros) | ❌ NOT YET | Phase B-2 task |
| G5 | EIA residential electricity rate (51 states) | ❌ NOT YET | Phase B-2 task |
| G6 | Glossary content drafted (50 terms) | ❌ NOT YET | Phase B-3 task |
| G7 | Existing routes (/cities/, /state/) still 200 | ✅ verified (3,960 + 2,000 words) | smoke-test before deploy |
| G8 | **Middleware bare passthrough — Phase A NEEDED** | ⚠️ CONFIRMED | Phase A is REAL work this time |
| G9 | Disk free on s1 (DB will grow ~10MB → ~25MB) | check `df -h /` on s1 | warn user if <20% free |

---

## §2 Asset audit (current state)

### Current sitemap composition (1,290 URLs)

| Bucket | Count | Status |
|--------|-------|--------|
| `/cities/{slug}/` | 387 | ✅ ~3,960 words/page (deep!) |
| `/cities/{slug}/housing-breakdown/` | 387 | ✅ sub-page |
| `/cities/{slug}/utility-bill/` | 387 | ✅ sub-page |
| `/state/{2-letter}/` | 51 | ✅ ~2,000 words (lowercase 2-letter slug) |
| `/blog/{slug}/` | 49 | ✅ |
| `/rankings/{type}/` | 13 | ⚠️ MIXED (most-expensive 200, cheapest 404) |
| `/insights/{topic}/` | 7 | ✅ thematic essays |
| `/guide/{slug}/` | 6 | ✅ |
| `/compare/` (root only) | 1 | ⚠️ noindex'd, scaffolding remains |
| 정적 정책 페이지 | ~12 | ✅ |
| **Total** | **1,290** | sitemap-to-reality match: HIGH (after slug correction) |

### Current data depth (`costliving.db`, 9.9 MB)

| Table | Rows | Coverage | Note |
|-------|------|----------|------|
| metros | 387 | All BEA MSAs with RPP | FIPS-keyed |
| rpp | 9,675 | 387 × 5 years × 5 categories | **only 2020-2024** |
| acs | 939 | Census 5-yr ACS by FIPS | income, rent, home value, per capita |
| comparisons | 74,691 | curated pair list (mostly unused) | /compare/ killed |

**Critical gaps:**
1. ❌ Only 5 years RPP (2020-2024) — BEA publishes 2008+ → 12 years missing
2. ❌ NO climate data (heating/cooling cost — major COL component)
3. ❌ NO energy rate by state/metro
4. ❌ NO transit cost data
5. ❌ NO affordability score (raw RPP doesn't account for income — Boise vs SF require income context)
6. ❌ NO glossary/dictionary content
7. ⚠️ /es/ alive at 200 (same problem taxded had — fixed there, broken here)
8. ⚠️ Middleware is BARE PASSTHROUGH (no quarantine, no edge version)

### Asset surplus (already present, underutilized)

- ✅ `AffordabilityCalc.tsx` component exists in `components/tools/` — needs route + wiring
- ✅ `RelocationCalculator.tsx`, `CostIndex.tsx`, `CostIndexChart.tsx` already built
- ✅ acs table has income/rent/home_value/per_capita — affordability score data ready
- ✅ comparisons table has 74,691 pairs (use a few for related-cities widget)
- ✅ `getStateNarrative`, `getStateFactsByCode`, `cost-commentary.ts` template engines
- ✅ TableOfContents, InsightBlock, RelatedEntities, AnswerHero, DecisionNext — full HCU upgrades
- ✅ AdSense scaled-content remediation already done (commit 122c626 trailing slash unified)

---

## §3 8 differentiator candidates (top 4 ⭐ for Phase C)

### ⭐ #1 — COL Dictionary / Glossary (USER REQUESTED)

**What:** 50 reference entries covering RPP methodology, COL concepts, housing burden math, federal stats sources.

**Sample entries:**
- Regional Price Parity (RPP) vs Cost-of-Living Index — technical distinction
- Housing burden ratio (>30% = "cost-burdened" per HUD definition)
- ACS 5-year vs 1-year estimates — when each is right
- MSA vs CSA vs CBSA — geography unit confusion
- BEA "all-items" vs "goods" vs "services" RPP categories
- Heating-degree-days (HDD) and how they impact energy cost
- ENERGY STAR average household consumption
- Renter vs Owner Cost-of-Living gap
- Income-Adjusted Affordability vs raw RPP
- Median vs Mean income (skew impact in metros)
- Per-capita income vs household income
- Effective rent vs nominal rent (ACS reporting nuance)

**Differentiator:** Most COL sites have 1-paragraph FAQ. **Dedicated glossary with primary-source citations** (BEA Methodology PDF, HUD definitions, Census ACS Technical Documentation) is rare. Each entry 200-500 words.

**SEO opportunity:** "What is a Regional Price Parity", "Is 30% housing burden too high", "BEA vs BLS COL difference" — 50+ exact long-tail queries.

**Cost:** ~2-3 days drafting (or LLM-assisted with strict citation enforcement).

### ⭐ #2 — 16-year RPP Trend (2008-2024)

**What:** Import BEA RPP 2008-2019 → extend to full 16-year history.

**Why this is huge for COL site:**
- "Boise had +35% RPP growth 2008-2024 vs national +18%" → migration-pattern story
- "Pittsburgh's RPP fell -3% relative to national since 2008" → reverse story
- Each /cities/{slug}/ gets 16-year line chart (server SVG)

**Data:** BEA SARPP 2008-2024 + MARPP 2008-2024. Free CSV, ~5 MB total.

**Implementation:**
- Extend rpp table (no schema change, just more rows: 9,675 → ~31,000)
- New component: `<RppTrendChart />` (server SVG, ~100 LOC)
- New page subsection on /cities/{slug}/ + /state/{slug}/

### ⭐ #3 — Income-Adjusted Affordability Score (composite metric)

**What:** Combine RPP + ACS median income + housing burden = unique "Real Affordability" score.

**Formula example:**
```
RealAffordability = (median_income × 100) / (median_rent × 12 × RPP_factor)
```

**Why differentiator:**
- Raw RPP says Boise (95) is cheaper than national (100)
- BUT ACS shows Boise income ($65K) << SF income ($120K)
- Real affordability: Boise actually WORSE than SF for many incomes
- This nuance is RARELY exposed by COL sites — they show RPP only

**Implementation:**
- Pure derived metric (no new external data)
- Component: `<AffordabilityScoreCard />` (server SVG ranking gauge)
- Wire into /cities/{slug}/ + dedicated /tools/affordability-calculator/ (formalize existing AffordabilityCalc.tsx)

**Story angles per page:**
- "Boise's $65K median income + 95 RPP = effective purchasing power $X (vs SF $Y)"
- "If you earn $80K, your Boise dollar buys 22% more groceries but 8% less housing"

### ⭐ #4 — Climate-Adjusted Energy Cost

**What:** Per-metro annual heating + cooling cost using NREL HDD/CDD × EIA electricity rates.

**Data sources:**
- **NREL TMY3** (Typical Meteorological Year): HDD + CDD per ZIP/metro
- **EIA Form 826**: residential electricity rate ¢/kWh by state (monthly, 2001+)
- **DOE Building Energy Data Book**: typical home BTU/yr per HDD/CDD

**Formula:**
```
AnnualHVACCost ≈ (HDD × heatingBTU/HDD + CDD × coolingBTU/CDD) × stateElecRate / heatingEfficiency
```

**Differentiator vs competitors:**
- Numbeo, Bestplaces show "utilities $X" generic
- We compute **what-if** by climate: "Phoenix vs Minneapolis = $1,840/yr HVAC differential"
- Tied to actual physics + government data, not survey averages

**Implementation:**
- Phase B-2 download HDD/CDD + electricity rates
- Phase C component: `<ClimateEnergyCost />` (server SVG bar comparison)
- Wire into /cities/{slug}/utility-bill/ (sub-page already exists, extend it)

---

### Other 4 candidates (NOT in Phase C, deferred or rejected)

#### #5 — Transit / Commute Cost (BLS CES + Census ACS B08303)

**What:** Average household transportation expenditure + median commute time per metro.

**Why deferred:** Transit data is geo-coarse (BLS CES is regional, not MSA-level). Adds complexity for moderate value. Better as Phase E.

#### #6 — Crime Index (FBI UCR / NIBRS)

**What:** Per-metro property + violent crime rate.

**Why deferred:** YMYL-adjacent (crime data → safety decisions). Needs careful editorial framing + disclaimers. Not in Phase C unless user explicitly opts in.

#### #7 — School Quality (NCES NAEP + GreatSchools)

**What:** K-12 quality metrics by metro.

**Why rejected this chunk:** GreatSchools has commercial license restrictions. NCES NAEP only state-level (not metro). YMYL risk.

#### #8 — Revive curated /compare/ (top 100 city pairs)

**What:** Re-launch /compare/{cityA}/{cityB}/ with top 100 popular pairs.

**Why deferred:** GSC penalty already incurred (commit history shows 2 prune cycles). Reviving requires 6-month buffer + URL rebrand (e.g., /relocation/{from}/{to}/). DEFER to Phase F.

---

## §4 Doctrine alignment

| Doctrine | Status | Note |
|----------|--------|------|
| **HCU 5-청크 playbook** | ✅ Phase A/B/C/D structure | matches taxded + oshapeek + salarybycity |
| **Veto #7 (synthetic prevalence)** | ✅ CLEAR | all data primary-source |
| **Veto #8 (data/raw/ check)** | ✅ APPLIED | data/raw/ folder ABSENT confirmed |
| **Trap #16 (NoFallbackError)** | ⚠️ N/A this chunk | Phase A uses NextResponse direct, no rewrite |
| **Trap #34 (Tailwind dynamic)** | ⚠️ AVOID | new charts use static color classes only |
| **Trap #36 (RSC SDC hex split)** | ⚠️ AVOID | charts use `style={{ fill: '#XXX' }}` not className |
| **Trap #59 (TS data modules)** | ✅ APPLIED | climate + glossary + electricity as TS modules |
| **Trap #73 (robots.txt parity)** | ⚠️ NEEDS PARITY | public/robots.txt + app/robots.ts must align after Phase A adds /es/ |
| **Trap #79-82 (taxded patches)** | reference only | no overlap |
| **Soft-404 portfolio sweep (#88)** | ✅ ALREADY DONE | commit 35d1dde + d4f145f |
| **AdSense thin escape** | ✅ TARGET | each new page 800+ words real-data narrative |

---

## §5 Phase A/B/C/D commit plans

### Phase A — Real middleware (NOT AUDIT — actual work, 2-3 hours)

**Scope:** costbycity has BARE middleware. This is full Phase A doctrine — synthetic quarantine + edge version + /es/ kill + robots parity.

**Tasks:**
1. Replace `middleware.ts` with full Phase A pattern:
   ```typescript
   const ES_KILL_RE = /^\/es(\/.*)?$/;
   const HTTPS_KILL_RE = /^\/https:/;
   const SYNTHETIC_QUARANTINE_RE = /^\/(search|category|rankings|compare)(\/|$)/;
   const EDGE_VERSION = '2026-05-02-tier-s-expansion';
   ```
2. /es/ → HARD 410 (Trap #16 safe — direct NextResponse, no rewrite)
3. Synthetic paths → X-Robots-Tag: noindex, nofollow (AXIS B advisory)
4. /https:/ → 410 (synthetic crawler probes)
5. Edge version header on all responses
6. Delete `app/es/` folder (3 files: layout.tsx, page.tsx, cities/[slug]/page.tsx)
7. Update `app/robots.ts` to add `/es/` + `/embed/` + `/compare/` to disallow
8. Update `public/robots.txt` to match (Trap #73 parity)
9. Optional: `app/410/page.tsx` (belt-and-suspenders for any rewrite path)

**Commit:** `HCU 5-청크 Phase A costbycity: middleware quarantine + /es/ kill + robots parity (Trap #73)`

**Deploy:** `_shared/docker/docker-build-deploy.sh costbycity`

**Verify:**
- `curl -sI https://costbycity.com/` → `x-edge-version: 2026-05-02-tier-s-expansion`
- `curl -sI https://costbycity.com/es/` → 410
- `curl -sI https://costbycity.com/search/` → 200 + X-Robots-Tag: noindex, nofollow
- `curl -s https://costbycity.com/robots.txt` includes `Disallow: /es/`

---

### Phase B-1 — BEA RPP historical backfill (2-3 hours)

**Scope:** Download BEA RPP 2008-2019 → extend `rpp` table.

**Tasks:**
1. New script: `scripts/download-bea-rpp.ts`
   - SARPP (state) 2008-2024 from `apps.bea.gov/regional/zip/SARPP.zip`
   - MARPP (metro) 2008-2024 from `apps.bea.gov/regional/zip/MARPP.zip`
2. Extend `scripts/fetch-data.py` (or new TS script) to multi-year merge
3. Insert into existing `rpp` table (no schema change, just more rows)
4. Verify: `SELECT year, COUNT(*) FROM rpp GROUP BY year` returns 2008-2024 each ~2,000 rows
5. Total rpp grows: 9,675 → ~32,000 rows (still small)

**Commit:** `HCU 5-청크 Phase B-1 costbycity: BEA RPP 2008-2019 backfill (16-year history)`

**Risk:** BEA changed metro definitions in 2013 + 2018 + 2023 (CBSA boundary updates). Some metros pre-2013 use old FIPS. Plan: keep ALL FIPS, mark "boundary changed" in metadata if FIPS changed for same metro name.

---

### Phase B-2 — Climate + Energy data (2-3 hours)

**Scope:** Download NREL HDD/CDD per metro + EIA electricity rate per state.

**Tasks:**
1. New script: `scripts/download-nrel-climate.ts`
   - NREL TMY3 station list with HDD/CDD: `nsrdb.nrel.gov` (free)
   - Cross-walk weather station to nearest MSA centroid
2. New script: `scripts/download-eia-electricity.ts`
   - EIA Form 826: `eia.gov/electricity/monthly/epm_table_grapher.php` 
   - Annual residential rate ¢/kWh by state
3. New TS module: `lib/climate-data.ts`
   ```typescript
   export interface MetroClimate {
     fips: string;
     hdd: number;        // heating-degree-days/yr
     cdd: number;        // cooling-degree-days/yr
     elecRateCents: number;  // state-level
     annualHvacCost: number; // computed
   }
   export const METRO_CLIMATE: Record<string, MetroClimate> = {...};  // ~387 entries
   ```
4. New TS module: `lib/electricity-rates.ts` (state × year)
5. Verify: `getMetroClimate('10180')` returns Abilene TX HDD ~2,500, CDD ~3,000

**Commit:** `HCU 5-청크 Phase B-2 costbycity: NREL climate + EIA electricity TS modules (Trap #59)`

---

### Phase B-3 — COL Glossary content (2-3 hours)

**Scope:** Draft 50 reference entries with primary-source citations.

**Tasks:**
1. New TS module: `lib/glossary-data.ts`
   ```typescript
   export interface GlossaryEntry {
     slug: string;
     term: string;
     short_def: string;       // 1-sentence
     long_def: string;        // 200-500 words
     citations: { source: string; url: string }[];
     related_terms: string[];
     category: 'BEA' | 'Census' | 'HUD' | 'Energy' | 'general';
   }
   export const GLOSSARY: GlossaryEntry[] = [...];  // 50 entries
   ```

2. Categories breakdown:
   - **BEA / RPP** (12): RPP methodology, all-items vs goods, services, housing, rents, services, geographic units
   - **Census / ACS** (10): MSA vs CSA vs CBSA, ACS 5-yr vs 1-yr, FIPS codes, median income, per capita income
   - **HUD / Housing** (10): housing burden 30%, fair market rent, rent burden, owner vs renter cost, AMI
   - **Energy / Climate** (8): HDD/CDD, EIA residential rate, kWh consumption, ENERGY STAR averages
   - **General COL concepts** (10): Real vs nominal cost, inflation-adjusted COL, Big Mac Index, COLA, Numbeo vs BEA difference

3. Each entry MUST cite primary source — Veto #7 compliance.

**Commit:** `HCU 5-청크 Phase B-3 costbycity: 50-entry COL glossary (Trap #59 TS module)`

---

### Phase C — UX components + new routes (5-7 hours)

#### C-1: New components (server SVG, no client deps)

| Component | LOC | Purpose | Used by |
|-----------|-----|---------|---------|
| `RppTrendChart.tsx` | ~100 | 16-yr line chart (server SVG) | /cities/{slug}/, /state/{slug}/ |
| `AffordabilityScoreCard.tsx` | ~80 | Composite score gauge (server SVG) | /cities/{slug}/ |
| `ClimateEnergyCost.tsx` | ~70 | HDD/CDD bar + $/yr (server SVG) | /cities/{slug}/utility-bill/ |
| `RelocationDeltaCard.tsx` | ~60 | "Move A→B = +$X COL change" | /tools/affordability-calculator/ |
| `GlossaryTermCard.tsx` | ~40 | Entry card | /glossary/ |
| `GlossaryEntryBody.tsx` | ~60 | Full entry rendering | /glossary/{slug}/ |

**Trap #34/#36 safety:** All chart fills via `style={{ fill: '#XXX' }}`, no `bg-${color}` patterns.

#### C-2: New routes

| Route | Source | Cardinality |
|-------|--------|-------------|
| `/glossary/` | GLOSSARY index | 1 |
| `/glossary/{slug}/` | GLOSSARY entries | ~50 |
| `/tools/affordability-calculator/` | static + form action | 1 |
| `/tools/relocation-cost/` | static + form action | 1 |
| `/tools/` | tools index | 1 |

#### C-3: Wire into existing hubs

- **/cities/{slug}/**: insert `<RppTrendChart />` after CostIndex, `<AffordabilityScoreCard />` near top, link to `/tools/affordability-calculator/?city={slug}`
- **/cities/{slug}/utility-bill/**: insert `<ClimateEnergyCost />` (existing sub-page becomes much richer)
- **/state/{slug}/**: insert `<RppTrendChart />` for state aggregate
- **/insights/{topic}/**: cross-link from new /glossary/ entries (e.g., "rent-burden" insights ↔ "housing-burden" glossary)

**Commit:** `HCU 5-청크 Phase C costbycity: 6 components + glossary + tools routes`

---

### Phase D — Sitemap + verify (1-2 hours)

**Scope:** Extend sitemap with new routes, verification script, IndexNow push.

**Tasks:**
1. Extend `scripts/build-sitemap.ts`:
   - Add `/glossary/` (1) + `/glossary/{slug}/` (50)
   - Add `/tools/` (1) + `/tools/affordability-calculator/` (1) + `/tools/relocation-cost/` (1)
   - Total sitemap: 1,290 → ~1,344 URLs
2. New script: `scripts/verify-deploy-20260502.sh`
   - Test 5 random /cities/{slug}/ → expect new chart panels + 200 + 4,000+ words
   - Test 5 random /cities/{slug}/utility-bill/ → expect new ClimateEnergyCost
   - Test 5 random /state/{slug}/ → expect new trend chart
   - Test 10 random /glossary/{slug}/ → 200 + 200+ words + ≥1 citation
   - Test /tools/affordability-calculator/ → 200 + form present + POST works
3. IndexNow push: ~55 new URLs to bing.com
4. (Optional) Refresh existing 1,290 sitemap entries with new lastmod for trend addition

**Commit:** `HCU 5-청크 Phase D costbycity: sitemap +54, verify script, IndexNow push`

---

## §6 Files manifest

### New files
```
data/raw/bea-rpp/SARPP-2008-2024.zip                ~3 MB (Phase B-1)
data/raw/bea-rpp/MARPP-2008-2024.zip                ~5 MB (Phase B-1)
data/raw/nrel-tmy3/station_hdd_cdd.csv              ~500 KB (Phase B-2)
data/raw/eia/state_residential_rate.csv             ~50 KB (Phase B-2)

scripts/download-bea-rpp.ts                                  (Phase B-1)
scripts/download-nrel-climate.ts                             (Phase B-2)
scripts/download-eia-electricity.ts                          (Phase B-2)

lib/climate-data.ts                                          (Phase B-2)
lib/electricity-rates.ts                                     (Phase B-2)
lib/glossary-data.ts                                         (Phase B-3, ~50 entries × 200-500w)
lib/affordability-score.ts                                   (Phase C-1, derived metric)
lib/rpp-trend.ts                                             (Phase C-1, derive series from rpp)

components/RppTrendChart.tsx                                 (Phase C-1)
components/AffordabilityScoreCard.tsx                        (Phase C-1)
components/ClimateEnergyCost.tsx                             (Phase C-1)
components/RelocationDeltaCard.tsx                           (Phase C-1)
components/GlossaryTermCard.tsx                              (Phase C-1)
components/GlossaryEntryBody.tsx                             (Phase C-1)

app/410/page.tsx                                             (Phase A, belt-and-suspenders)
app/glossary/page.tsx                                        (Phase C-2)
app/glossary/[slug]/page.tsx                                 (Phase C-2)
app/tools/page.tsx                                           (Phase C-2)
app/tools/affordability-calculator/page.tsx                  (Phase C-2)
app/tools/relocation-cost/page.tsx                           (Phase C-2)
app/api/affordability/route.ts                               (Phase C-2, form POST)
app/api/relocation/route.ts                                  (Phase C-2, form POST)

scripts/verify-deploy-20260502.sh                            (Phase D)
docs/CHUNK5-PATCH-DIRECTIVE-20260502.md                      (this file)
```

### Modified files
```
middleware.ts                          FULL REWRITE (Phase A)
app/robots.ts                          add /es/, /embed/, /compare/ disallow (Phase A)
public/robots.txt                      add /es/ disallow + parity (Phase A)
scripts/fetch-data.py                  refactor to support BEA multi-year (Phase B-1)
scripts/build-sitemap.ts               +55 URLs (Phase D)
lib/db.ts                              add getRppTrend(), getAffordabilityScore() (Phase C)
lib/cost-commentary.ts                 add affordability narratives (Phase C)
app/cities/[slug]/page.tsx             wire 2 new components (Phase C)
app/cities/[slug]/utility-bill/page.tsx wire ClimateEnergyCost (Phase C)
app/state/[slug]/page.tsx              wire RppTrendChart (Phase C)
app/page.tsx (home)                    add Glossary + Tools nav links (Phase C)
app/layout.tsx                         add /glossary/ + /tools/ to header nav (Phase C)
public/IndexNow.txt                    rotate key if needed (Phase D)
```

### Deleted files
```
app/es/layout.tsx                      Phase A
app/es/page.tsx                        Phase A
app/es/cities/[slug]/page.tsx          Phase A
```

### DB schema changes
```sql
-- Phase B-1: extend rpp (no schema change, just more rows)
-- existing PRIMARY KEY (fips, year, category) handles 2008-2019 backfill

-- Phase B-2: NEW tables
CREATE TABLE climate (
  fips TEXT PRIMARY KEY,
  hdd_annual REAL NOT NULL,
  cdd_annual REAL NOT NULL,
  station_id TEXT,
  station_distance_km REAL
);

CREATE TABLE electricity_rates (
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  cents_per_kwh REAL NOT NULL,
  PRIMARY KEY (state, year)
);
```

---

## §7 Rollout sequence

```
Phase A (2-3h)   → REAL middleware build → deploy → verify edge version + smoke tests
       ↓ 24h Cloudflare cache flush observation window
Phase B-1 (2-3h) → BEA RPP 2008-2019; verify wage row counts (~32K rows)
Phase B-2 (2-3h) → NREL + EIA TS modules; verify climate lookups
Phase B-3 (2-3h) → glossary TS module; verify 50 entries × citations present
       ↓ all data layer changes committed (no deploy yet)
Phase C (5-7h)   → 6 components + 5 routes + wire-ups; LOCAL build verify first
       ↓ deploy → verify all new routes 200 + 800+ words
Phase D (1-2h)   → sitemap +55, verify script 60/60 pass, IndexNow push
       ↓ 7-day GSC observation window
```

**Total estimated effort:** 14-21 hours (1.5-2.5 dev days). Can be split across 2-3 sessions.

**Parallelizable:** B-1, B-2, B-3 are independent — could run as 3 parallel agents if user requests.

---

## §8 Verification checklist

### Phase A verify
- [ ] `curl -sI https://costbycity.com/` → `x-edge-version: 2026-05-02-tier-s-expansion`
- [ ] `curl -sI https://costbycity.com/es/` → 410
- [ ] `curl -sI https://costbycity.com/es/cities/abilene-tx/` → 410
- [ ] `curl -sI https://costbycity.com/https://example.com/` → 410
- [ ] `curl -sI https://costbycity.com/search/` → 200 + X-Robots-Tag: noindex
- [ ] `curl -s https://costbycity.com/robots.txt` matches `app/robots.ts` Disallow list (Trap #73)
- [ ] `curl -sI https://costbycity.com/cities/abilene-tx/` → 200 (no regression)

### Phase B verify (local, before deploy)
- [ ] `sqlite3 data/costliving.db "SELECT year, COUNT(*) FROM rpp GROUP BY year"` → 2008-2024 each ~1,900 rows
- [ ] `sqlite3 data/costliving.db "SELECT COUNT(*) FROM climate"` → ~387
- [ ] `sqlite3 data/costliving.db "SELECT COUNT(*) FROM electricity_rates"` → 51 × 5 yrs = ~250
- [ ] `bun -e "import('./lib/glossary-data').then(m => console.log(m.GLOSSARY.length))"` → 50
- [ ] Each glossary entry has ≥1 citation

### Phase C verify (local, before deploy)
- [ ] `bun run build` succeeds (no Trap #16 / NoFallbackError)
- [ ] `bunx tsc --noEmit` clean
- [ ] `bunx eslint .` clean
- [ ] Sample `/cities/abilene-tx/` includes `<svg class="rpp-trend">` and `<svg class="affordability-score">`
- [ ] Sample `/cities/abilene-tx/utility-bill/` includes `<svg class="climate-energy">`
- [ ] Sample `/glossary/regional-price-parity/` returns 200 + ≥200 words + ≥1 citation link

### Phase D verify (production)
- [ ] sitemap.xml contains 1,344±5 URLs
- [ ] 5 random /cities/{slug}/ → all 200 + new charts visible
- [ ] 5 random /cities/{slug}/utility-bill/ → all 200 + ClimateEnergyCost visible
- [ ] 5 random /state/{slug}/ → all 200 + RppTrendChart visible
- [ ] 10 random /glossary/{slug}/ → all 200 + ≥200 words
- [ ] /tools/affordability-calculator/ + /tools/relocation-cost/ → 200 + POST works
- [ ] IndexNow accepted ≥50/55 URLs

---

## §9 5 open questions for user (ExitPlanMode gate)

### Q1: Glossary scope — 50 vs 100 entries?
- 50 entries: 2-3 hours drafting, ships fast
- 100 entries: 5-6 hours, broader long-tail SEO catch
- **Recommendation:** Start with 50 (Phase B-3) → add 50 more as Phase E if traffic positive.

### Q2: Affordability score — single composite OR multi-dimensional dashboard?
- Single composite (one number): clean UX, easy to grasp, AdSense-safe
- Multi-dimensional (income, housing, transport separately): more depth but cluttered
- **Recommendation:** Single composite headline + 3-component breakdown breakdown below (best of both).

### Q3: BEA boundary changes (2013/2018/2023) — strict per-FIPS OR rebrand to "metro name"?
- Strict per-FIPS: technically correct, but old-FIPS metros disappear after 2013
- Rebrand by metro name: continuity for users, ~5% of metros need fuzzy match
- **Recommendation:** Strict per-FIPS in DB, but display "Note: boundary changed YYYY" disclaimer when historical data uses old FIPS.

### Q4: Climate cost — show absolute $/yr OR delta vs national average?
- Absolute: "Phoenix HVAC = $1,840/yr"
- Delta: "Phoenix HVAC = +$340/yr vs national average"
- Both: clearest, most useful
- **Recommendation:** Both. Absolute headline + delta side-note.

### Q5: Phase E (Transit + Crime) — same chunk OR separate?
- Same chunk: adds 1-2 days, +1 more story angle per /cities/{slug}/
- Separate chunk (recommended): ship Phase A-D first, observe GSC for 1-2 weeks, then Phase E if Phase A-D positive
- Crime data is YMYL-adjacent — needs careful editorial review

---

## §10 vs taxded / oshapeek / salarybycity (comparison)

| Dimension | taxded | oshapeek | salarybycity | **costbycity (this)** |
|-----------|--------|----------|--------------|----------------------|
| Data source | IRS SOI | DOL OSHA | BLS OEWS | **BEA RPP + Census ACS + NREL + EIA** |
| Pre-existing depth | 119 URLs | 7 → 2,096 URLs | 535 URLs | **1,290 URLs (largest!)** |
| Phase target | +0 | +2,089 | +55 | **+54** |
| Differentiator focus | state commentary | inspection narratives | charts + glossary + COL | **charts + glossary + climate + affordability** |
| Middleware approach | AXIS B advisory | HARD 410 | already done | **BARE — full Phase A needed** |
| Veto #7 risk | low | mitigated | low | low |
| Veto #8 application | n/a | data/raw/ check key | data/raw/ EMPTY | **data/raw/ MISSING entirely** |
| Trap #73 (robots parity) | patched (taxded fix) | aligned | OK | **needs Phase A alignment** |
| Trap #16 risk | n/a | mitigated | low | mitigated by direct response (no rewrite) |
| Soft-404 sweep #88 | done | done | done | **already done (35d1dde + d4f145f)** |
| User-facing innovation | state commentary | inspection narrative | 3 visual + glossary + COL | **4 visual + glossary + climate + affordability** |

**costbycity is the most "data-rich" chunk** — base 1,290 URLs already deep, this is depth^2 on top. ALSO requires real Phase A work (unlike salarybycity).

---

## Decision request

User please answer Q1-Q5 above (or just say "all defaults" to accept recommendations).

Once answered, recommended sequence:
1. **Phase A first** (2-3h, REAL work this time, immediate verify)
2. **Phase B-1/B-2/B-3 in parallel agents** (saves 4-5h vs serial)
3. **Phase C** (LOCAL build verify before deploy)
4. **Phase D** + 7-day GSC observation

Or: defer entire chunk if user wants to focus on other sites first.

---

**End of directive.**
