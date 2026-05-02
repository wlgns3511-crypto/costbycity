# costbycity HCU 5-청크 patch directive **V2** (2026-05-02)

> **사전 사이트 정체성 강화** — Tier S Depth Expansion + COL Dictionary + 16-year RPP Trend + Climate-Adjusted Energy + Affordability + **Citation Network Graph + PCE Deflator + Real-Wage Equivalent**
> Following oshapeek/taxdeductionpeek/salarybycity pattern. Veto #7 CLEAR, Veto #8 ADOPTED, Trap #80 PRE-CHECKED.
> V1 → V2: +3 차별화 (사전 정체성 핵심 추가) + AXIS A/B/C 3축 명시 + Phase B 6 sub-phases + Phase C 9 components.

---

## §0 V1 → V2 변경 요약

### V1 4 차별화 (유지)
1. ⭐ COL Glossary 50종
2. ⭐ 16-yr RPP Trend (BEA SARPP/MARPP 2008-2024)
3. ⭐ Income-Adjusted Affordability Score
4. ⭐ Climate-Adjusted Energy Cost (NREL HDD/CDD × EIA)

### V2 신규 3 차별화 (사전 정체성 강화)
5. 🆕 ⭐ **Citation Network Graph** — 50 glossary entries 가 graph 구조 + 모든 metric mention 시 DefinedTerm JSON-LD + Wikipedia-style backlinks (`lib/crossref.ts` 자산 활용 — 이미 존재)
6. 🆕 ⭐ **PCE Deflator Real-vs-Nominal Toggle** — BEA NIPA Table 1.1.4 (PCE Price Index) → 모든 dollar figure 에 "2024 dollars / 2008 dollars" 토글. nominal RPP +52% 와 real RPP +35% 분리. 학술급 정밀도.
7. 🆕 ⭐ **City-Pair Real-Wage Equivalent** — "$80K in Detroit = $X in SF" 즉시 변환. top 200 pairs static SSG. 387×386 가능, 사용자 직접 가치.

### 3축 구조 명시 (taxded 패턴 도입)
- **AXIS A** (citations-backed indexable): `/glossary/`, `/cities/`, `/state/`, `/insights/`, `/guide/`, `/blog/`, 4 hub, 5 trend, 200 equivalent — primary-source citation 모두 inline
- **AXIS B** (synthetic surface noindex + advisory): `/search/`, `/rankings/`, `/compare/`, `/embed/` — middleware X-Robots-Tag noindex, SyntheticDataAdvisory 컴포넌트 inject
- **AXIS C** (TS data layer ≤200 rows, Trap #59): `lib/glossary-data.ts` (50 entries), `lib/climate-data.ts` (387 metros), `lib/electricity-rates.ts` (51 states × 5 yrs), `lib/pce-deflator.ts` (97 years monthly), `lib/citation-network.ts` (cross-reference matrix), `lib/equivalent-pairs.ts` (top 200 pairs)

### Trap pre-check
- **Trap #80** (multi-segment dynamicParams=false): `app/cities/[slug]/`, `app/state/[slug]/`, `app/glossary/[slug]/`, `app/trend/[metric]/`, `app/equivalent/[pair]/` 모두 single-segment → 안전. 단 `app/cities/[slug]/housing-breakdown/page.tsx` + `app/cities/[slug]/utility-bill/page.tsx` 는 nested static segment (no dynamic) → 안전.
- **Trap #34/#36** (Tailwind dynamic / RSC SDC hex split): 신규 9 컴포넌트 모두 `style={{ fill: '#XXX' }}` 패턴 사용 (no `bg-${color}` 동적 클래스).
- **Trap #16** (NoFallbackError): middleware 410 직접 NextResponse 반환 + `app/410/page.tsx` 안전망.
- **Trap #73** (robots.txt parity): `public/robots.txt` + `app/robots.ts` 동기화 필수.

---

## §1 Veto #7 / Veto #8 status

### Veto #7 (Synthetic-base ban) — STATUS: CLEAR
모든 신규 데이터 primary-source:
- BEA SARPP/MARPP 2008-2024 (16 years)
- BEA NIPA Table 1.1.4 PCE Price Index 1929-2024 (97 years monthly)
- US Census ACS 5-year (income/rent/home value)
- NREL TMY3 (HDD/CDD per metro)
- EIA Form 826 (residential electricity rate by state)
- Glossary citations: BEA Methodology PDF, HUD definitions, Census ACS Technical Documentation, IRS public terminology

**Composite metrics (derived from real data, NOT synthesized):**
- Real Affordability Score = `(median_income × 100) / (median_rent × 12 × RPP_factor)` — 모든 input real
- HVAC cost = `(HDD × heating_BTU + CDD × cooling_BTU) × elec_rate / efficiency` — DOE 표준 BTU/HDD 상수
- Real RPP = `nominal_RPP × (PCE_base_year / PCE_current_year)` — BEA 정의 그대로

### Veto #8 (data/raw/ check) — STATUS: APPLIED
- `data/raw/` 폴더 **부재** → 모든 외부 데이터 새로 받아야 (확인됨)
- `data/costliving.db` (9.9 MB) 5-yr RPP (2020-2024) + 387 metros + 939 ACS rows
- `data/costbycity.db`, `data/main.db` 0 bytes (사용 안 함)
- `scripts/fetch-data.py` 존재 (proven download path) — refactor 가능
- `data/crossref.json` + `lib/crossref.ts` **이미 존재** → Citation Network Graph 차별화 5 의 base layer 로 즉시 활용

---

## §2 Pre-flight gates (G1-G12, V1 → V2 +3)

| Gate | Check | Status | Action if FAIL |
|------|-------|--------|----------------|
| G1 | `git status` clean (or only intentional WIP) | check before Phase A | commit/stash WIP |
| G2 | `costliving.db` has 5 years RPP (9,675 rows) | ✅ verified | re-import if missing |
| G3 | BEA RPP 2008-2019 download successful | ❌ NOT YET | Phase B-1 task |
| G4 | NREL HDD/CDD CSV downloaded (387 metros) | ❌ NOT YET | Phase B-2 task |
| G5 | EIA residential electricity rate (51 states) | ❌ NOT YET | Phase B-2 task |
| G6 | Glossary content drafted (50 terms) | ❌ NOT YET | Phase B-3 task |
| G7 | Existing routes (/cities/, /state/) still 200 | ✅ verified | smoke-test before deploy |
| G8 | **Middleware bare passthrough — Phase A NEEDED** | ⚠️ CONFIRMED | Phase A is REAL work this time |
| G9 | Disk free on s? (DB will grow ~10MB → ~25MB) | check `df -h /` on s? | warn user if <20% free |
| G10 🆕 | BEA PCE Price Index 1929-2024 download | ❌ NOT YET | Phase B-4 task |
| G11 🆕 | Citation network graph derivation (`lib/crossref.ts` extension) | ⚠️ existing crossref.ts present | Phase B-5 verify shape |
| G12 🆕 | Top-200 city-pair equivalent pre-computation | ❌ NOT YET | Phase B-6 task |

---

## §3 Asset audit

### Current sitemap (1,290 URLs)
| Bucket | Count | Status |
|--------|-------|--------|
| `/cities/{slug}/` | 387 | ✅ ~3,960 words/page |
| `/cities/{slug}/housing-breakdown/` | 387 | ✅ sub-page |
| `/cities/{slug}/utility-bill/` | 387 | ✅ sub-page |
| `/state/{2-letter}/` | 51 | ✅ ~2,000 words |
| `/blog/{slug}/` | 49 | ✅ |
| `/rankings/{type}/` | 13 | ⚠️ MIXED (대부분 200, 일부 404) |
| `/insights/{topic}/` | 7 | ✅ |
| `/guide/{slug}/` | 6 | ✅ |
| `/compare/` (root only) | 1 | ⚠️ noindex'd |
| 정적 정책 페이지 | ~12 | ✅ |
| **Total** | **1,290** | sitemap-to-reality match: HIGH |

### Asset surplus (이미 존재, 활용)
- ✅ `lib/crossref.ts` + `data/crossref.json` — **차별화 5 (Citation Network Graph) base layer**
- ✅ `components/CiteButton.tsx` + `MethodologyInline.tsx` + `DataSourceBadge.tsx` — citation UI 자산
- ✅ `components/tools/AffordabilityCalc.tsx`, `RelocationCalculator.tsx`, `CostIndex.tsx`, `CostIndexChart.tsx` — 차별화 3/7 base
- ✅ `lib/cost-commentary.ts`, `lib/cost-facts.ts` — narrative engine
- ✅ `components/upgrades/` HCU upgrades (TableOfContents, AnswerHero, DecisionNext)
- ✅ `data/compare-featured.json` + `compare-whitelist.json` — top pair seeds for 차별화 7
- ✅ AdSense scaled-content remediation 완료 (commit 122c626)

### Critical gaps
1. ❌ Only 5 yrs RPP (2020-2024), BEA publishes 2008+ → 12 years missing
2. ❌ NO climate / energy data
3. ❌ NO PCE deflator (real-vs-nominal 정확도 없음)
4. ❌ NO glossary content
5. ❌ NO citation network graph (lib/crossref.ts 자산은 있지만 glossary-cross 미연결)
6. ❌ NO city-pair equivalent calculator
7. ⚠️ /es/ alive at 200 (taxded와 동일 문제)
8. ⚠️ Middleware BARE PASSTHROUGH

---

## §4 7 차별화 (4 V1 + 3 V2)

### ⭐ #1 — COL Glossary 50종 (USER REQUESTED, V1)
50 reference entries. 각 200-500 words + ≥1 primary-source citation.

**카테고리:**
- BEA / RPP (12): RPP 정의, all-items vs goods vs services, 지리 단위
- Census / ACS (10): MSA vs CSA vs CBSA, 5-yr vs 1-yr, FIPS, median income
- HUD / Housing (10): 30% burden, FMR, AMI, owner vs renter
- Energy / Climate (8): HDD/CDD, EIA rate, kWh, ENERGY STAR
- General COL (10): real vs nominal, COLA, Numbeo vs BEA

### ⭐ #2 — 16-yr RPP Trend (V1)
BEA SARPP+MARPP 2008-2024 → 9,675 → ~32,000 rows. 각 city/state 페이지에 server SVG line chart.

### ⭐ #3 — Income-Adjusted Affordability Score (V1)
RPP × ACS median income → 카운터-직관 ("Boise RPP 95 < SF 130 이지만 income gap 으로 실질 affordability 역전 가능"). 단일 composite + 3-component breakdown.

### ⭐ #4 — Climate-Adjusted Energy Cost (V1)
NREL HDD/CDD × EIA elec rate × DOE BTU/HDD → "Phoenix vs Minneapolis = $1,840/yr 차이". `/cities/{slug}/utility-bill/` 확장.

---

### 🆕 ⭐ #5 — Citation Network Graph (V2 신규, 사전 정체성 핵심)

**What:** 50 glossary entries 가 단순 list 가 아닌 graph 구조 + 모든 metric mention 시 DefinedTerm schema + Wikipedia-style backlinks.

**3-layer 구조:**

**Layer 5a — Cross-reference matrix (`lib/citation-network.ts`):**
```typescript
export interface GlossaryNode {
  slug: string;
  term: string;
  defines: string[];        // sub-concepts this term defines
  relatedTerms: string[];   // 5-10 lateral neighbors
  referencedIn: string[];   // metrics/pages using this term
  citations: { source: string; url: string; pdfPage?: number }[];
  category: 'BEA' | 'Census' | 'HUD' | 'Energy' | 'general';
}
export const CITATION_NETWORK: Record<string, GlossaryNode> = {...};
```

**Layer 5b — DefinedTerm JSON-LD site-wide:**
- 모든 페이지에서 RPP/ACS/HDD/CDD/MSA/FIPS/AMI 같은 핵심 용어 등장 시 `<dfn>` wrapping + `<script type="application/ld+json">{"@type":"DefinedTerm",...}</script>`
- `components/GlossaryTooltip.tsx` 가 inline tooltip + DefinedTerm schema 자동 inject
- regex-driven (서버 사이드, no client JS)

**Layer 5c — Wikipedia-style backlinks (`lib/crossref.ts` 확장):**
- `/glossary/regional-price-parity/` 페이지 하단에 "이 용어를 사용하는 페이지" 섹션
- 387 city + 51 state 페이지 + insights + guide + blog 모두 backlink
- 자동 derivation (build-time grep for term usage → backlink list)
- 기존 `data/crossref.json` 자산 + 새 glossary cross-ref → graph 완성

**Differentiator:**
- COL 사이트 99% 가 단순 FAQ
- 사전급 깊이 + DefinedTerm schema = Google "Definition" rich snippet 후보
- AdSense E-E-A-T 강화 (Wikipedia/Investopedia 레벨)

**Implementation:**
- Phase B-5 task (3-4 hours)
- 컴포넌트: `<GlossaryTooltip />` (inline) + `<GlossaryBacklinks />` (footer)
- DefinedTerm schema 모든 AXIS A 페이지

---

### 🆕 ⭐ #6 — PCE Deflator Real-vs-Nominal Toggle (V2 신규, 학술급 정밀도)

**What:** 모든 dollar figure 옆 "2024 dollars / 2008 dollars" toggle. nominal vs real 분리.

**Data:** BEA NIPA Table 1.1.4 (PCE Price Index Q + monthly, 1929+). Free API or CSV.

**Why differentiator:**
- COL 사이트 99% 가 nominal dollars 만 표시 → "Boise RPP +52% since 2008" 표시
- BUT national PCE deflator +28% 같은 기간 → real RPP +18% 만 (가격 대비 가치 증가는 절반 미만)
- 16-yr trend chart 가 nominal vs real 두 라인 모두 → "체감 cost 변화는 절반 정도였다" 학술 인사이트
- Numbeo/Bestplaces 절대 안 함

**Examples:**
- "Boise RPP 2008 nominal: 88.4 → 2024 nominal: 134.6 (+52%) BUT real (2024 dollars): 105.2 → 134.6 (+28%)"
- "$70K Boise income in 2008 = $98K in 2024 dollars (PCE-deflated)"
- "$1,500 Boise rent 2008 = $2,100 in 2024 dollars" (vs actual 2024 $2,400 = real +14%)

**Implementation:**
- Phase B-4 task (2-3 hours)
- `lib/pce-deflator.ts` (TS module, monthly 1929-2024 = ~1,150 rows, Trap #59 OK)
- `lib/real-value.ts` 헬퍼: `toRealDollars(nominal, fromYear, toYear)` → BEA-grade conversion
- 컴포넌트: `<PCEDeflatorToggle />` client component (`useState` toggle, 단순 swap)
- Wire-in: 16-yr trend chart, /cities/{slug}/ 모든 dollar figure, /trend/ 페이지

**Cost:** ~150 KB lib data + 1 client component. 페이지 크기 영향 미미.

---

### 🆕 ⭐ #7 — City-Pair Real-Wage Equivalent (V2 신규, 실용 utility)

**What:** "Earn $80K in Detroit = $X equivalent in San Francisco" 즉시 변환.

**Data:** 기존 RPP + ACS — no new fetch. Pure derivation.

**Formula (BEA-grade):**
```
equivalent_in_destination = source_income × (RPP_destination / RPP_source)
purchasing_power_delta = (RPP_source / RPP_destination) - 1
```

**Implementation:**
- 387 × 386 = 149,182 pairs theoretical max
- **Top 200 pairs** static SSG (selection: most-searched + adjacent metros + cross-region popular):
  - source: `data/compare-featured.json` (이미 존재)
  - + GSC top-search city pairs (28d window)
  - + 50 cross-region pairs (NYC↔LA, Chicago↔Houston, etc.)
- URL: `/equivalent/{from-slug}-vs-{to-slug}/` × 200
- Inline calculator widget on 387 `/cities/{slug}/` (any-target lookup)

**Components:**
- `<RealWageEquivalent />` server SVG bidirectional gauge
- Reuse existing `RelocationCalculator.tsx` (이미 존재) — wrap with new BEA RPP precision

**Story angles:**
- "Your $80K Detroit salary = $124K SF equivalent (need $124K to match purchasing power)"
- "Reverse: $80K SF salary = $51K equivalent in Detroit"
- 16-yr trend cross-link: "This gap was $X 10 years ago"

**Cost:** Pre-compute 200 pairs at build time (~5s). No runtime cost.

---

### Deferred candidates (not in this V2 chunk)
- #8: Transit / Commute Cost (BLS CES + Census ACS B08303) — Phase E
- #9: Crime Index (FBI UCR) — Phase E (YMYL care)
- #10: School Quality (NCES NAEP) — REJECTED (license + YMYL)
- #11: Revive curated /compare/ (top 100 pairs) — Phase F (6mo buffer needed)
- 🆕 #12: RPP × Income Quintile Heatmap (387 metros × 5 quintiles) — V3
- 🆕 #13: Migration Story Narratives (16-yr RPP divergence stories: "Boise gentrification 2014-2020 +18%") — V3
- 🆕 #14: State Law Surcharge Layer (CA/OR/WA tax cross-link with propertytaxpeek) — V3
- 🆕 #15: Climate Scenario Stress Test (NREL future HDD/CDD projection) — V3 (data fetch new)

---

## §5 Phase A/B/C/D execution plan

### Phase A — Real middleware (2-3 hours, REAL work)

V1 동일 + 3-AXIS 명시화:
1. `middleware.ts` full rewrite:
   ```typescript
   const ES_KILL_RE = /^\/es(\/.*)?$/;
   const HTTPS_KILL_RE = /^\/https?:/;
   const SYNTHETIC_QUARANTINE_RE = /^\/(search|category|rankings|compare|embed)(\/|$)/;
   const EDGE_VERSION = '2026-05-02-tier-s-v2';
   ```
2. /es/ → HARD 410 + `app/es/` 폴더 삭제 (3 파일)
3. AXIS B paths → X-Robots-Tag: noindex, nofollow + `<SyntheticDataAdvisory />` inject
4. /https?:/ → 410
5. Edge version header on all responses
6. `app/robots.ts` + `public/robots.txt` parity (Trap #73)
7. `app/410/page.tsx` (Trap #16 belt-and-suspenders)

**Commit:** `HCU 5-청크 Phase A costbycity: middleware 3-AXIS quarantine + /es/ kill + robots parity`

### Phase B — Data layer (5 sub-phases, parallelizable)

#### B-1 — BEA RPP 2008-2019 backfill (2-3 hours)
- `scripts/download-bea-rpp.ts`: SARPP + MARPP CSV
- `rpp` table: 9,675 → ~32,000 rows
- Boundary changes 2013/2018/2023 — strict per-FIPS + "boundary changed YYYY" disclaimer

#### B-2 — Climate + Energy (2-3 hours)
- `scripts/download-nrel-climate.ts` (HDD/CDD)
- `scripts/download-eia-electricity.ts` (state rate)
- `lib/climate-data.ts`, `lib/electricity-rates.ts` (Trap #59 TS modules)
- New tables: `climate`, `electricity_rates`

#### B-3 — Glossary 50 entries (2-3 hours)
- `lib/glossary-data.ts` (Trap #59 TS module)
- 50 entries × 200-500 words × ≥1 primary-source citation
- 5 카테고리 균형 (BEA 12 / Census 10 / HUD 10 / Energy 8 / General 10)

#### 🆕 B-4 — PCE Deflator (2-3 hours, V2 신규)
- `scripts/download-bea-pce.ts`: NIPA Table 1.1.4 (Price Index, monthly 1929-2024)
- `lib/pce-deflator.ts` (~1,150 rows, Trap #59 OK)
- `lib/real-value.ts`: `toRealDollars(nominal, fromYear, toYear)` 헬퍼
- New table: `pce_deflator (year INTEGER, month INTEGER, index_value REAL, PRIMARY KEY(year,month))`

#### 🆕 B-5 — Citation Network Graph (3-4 hours, V2 신규, 사전 정체성 핵심)
- `lib/citation-network.ts`: 50 glossary nodes × 5-10 cross-references = ~400 edges
- Build-time backlink derivation: `scripts/build-crossref.ts`
  - grep for glossary term usage in app/, components/, lib/
  - emit `data/crossref-backlinks.json` (term → [page paths])
- Wire `lib/crossref.ts` (existing) 확장
- Phase C-1 GlossaryTooltip + GlossaryBacklinks 컴포넌트 prep

#### 🆕 B-6 — City-Pair Equivalent Pre-computation (1-2 hours, V2 신규)
- `scripts/build-equivalent-pairs.ts`:
  - source: `data/compare-featured.json` (이미 존재) + GSC 28d top pairs (mcp__jihoon-data__get_gsc_report)
  - + 50 cross-region popular pairs
  - = top 200 pairs
- `lib/equivalent-pairs.ts` (TS module, top 200 × forward + backward = 400 rows, Trap #59 OK)
- Pre-compute: source income → destination equivalent (BEA RPP-adjusted)

**Phase B 6-task parallelization:** B-1, B-2, B-3, B-4 independent (parallel agents), B-5 waits on B-3 (glossary needs to exist), B-6 waits on B-1 (16-yr RPP needed).

**Bundle commit (메타-원칙 #2):** `HCU 5-청크 Phase B costbycity: BEA 16yr + climate + glossary 50 + PCE deflator + citation network + equivalent 200`

### Phase C — UX components + new routes (6-9 hours, V2 +3 components +5 routes)

#### C-1 Components (9개, server SVG default)

| Component | LOC | Phase | Used by |
|-----------|-----|-------|---------|
| `RppTrendChart.tsx` | ~120 | V1 | /cities/, /state/, /trend/ |
| `AffordabilityScoreCard.tsx` | ~80 | V1 | /cities/ |
| `ClimateEnergyCost.tsx` | ~70 | V1 | /cities/{slug}/utility-bill/ |
| `RelocationDeltaCard.tsx` | ~60 | V1 | /tools/ |
| `GlossaryTermCard.tsx` | ~40 | V1 | /glossary/ |
| `GlossaryEntryBody.tsx` | ~80 | V1 | /glossary/{slug}/ |
| 🆕 `GlossaryTooltip.tsx` | ~50 | V2 | site-wide inline (DefinedTerm schema) |
| 🆕 `PCEDeflatorToggle.tsx` | ~70 | V2 | /cities/, /state/, /trend/ (`'use client'`) |
| 🆕 `RealWageEquivalent.tsx` | ~90 | V2 | /equivalent/{pair}/, /cities/ inline |

**Trap #34/#36 safety:** 모든 chart fill `style={{ fill: '#XXX' }}`, no `bg-${color}` 동적.

#### C-2 New routes

| Route | Source | Cardinality | AXIS |
|-------|--------|-------------|------|
| `/glossary/` | GLOSSARY index | 1 | A |
| `/glossary/{slug}/` | GLOSSARY entries | 50 | A |
| `/tools/` | tools index | 1 | A |
| `/tools/affordability-calculator/` | static + form | 1 | A |
| `/tools/relocation-cost/` | static + form | 1 | A |
| 🆕 `/trend/` | trend hub | 1 | A |
| 🆕 `/trend/{metric}/` | RPP / income / rent / home value × 16yr | 5-8 | A |
| 🆕 `/equivalent/` | equivalent index | 1 | A |
| 🆕 `/equivalent/{from}-vs-{to}/` | top 200 city pairs | 200 | A |
| 🆕 `/sources/` | federal source roster + author credentials | 1 | A |

**Total new routes:** V1 +5 → V2 +266 (대부분 200 equivalent pairs)

#### C-3 Wire into existing hubs

- **/cities/{slug}/**: insert `<RppTrendChart />` (16-yr w/ PCE toggle), `<AffordabilityScoreCard />`, `<RealWageEquivalent />` inline calc, `<GlossaryTooltip />` inline RPP/ACS terms, citation footnotes, link to /tools/
- **/cities/{slug}/utility-bill/**: insert `<ClimateEnergyCost />`
- **/state/{slug}/**: insert `<RppTrendChart />` (state aggregate w/ PCE toggle), state glossary backlinks, `<GlossaryTooltip />` inline
- **/insights/{topic}/**: cross-link to /glossary/ entries (`<GlossaryBacklinks />`)
- **/blog/, /guide/**: GlossaryTooltip inline for technical terms

**Bundle commit (메타-원칙 #2):** `HCU 5-청크 Phase C costbycity: 9 components + 11 route groups + AXIS A inline citations + DefinedTerm schema`

### Phase D — Sitemap + verify (1-2 hours)

1. `scripts/build-sitemap.ts` extension:
   - +/glossary/ (1) + /glossary/{slug}/ (50)
   - +/tools/ (1) + /tools/affordability-calculator/ (1) + /tools/relocation-cost/ (1)
   - +/trend/ (1) + /trend/{metric}/ (5-8)
   - +/equivalent/ (1) + /equivalent/{pair}/ (200)
   - +/sources/ (1)
   - Total sitemap: 1,290 → **~1,560 URLs**
2. `scripts/verify-deploy-20260502-v2.sh`:
   - 5 random /cities/ + 5 /utility-bill/ + 5 /state/ (depth verify)
   - 10 random /glossary/{slug}/ (200+ words + ≥1 citation + ≥3 backlinks)
   - 5 /trend/{metric}/ (RPP+PCE toggle markup)
   - 10 random /equivalent/{pair}/ (200+ words + RealWageEquivalent component)
   - /sources/ (federal source roster)
   - 5 AXIS B paths (X-Robots-Tag: noindex)
   - Total: ~50 checks
3. IndexNow push: ~270 new URLs to bing.com
4. Cardinality guard: `if (urls.length > 5000 && !SITEMAP_LARGE_OK) throw`

**Commit:** `HCU 5-청크 Phase D costbycity: sitemap +270, verify v2, IndexNow push 270 URLs`

---

## §6 Files manifest (V2)

### New files (V1 + V2)
```
data/raw/bea-rpp/SARPP-2008-2024.zip                ~3 MB (B-1)
data/raw/bea-rpp/MARPP-2008-2024.zip                ~5 MB (B-1)
data/raw/bea-pce/PCEPI-1929-2024.csv                ~1 MB (B-4) 🆕
data/raw/nrel-tmy3/station_hdd_cdd.csv              ~500 KB (B-2)
data/raw/eia/state_residential_rate.csv             ~50 KB (B-2)
data/crossref-backlinks.json                        ~200 KB (B-5) 🆕

scripts/download-bea-rpp.ts                         (B-1)
scripts/download-bea-pce.ts                         (B-4) 🆕
scripts/download-nrel-climate.ts                    (B-2)
scripts/download-eia-electricity.ts                 (B-2)
scripts/build-crossref.ts                           (B-5) 🆕
scripts/build-equivalent-pairs.ts                   (B-6) 🆕
scripts/verify-deploy-20260502-v2.sh                (D)

lib/climate-data.ts                                 (B-2)
lib/electricity-rates.ts                            (B-2)
lib/glossary-data.ts                                (B-3, 50 entries)
lib/affordability-score.ts                          (C-1)
lib/rpp-trend.ts                                    (C-1)
lib/pce-deflator.ts                                 (B-4) 🆕
lib/real-value.ts                                   (B-4) 🆕
lib/citation-network.ts                             (B-5) 🆕
lib/equivalent-pairs.ts                             (B-6) 🆕

components/RppTrendChart.tsx                        (C-1)
components/AffordabilityScoreCard.tsx               (C-1)
components/ClimateEnergyCost.tsx                    (C-1)
components/RelocationDeltaCard.tsx                  (C-1)
components/GlossaryTermCard.tsx                     (C-1)
components/GlossaryEntryBody.tsx                    (C-1)
components/GlossaryTooltip.tsx                      (C-1) 🆕
components/PCEDeflatorToggle.tsx                    (C-1) 🆕 'use client'
components/RealWageEquivalent.tsx                   (C-1) 🆕
components/SyntheticDataAdvisory.tsx                (A, AXIS B inject)

app/410/page.tsx                                    (A)
app/glossary/page.tsx                               (C-2)
app/glossary/[slug]/page.tsx                        (C-2)
app/tools/page.tsx                                  (C-2)
app/tools/affordability-calculator/page.tsx         (C-2)
app/tools/relocation-cost/page.tsx                  (C-2)
app/trend/page.tsx                                  (C-2) 🆕
app/trend/[metric]/page.tsx                         (C-2) 🆕
app/equivalent/page.tsx                             (C-2) 🆕
app/equivalent/[pair]/page.tsx                      (C-2) 🆕
app/sources/page.tsx                                (C-2) 🆕

docs/CHUNK5-PATCH-DIRECTIVE-V2-20260502.md          (this file)
```

### Modified files
```
middleware.ts                          FULL REWRITE (A)
app/robots.ts                          AXIS B + /es/ disallow (A)
public/robots.txt                      parity with app/robots.ts (A)
scripts/fetch-data.py                  refactor multi-year (B-1)
scripts/build-sitemap.ts               +270 URLs (D)
lib/db.ts                              add getRppTrend, getAffordabilityScore, getCityPairEquivalent, getPCEDeflator (C)
lib/crossref.ts                        extend with glossary cross-ref (B-5) 🆕
lib/cost-commentary.ts                 add real-vs-nominal narratives (C)
app/cities/[slug]/page.tsx             wire 4 new components + GlossaryTooltip + citations (C)
app/cities/[slug]/utility-bill/page.tsx wire ClimateEnergyCost (C)
app/state/[slug]/page.tsx              wire RppTrendChart + PCE toggle + GlossaryTooltip (C)
app/methodology/page.tsx               add 5 federal source roster (C) 🆕
app/about/page.tsx                     add author credentials + sourcing policy (C) 🆕
app/page.tsx (home)                    add Glossary + Tools + Trend + Sources nav (C)
app/layout.tsx                         add new top-nav links (C)
public/IndexNow.txt                    rotate key if needed (D)
```

### Deleted files
```
app/es/layout.tsx                      (A)
app/es/page.tsx                        (A)
app/es/cities/[slug]/page.tsx          (A)
```

### DB schema changes
```sql
-- B-1: extend rpp (no schema change, more rows)

-- B-2: NEW tables
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

-- B-4: PCE deflator (TS module preferred per Trap #59 — DB optional)
-- ~1,150 monthly rows (97 years × 12), well under 200-row Trap #59 threshold
-- → store as TS module (lib/pce-deflator.ts), NO DB table
```

---

## §7 Rollout sequence (V2)

```
Phase A (2-3h)        REAL middleware build → deploy → smoke
       ↓ 24h Cloudflare cache observation
Phase B-1 (2-3h)      BEA RPP 2008-2019 backfill
Phase B-2 (2-3h)      NREL + EIA TS modules        ← 4 parallelizable
Phase B-3 (2-3h)      Glossary 50 entries
Phase B-4 (2-3h) 🆕    BEA PCE deflator 1929-2024
       ↓
Phase B-5 (3-4h) 🆕    Citation network graph (waits B-3)
Phase B-6 (1-2h) 🆕    City-pair equivalent pre-compute (waits B-1)
       ↓ all data layer committed
Phase C (6-9h)        9 components + 11 route groups + wire-ups
       ↓ deploy → 50-check verify
Phase D (1-2h)        sitemap +270, verify, IndexNow
       ↓ 7-day GSC observation
```

**Total V2 estimate:** 21-31 hours (2.5-3.5 dev days). +7-10h vs V1 (3 신규 차별화).

**Parallelization path:** B-1/2/3/4 동시 (4 agents) → 8h → 2-3h. Total wall time 13-19h with parallelization.

---

## §8 Verification checklist (V2)

### Phase A verify
- [ ] `curl -sI https://costbycity.com/` → `x-edge-version: 2026-05-02-tier-s-v2`
- [ ] `curl -sI https://costbycity.com/es/` → 410
- [ ] `curl -sI https://costbycity.com/search/` → 200 + X-Robots-Tag: noindex
- [ ] `curl -sI https://costbycity.com/rankings/` → 200 + X-Robots-Tag: noindex (AXIS B)
- [ ] `curl -sI https://costbycity.com/compare/` → 200 + X-Robots-Tag: noindex (AXIS B)
- [ ] `public/robots.txt` ≡ `app/robots.ts` Disallow (Trap #73)

### Phase B verify (local pre-deploy)
- [ ] `sqlite3 data/costliving.db "SELECT year, COUNT(*) FROM rpp GROUP BY year"` → 2008-2024 ~1,900/yr
- [ ] `sqlite3 data/costliving.db "SELECT COUNT(*) FROM climate"` → ~387
- [ ] `sqlite3 data/costliving.db "SELECT COUNT(*) FROM electricity_rates"` → ~250
- [ ] `bun -e "import('./lib/glossary-data').then(m => console.log(m.GLOSSARY.length))"` → 50
- [ ] `bun -e "import('./lib/pce-deflator').then(m => console.log(m.PCE_DEFLATOR.length))"` → ~1,150 🆕
- [ ] `bun -e "import('./lib/citation-network').then(m => console.log(Object.keys(m.CITATION_NETWORK).length))"` → 50 🆕
- [ ] `bun -e "import('./lib/equivalent-pairs').then(m => console.log(m.EQUIVALENT_PAIRS.length))"` → 200 🆕
- [ ] Each glossary entry has ≥1 citation + ≥3 related_terms

### Phase C verify (local pre-deploy)
- [ ] `bun run build` succeeds (no Trap #16 / NoFallbackError)
- [ ] `bunx tsc --noEmit` clean
- [ ] `bunx eslint .` clean
- [ ] Sample `/cities/abilene-tx/` HTML includes:
  - `<svg class="rpp-trend">`, `<svg class="affordability-score">`, `<svg class="real-wage-equivalent">`
  - `<dfn data-glossary-slug="...">` (Trap #36-safe inline DefinedTerm)
  - `<script type="application/ld+json">` with `"@type":"DefinedTerm"`
- [ ] `/cities/abilene-tx/utility-bill/` includes `<svg class="climate-energy">`
- [ ] `/glossary/regional-price-parity/` returns 200 + ≥200 words + ≥1 citation link + ≥3 backlinks
- [ ] `/trend/rpp/` returns 200 + PCE toggle component
- [ ] `/equivalent/detroit-mi-vs-san-francisco-ca/` returns 200 + RealWageEquivalent

### Phase D verify (production)
- [ ] sitemap.xml contains 1,560±10 URLs
- [ ] 5 /cities/, 5 /utility-bill/, 5 /state/, 10 /glossary/, 5 /trend/, 10 /equivalent/ → all 200
- [ ] /sources/ → 200 + 5 federal sources cited (BEA + Census + NREL + EIA + HUD)
- [ ] 5 AXIS B paths → X-Robots-Tag: noindex, nofollow
- [ ] IndexNow accepted ≥260/270 URLs

---

## §9 Open questions for user (Q1-Q9)

### V1 questions (5)

**Q1 Glossary scope** — 50 vs 100? **Recommend: 50** (Phase B-3 lean) → +50 as V3 if traffic positive.

**Q2 Affordability score** — composite vs multi-dim? **Recommend: composite headline + 3-component breakdown.**

**Q3 BEA boundary changes (2013/2018/2023)** — strict per-FIPS vs metro name rebrand? **Recommend: strict per-FIPS + "boundary changed YYYY" disclaimer.**

**Q4 Climate cost** — absolute $/yr vs delta vs national? **Recommend: both** (absolute headline + delta side-note).

**Q5 Phase E (Transit + Crime)** — same chunk vs separate? **Recommend: separate** — Phase E later (crime YMYL care).

### V2 questions (4 신규)

**Q6 Citation network scope** — 50 glossary terms entire-site DefinedTerm schema, OR /glossary/ 페이지만? **Recommend: entire-site** — DefinedTerm schema cost 미미 (regex inline) + Wikipedia-style depth = 사전 정체성 핵심.

**Q7 PCE deflator toggle UX** — client-side toggle (`'use client'`) vs build-time URL variant (`?dollars=2024`)?
- **client-side toggle** (recommend): single URL, useState swap, no SSG explosion
- build-time variant: 2× URLs (1,560 → 3,120), GSC noise risk
- **Recommend: client-side** + default 2024 dollars, toggle subtle.

**Q8 City-pair equivalent — top 200 selection criteria:**
- A) GSC top 200 search pairs (data-driven)
- B) Population-pairs (top 200 most-populous metro × 199 others within radius)
- C) `data/compare-featured.json` (curated) + GSC top + cross-region popular = mixed
- **Recommend: C (mixed)** — best diversity + SEO + UX.

**Q9 schema.org markup scope:**
- 5 hub + 387 cities + 51 states + 50 glossary 모두 schema? OR 부분만?
- **Recommend: 모두** — Article+Person+DefinedTerm+Place 4 schema types per page (no cost, E-E-A-T 강화 + Google rich snippets 후보).

---

## §10 vs taxded / oshapeek / salarybycity / costbycity-V1 (V2 비교)

| Dimension | taxded | oshapeek | salarybycity | costbycity V1 | **costbycity V2** |
|-----------|--------|----------|--------------|---------------|-------------------|
| Data source | IRS SOI | DOL OSHA | BLS OEWS | BEA + ACS + NREL + EIA | **+BEA PCE + crossref graph** |
| Pre-existing depth | 119 | 7→2,096 | 535 | 1,290 | **1,290 → 1,560** |
| Phase target | +0 | +2,089 | +55 | +54 | **+270** |
| Differentiator count | 1 (state) | 4 (hub+cardinality+inspection+calc) | 4 (charts+glossary+COL) | 4 | **7** |
| 사전 정체성 | medium (citations) | low (raw data) | medium (glossary) | medium | **HIGH (citation network + DefinedTerm site-wide + backlinks)** |
| Middleware approach | AXIS B advisory | HARD 410 | already done | BARE | **BARE → 3-AXIS full** |
| Wall-clock | 1 day | 1 day | 1 day | 1.5-2.5 days | **2.5-3.5 days (or 13-19h parallel)** |
| Veto #7 | clear | mitigated | clear | clear | **clear** |
| Veto #8 | n/a | applied | n/a | applied | **applied** |
| Trap #80 risk | hit (fixed) | hit (fixed 2nd) | n/a | low | **low (single-segment routes only)** |
| User-facing innovation | state commentary | inspection narrative | charts+glossary | 4 visual+glossary+climate+afford | **+citation graph + PCE deflator + real-wage eq** |

**costbycity V2 = portfolio 에서 가장 academic-grade chunk.** 사전 사이트로서 Wikipedia/Investopedia 레벨 정밀도.

---

## Decision request

User please answer **Q1-Q9** (or "all defaults" to accept recommendations).

Once answered:
1. **Phase A** (2-3h, REAL work, immediate verify)
2. **Phase B-1/B-2/B-3/B-4** parallel agents (saves ~6h)
3. **Phase B-5/B-6** sequential (depends on B-3/B-1)
4. **Phase C** local build verify before deploy
5. **Phase D** sitemap +270 + IndexNow + 7-day GSC observation

Or: defer entire chunk if user wants to focus on other sites first.

---

**End of V2 directive.**
