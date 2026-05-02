# costbycity HCU 5-청크 patch directive **V3** (2026-05-02)

> **Tier S Depth Expansion + academic-grade COL precision** — BEA RPP 16-yr + PCE deflator + climate-adjusted energy + city-pair real-wage equivalent + supplementary glossary
> Veto #7 CLEAR, Veto #8 APPLIED, Trap #80 PRE-CHECKED

---

## §0 V1 → V2 → V3 evolution

### V2 두 가지 자기교정 (V3 의 출발점)

**오류 1 — "사전 사이트" 프레이밍 hallucination**
사용자가 "여기도 사전이니깐" 이라고 echo 했는데, 그건 oshapeek/taxded 리뷰 때 내가 만든 "reference-grade depth" 프레이밍의 echo 였다. costbycity = COL data comparison 사이트 (BEA RPP-backed) 이지 사전 사이트가 아니다. V3 은 프레이밍 정정.

**오류 2 — `lib/crossref.ts` 자산 hallucination**
V2 가 "lib/crossref.ts + data/crossref.json 이미 존재 → Citation Network Graph base layer 즉시 활용" 이라고 주장. 실제 확인:
```typescript
// lib/crossref.ts (12 라인 전체)
export function getCrossSiteLinks(currentDomain: string, limit = 5) {
  return [{ name: 'DataPeek Facts', url: 'https://datapeekfacts.com/', domain: 'datapeekfacts.com' }];
}
```
Cross-SITE link (sibling 사이트 hub) 일 뿐. `data/crossref.json` 도 387 metros × COL fields (compare 추천용). Glossary network base 아니다. **차별화 #5 는 greenfield 작업.**

### V3 변경 요약

| 영역 | V2 | V3 |
|------|----|----|
| 프레이밍 | "사전 사이트 정체성 강화" | **Tier S Depth Expansion + academic-grade COL precision** |
| 헤드라인 차별화 | Glossary #1 (사전 직역 산물) | **#6 PCE Deflator / #7 City-Pair Equivalent / #2 16-yr RPP / #4 Climate Energy** |
| Supporting 차별화 | — | #3 Affordability / #1 Glossary 50 (supplementary) |
| Citation Network (#5) | site-wide DefinedTerm | **/glossary/{slug}/ 한정** (regex false-positive + maintenance 부담 회피) |
| /equivalent/{pair}/ × 200 | thin-content 위험 미언급 | **≥400 unique words committment** (16-yr trend cross-link narrative + breakdown + reverse direction) |
| Phase C wall-clock | 6-9h | **9-12h** (50 glossary entry handwritten ≥6h alone) |
| Total wall-clock | 21-31h (parallel 13-19h) | **24-34h (parallel 16-22h)** |
| Q6 schema scope | entire-site DefinedTerm | **/glossary/ 한정** |
| Q9 schema scope | 일괄 4종 per page | **페이지 타입별 차등 (Place/Article/Person/DefinedTerm/Dataset 분리)** |
| crossref.ts 자산 주장 | 자산 활용 base layer | **greenfield 명시** |

---

## §1 Veto #7 / Veto #8 status (보강)

### Veto #7 (Synthetic-base ban) — STATUS: CLEAR

모든 신규 데이터 primary-source:
- BEA SARPP/MARPP 2008-2024 (16 years)
- BEA NIPA Table 1.1.4 PCE Price Index 1929-2024 (97 years monthly)
- US Census ACS 5-year (income/rent/home value)
- NREL TMY3 (HDD/CDD per metro)
- EIA Form 826 (residential electricity rate by state)
- Glossary citations: BEA Methodology PDF, HUD definitions, Census ACS Technical Documentation, IRS public terminology

**Composite metrics — derived from real data, NOT synthesized:**

> **명시적 Veto #7 분류 (V3 추가):** 아래 모든 derivation 은 primary-source RPP/income/rate/HDD/CDD 위에 BEA-defined 또는 DOE 표준 공식 적용. Synthetic value 생성 0.

| Metric | Formula | Status |
|--------|---------|--------|
| Real Affordability Score | `(median_income × 100) / (median_rent × 12 × RPP_factor)` | ✅ derived |
| HVAC cost | `(HDD × heating_BTU + CDD × cooling_BTU) × elec_rate / efficiency` | ✅ derived (DOE BTU/HDD 표준) |
| Real RPP (PCE-deflated) | `nominal_RPP × (PCE_base / PCE_current)` | ✅ derived (BEA 정의) |
| **City-pair equivalent (V3 명시)** | `equivalent = source_income × (RPP_dest / RPP_source)` | ✅ derived (BEA RPP) |

### Veto #8 (data/raw/ check) — STATUS: APPLIED
- `data/raw/` 폴더 **부재** (확인됨) → 모든 외부 데이터 새로 받아야
- `data/costliving.db` (9.9 MB) 5-yr RPP (2020-2024) + 387 metros + 939 ACS rows
- `data/costbycity.db`, `data/main.db` 0 bytes
- `scripts/fetch-data.py` 존재 (proven path) — refactor 가능
- `lib/crossref.ts` (12-line sibling-link 함수) + `data/crossref.json` (387 metros × cost_index 5-field) — **citation network 자산 아님**, comparison 위젯용

---

## §2 Pre-flight gates (G1-G12)

| Gate | Check | Status | Action if FAIL |
|------|-------|--------|----------------|
| G1 | `git status` clean | check before A | commit/stash |
| G2 | `costliving.db` 5-yr RPP (9,675 rows) | ✅ verified | re-import |
| G3 | BEA RPP 2008-2019 download | ❌ NOT YET | Phase B-1 |
| G4 | NREL HDD/CDD CSV | ❌ NOT YET | Phase B-2 |
| G5 | EIA residential rate (51 states) | ❌ NOT YET | Phase B-2 |
| G6 | Glossary content drafted (50 terms) | ❌ NOT YET | Phase B-3 |
| G7 | Existing /cities/, /state/ still 200 | ✅ verified | smoke-test |
| G8 | **Middleware bare passthrough** | ⚠️ CONFIRMED | Phase A REAL work |
| G9 | Disk free | check `df -h /` | warn user if <20% |
| G10 | BEA PCE Price Index download | ❌ NOT YET | Phase B-4 |
| G11 | **Citation network = greenfield, /glossary/ only** | ⚠️ V3 정정 | Phase B-5 build from scratch |
| G12 | Top-200 city-pair equivalent | ❌ NOT YET | Phase B-6 |

---

## §3 Asset audit (V3 정정)

### Current sitemap (1,290 URLs) — 변경 없음
| Bucket | Count |
|--------|-------|
| `/cities/{slug}/` | 387 |
| `/cities/{slug}/housing-breakdown/` | 387 |
| `/cities/{slug}/utility-bill/` | 387 |
| `/state/{2-letter}/` | 51 |
| `/blog/{slug}/` | 49 |
| `/rankings/{type}/` | 13 |
| `/insights/{topic}/` | 7 |
| `/guide/{slug}/` | 6 |
| `/compare/` (root only) | 1 |
| 정적 정책 | ~12 |
| **Total** | **1,290** |

### Asset surplus (실제 활용 가능) — V3 정정

| Asset | 실제 내용 | 활용 |
|-------|----------|------|
| `components/CiteButton.tsx`, `MethodologyInline.tsx`, `DataSourceBadge.tsx` | citation UI 자산 | ✅ /glossary/, /sources/ wire |
| `components/tools/AffordabilityCalc.tsx` | 기존 affordability calc | ✅ 차별화 #3 base |
| `components/RelocationCalculator.tsx` | 기존 relocation calc | ✅ 차별화 #7 (Real-Wage Equivalent) wrap |
| `components/CostIndex.tsx`, `CostIndexChart.tsx` | 기존 cost index 컴포넌트 | ✅ extend for 16-yr |
| `lib/cost-commentary.ts`, `lib/cost-facts.ts` | narrative engine | ✅ 모든 신규 페이지 |
| `components/upgrades/` | HCU upgrades (TableOfContents, AnswerHero, DecisionNext) | ✅ /glossary/, /equivalent/ apply |
| `data/compare-featured.json` + `compare-whitelist.json` | curated pair seeds | ✅ 차별화 #7 top-200 source |
| AdSense scaled-content remediation (commit 122c626) | 완료 | ✅ noindex 제거 가능 |

**❌ 잘못 주장했던 자산 (V2 hallucination 정정):**
- `lib/crossref.ts` — 실제 12-line sibling-site hub 링크 함수. **Glossary cross-reference 자산 아님.**
- `data/crossref.json` — 387 metros × cost_index/income/rent/home_value 5-field. **Citation network base 아님.**

→ **차별화 #5 (Citation Network) 는 100% greenfield.** /glossary/ 한정 scope (V3 trim).

### Critical gaps (V3 정정 1 항목)
1. ❌ Only 5 yrs RPP (2020-2024) — 12 years missing
2. ❌ NO climate / energy data
3. ❌ NO PCE deflator
4. ❌ NO glossary content
5. ❌ NO citation network — V2 가 자산 활용 주장했으나 **greenfield 작업** (V3 정정)
6. ❌ NO city-pair equivalent
7. ⚠️ /es/ alive at 200
8. ⚠️ Middleware BARE PASSTHROUGH

---

## §4 7 차별화 (V3 우선순위 재정렬)

### 헤드라인 4 (Phase C 핵심)

#### ⭐ #6 PCE Deflator Real-vs-Nominal Toggle — 학술급 정확도

**Why 헤드라인:** Numbeo/Bestplaces/대부분 COL 사이트가 nominal dollars 만 표시. PCE-deflated real value 분리는 academic-grade 정밀도.

**Data:** BEA NIPA Table 1.1.4 (PCE Price Index Q + monthly, 1929+). Free CSV.

**Examples:**
- "Boise RPP 2008 nominal: 88.4 → 2024 nominal: 134.6 (+52%) BUT real (2024 dollars): 105.2 → 134.6 (+28%)"
- "$70K Boise income in 2008 = $98K in 2024 dollars (PCE-deflated)"
- "$1,500 Boise rent 2008 = $2,100 in 2024 dollars" (vs actual $2,400 = real +14%)

**Implementation:** Phase B-4 (~2-3h). `lib/pce-deflator.ts` (~1,150 monthly rows, Trap #59 OK). `<PCEDeflatorToggle />` client component (`useState` swap, default 2024 dollars).

#### ⭐ #7 City-Pair Real-Wage Equivalent — 즉각 사용자 utility

**Why 헤드라인:** "$80K Detroit = $X SF" 즉각 변환. 사용자 직접 가치 + RPP normalization 정확.

**Data:** 기존 RPP (Phase B-1 완료 후 16-yr) + ACS — pure derivation.

**Formula (Veto #7 명시):**
```
equivalent_in_destination = source_income × (RPP_destination / RPP_source)
purchasing_power_delta_pct = (RPP_source / RPP_destination - 1) × 100
```

**V3 ≥400 unique words committment per pair page:**
- 양방향 변환 ($80K source → destination + reverse)
- 16-yr RPP trend cross-link narrative ("이 격차는 10년 전 X 였다")
- Housing/groceries/utility 별 breakdown (RPP all-items vs RPP housing 별로 다른 결과)
- "Boise→SF 이동 시 +$X salary 필요 + housing 격차 vs groceries 격차"
- Adjacent metro 추천 (within-region similar RPP)

**Selection (Q8 권고 C 적용):** `data/compare-featured.json` (이미 존재) + GSC 28d top pairs + 50 cross-region popular = top 200 pairs.

**Implementation:** Phase B-6 (~1-2h). `lib/equivalent-pairs.ts` (top 200 × 2 directions = 400 rows, Trap #59 OK). `<RealWageEquivalent />` server SVG. `RelocationCalculator.tsx` (이미 존재) wrap.

#### ⭐ #2 16-yr RPP Trend (2008-2024) — 시계열 기반

**Why 핵심:** 1,290 페이지 모두 시계열 enrich. 차별화 #6 (PCE) 의 base data.

**Data:** BEA SARPP+MARPP 2008-2024. 9,675 → ~32,000 rows.

**Implementation:** Phase B-1 (~2-3h). 컴포넌트 `<RppTrendChart />` server SVG (PCE toggle 통합). /cities/, /state/, /trend/ 모두 wire.

**Boundary changes 2013/2018/2023:** 사용자 권고 적용 — 엄격 per-FIPS + "boundary changed YYYY" disclaimer.

#### ⭐ #4 Climate-Adjusted Energy Cost — geographic 차별화

**Why 핵심:** 기후 + 전기료 물리학 기반 계산. Numbeo/Bestplaces 가 못 하는 정밀도.

**Data:** NREL TMY3 (HDD/CDD per metro) + EIA Form 826 (state ¢/kWh) + DOE BTU/HDD 표준 상수.

**Examples:** "Phoenix vs Minneapolis HVAC = $1,840/yr 차이"

**Implementation:** Phase B-2 (~2-3h). `lib/climate-data.ts` (387 metros) + `lib/electricity-rates.ts` (51 × 5 yrs). `<ClimateEnergyCost />` server SVG. /cities/{slug}/utility-bill/ wire.

---

### Supporting 3 (Phase C 보조)

#### #3 Income-Adjusted Affordability Score — composite metric

기존 자산 (`AffordabilityCalc.tsx`) 활용 + 신규 derivation. 단일 composite headline + 3-component breakdown (Q2 권고).

#### #1 COL Glossary 50 entries — supplementary (V3 downgrade)

**V3 변경:** 헤드라인 차별화 X. /glossary/ 페이지 자체 + 사이트 internal link target + E-E-A-T 보조.

50 entries × 200-500 words × ≥1 primary-source citation. 5 카테고리 (BEA 12 / Census 10 / HUD 10 / Energy 8 / General 10). Phase B-3 (~2-3h drafting + ≥6h handwritten content).

#### #5 Citation Network — /glossary/ 한정 (V3 trim)

**V3 변경 (V2 의 site-wide DefinedTerm 제거):**
- /glossary/{slug}/ 페이지 내부에서 cross-references + backlinks (Wikipedia-style)
- 50 nodes × 5-10 cross-ref edges = ~400 edges
- DefinedTerm JSON-LD = /glossary/{slug}/ 페이지에만 (1 schema per entry)
- ❌ Site-wide regex inline `<dfn>` injection 제거 (false positive 위험: "the index", "rate" 일반 단어)
- ❌ 387 city + 51 state 페이지 DefinedTerm 미적용 (이미 Place + Article schema 부담)

**Implementation:** Phase B-5 (~3-4h). `lib/citation-network.ts` (50 nodes, Trap #59 OK). `scripts/build-crossref.ts` build-time backlink derivation (grep glossary term in app/, components/, lib/). `<GlossaryBacklinks />` 컴포넌트 (footer of /glossary/{slug}/).

---

### Deferred / V4 후보 (이번 chunk 미포함)
- #8 Transit / Commute Cost (BLS CES + Census ACS B08303) — Phase E
- #9 Crime Index (FBI UCR) — Phase E (YMYL care)
- #10 School Quality (NCES NAEP) — REJECTED (license + YMYL)
- #11 Revive curated /compare/ (top 100 pairs) — Phase F (6mo buffer)
- #12 RPP × Income Quintile Heatmap — V4
- #13 Migration Story Narratives (16-yr divergence stories) — V4
- #14 State Law Surcharge Layer (cross-link with propertytaxpeek) — V4
- #15 Climate Scenario Stress Test (NREL future projection) — V4

---

## §5 Phase A/B/C/D execution plan (V3 wall-clock 상향)

### Phase A — Real middleware (2-3 hours)

V2 와 동일 + 3-AXIS 명시:
1. `middleware.ts` full rewrite (ES_KILL, HTTPS_KILL, SYNTHETIC_QUARANTINE, EDGE_VERSION)
2. /es/ → HARD 410 + `app/es/` 폴더 삭제
3. AXIS B paths (`/search`, `/category`, `/rankings`, `/compare`, `/embed`) → X-Robots-Tag: noindex + `<SyntheticDataAdvisory />` inject
4. /https?:/ → 410
5. Edge version: `2026-05-02-tier-s-v3`
6. `app/robots.ts` + `public/robots.txt` parity (Trap #73)
7. `app/410/page.tsx` (Trap #16)

**Commit:** `HCU 5-청크 Phase A costbycity: middleware 3-AXIS quarantine + /es/ kill + robots parity`

### Phase B — Data layer (6 sub-phases, parallelizable)

#### B-1 — BEA RPP 2008-2019 backfill (2-3h)
9,675 → ~32,000 rows. Strict per-FIPS + boundary change disclaimer.

#### B-2 — Climate + Energy (2-3h)
NREL HDD/CDD + EIA rate. `lib/climate-data.ts` + `lib/electricity-rates.ts` (Trap #59 TS).

#### B-3 — Glossary 50 entries (2-3h scaffold + ≥6h handwritten content)
**V3 솔직: 50 entries 본문 작성은 ≥6h handwritten content alone.** Scaffold (TS module 구조 + 카테고리 분류) 2-3h + content drafting 6h+.

#### B-4 — PCE Deflator 1929-2024 (2-3h)
`lib/pce-deflator.ts` (~1,150 rows, Trap #59 OK). `lib/real-value.ts` 헬퍼.

#### B-5 — Citation Network /glossary/ 한정 (3-4h, V3 scope trim)
`lib/citation-network.ts` (50 nodes × 5-10 cross-ref edges). `scripts/build-crossref.ts` build-time backlink derivation.

❌ V2 의 "site-wide DefinedTerm regex inject" 작업 제거.

#### B-6 — City-pair equivalent top 200 (1-2h)
`lib/equivalent-pairs.ts` (top 200 × 2 dir = 400 rows, Trap #59 OK).

**Phase B parallelization:** B-1/2/3-scaffold/4 동시 (4 agents) → 8h → 2-3h 단축. B-3 content + B-5 + B-6 sequential (B-3 needs full content for B-5 backlinks; B-6 needs B-1 16-yr RPP).

**Bundle commit:** `HCU 5-청크 Phase B costbycity: BEA 16yr + climate + glossary 50 + PCE + citation /glossary/ + equivalent 200`

### Phase C — UX components + new routes (9-12h, V3 +3h vs V2)

**V3 wall-clock 정직 산정:**
- 9 components × 평균 80 LOC = ≥4h
- 50 glossary entries handwritten content (≥6h, B-3 에서 분리됐지만 wire-up 시 추가 검수 필요)
- 11 route groups (page.tsx + generateStaticParams + generateMetadata + JSON-LD) = ≥3h
- Wire-ups (cities + state + utility-bill 3 surface 본문 inject) = ≥2h

#### C-1 Components (9개)

| Component | LOC | Note |
|-----------|-----|------|
| `RppTrendChart.tsx` | ~120 | server SVG, PCE toggle integrated |
| `AffordabilityScoreCard.tsx` | ~80 | server SVG gauge |
| `ClimateEnergyCost.tsx` | ~70 | server SVG bar |
| `RelocationDeltaCard.tsx` | ~60 | server SVG |
| `GlossaryTermCard.tsx` | ~40 | index card |
| `GlossaryEntryBody.tsx` | ~80 | full entry rendering |
| `GlossaryBacklinks.tsx` | ~50 | footer of /glossary/{slug}/ |
| `PCEDeflatorToggle.tsx` | ~70 | `'use client'` |
| `RealWageEquivalent.tsx` | ~90 | server SVG bidirectional |

**Trap #34/#36 safety:** `style={{ fill: '#XXX' }}` only.

#### C-2 New routes

| Route | Source | Cardinality | AXIS |
|-------|--------|-------------|------|
| `/glossary/` | GLOSSARY index | 1 | A |
| `/glossary/{slug}/` | 50 entries | 50 | A |
| `/tools/` | tools index | 1 | A |
| `/tools/affordability-calculator/` | static + form | 1 | A |
| `/tools/relocation-cost/` | static + form | 1 | A |
| `/trend/` | trend hub | 1 | A |
| `/trend/{metric}/` | RPP / income / rent / home value × 16yr | 5-8 | A |
| `/equivalent/` | equivalent index | 1 | A |
| `/equivalent/{from}-vs-{to}/` | top 200 pairs **≥400 words 각 페이지** | 200 | A |
| `/sources/` | federal source roster + author credentials | 1 | A |

**Total:** +266 routes (200 equivalent + 50 glossary + 16 misc).

#### C-3 Wire into existing hubs

- `/cities/{slug}/`: insert `<RppTrendChart>` (PCE toggle), `<AffordabilityScoreCard>`, `<RealWageEquivalent>` inline calculator. **GlossaryTooltip 미적용 (V3 trim)** — citation footnote는 inline `<sup>` reference 만.
- `/cities/{slug}/utility-bill/`: insert `<ClimateEnergyCost>`
- `/state/{slug}/`: insert `<RppTrendChart>` (state aggregate)
- `/insights/`, `/blog/`, `/guide/`: cross-link to /glossary/ entries (manual, not regex)

**Bundle commit:** `HCU 5-청크 Phase C costbycity: 9 components + 11 route groups + AXIS A inline citations + /equivalent/ ≥400 words/page`

### Phase D — Sitemap + verify (1-2h)

1. `scripts/build-sitemap.ts`: +266 → 1,290 → ~1,556 URLs
2. `scripts/verify-deploy-20260502-v3.sh`:
   - 5 /cities/, 5 /utility-bill/, 5 /state/ depth verify
   - 10 /glossary/{slug}/ (200+ words + ≥1 citation + ≥3 backlinks)
   - 5 /trend/{metric}/ (PCE toggle markup)
   - 10 /equivalent/{pair}/ (**≥400 words** + RealWageEquivalent + 16-yr cross-link)
   - /sources/ (5 federal sources)
   - 5 AXIS B paths (X-Robots-Tag: noindex)
   - = ~50 checks
3. Cardinality guard: `if (urls.length > 5000 && !SITEMAP_LARGE_OK) throw`
4. IndexNow ~270 new URLs

**Commit:** `HCU 5-청크 Phase D costbycity: sitemap +266, verify v3, IndexNow push`

---

## §6 Files manifest (V3, V2 와 거의 동일 — site-wide DefinedTerm 제거만 차이)

### New files
```
data/raw/bea-rpp/SARPP-2008-2024.zip                ~3 MB (B-1)
data/raw/bea-rpp/MARPP-2008-2024.zip                ~5 MB (B-1)
data/raw/bea-pce/PCEPI-1929-2024.csv                ~1 MB (B-4)
data/raw/nrel-tmy3/station_hdd_cdd.csv              ~500 KB (B-2)
data/raw/eia/state_residential_rate.csv             ~50 KB (B-2)
data/crossref-backlinks.json                        ~50 KB (B-5, /glossary/ 한정)

scripts/download-bea-rpp.ts                         (B-1)
scripts/download-bea-pce.ts                         (B-4)
scripts/download-nrel-climate.ts                    (B-2)
scripts/download-eia-electricity.ts                 (B-2)
scripts/build-crossref.ts                           (B-5)
scripts/build-equivalent-pairs.ts                   (B-6)
scripts/verify-deploy-20260502-v3.sh                (D)

lib/climate-data.ts                                 (B-2)
lib/electricity-rates.ts                            (B-2)
lib/glossary-data.ts                                (B-3)
lib/affordability-score.ts                          (C-1)
lib/rpp-trend.ts                                    (C-1)
lib/pce-deflator.ts                                 (B-4)
lib/real-value.ts                                   (B-4)
lib/citation-network.ts                             (B-5, /glossary/ scope)
lib/equivalent-pairs.ts                             (B-6)

components/RppTrendChart.tsx                        (C-1)
components/AffordabilityScoreCard.tsx               (C-1)
components/ClimateEnergyCost.tsx                    (C-1)
components/RelocationDeltaCard.tsx                  (C-1)
components/GlossaryTermCard.tsx                     (C-1)
components/GlossaryEntryBody.tsx                    (C-1)
components/GlossaryBacklinks.tsx                    (C-1, /glossary/{slug}/ footer)
components/PCEDeflatorToggle.tsx                    (C-1, 'use client')
components/RealWageEquivalent.tsx                   (C-1)
components/SyntheticDataAdvisory.tsx                (A, AXIS B inject)

app/410/page.tsx                                    (A)
app/glossary/page.tsx                               (C-2)
app/glossary/[slug]/page.tsx                        (C-2)
app/tools/page.tsx                                  (C-2)
app/tools/affordability-calculator/page.tsx         (C-2)
app/tools/relocation-cost/page.tsx                  (C-2)
app/trend/page.tsx                                  (C-2)
app/trend/[metric]/page.tsx                         (C-2)
app/equivalent/page.tsx                             (C-2)
app/equivalent/[pair]/page.tsx                      (C-2)
app/sources/page.tsx                                (C-2)
docs/CHUNK5-PATCH-DIRECTIVE-V3-20260502.md          (this file)
```

### Modified files
```
middleware.ts                          FULL REWRITE (A)
app/robots.ts                          AXIS B + /es/ disallow (A)
public/robots.txt                      Trap #73 parity (A)
scripts/fetch-data.py                  refactor multi-year (B-1)
scripts/build-sitemap.ts               +266 URLs (D)
lib/db.ts                              add getRppTrend, getAffordabilityScore, getCityPairEquivalent, getPCEDeflator (C)
lib/cost-commentary.ts                 add real-vs-nominal narratives (C)
app/cities/[slug]/page.tsx             wire 3 new components + inline citations (C, V3: GlossaryTooltip 미적용)
app/cities/[slug]/utility-bill/page.tsx wire ClimateEnergyCost (C)
app/state/[slug]/page.tsx              wire RppTrendChart + PCE toggle (C, V3: GlossaryTooltip 미적용)
app/methodology/page.tsx               add 5 federal source roster (C)
app/about/page.tsx                     add author credentials + sourcing policy (C)
app/page.tsx                           add new top-nav links (C)
app/layout.tsx                         add Glossary + Tools + Trend + Sources nav (C)
public/IndexNow.txt                    rotate key if needed (D)
```

### Deleted files
```
app/es/layout.tsx                      (A)
app/es/page.tsx                        (A)
app/es/cities/[slug]/page.tsx          (A)
```

### DB schema changes (V2 와 동일)
```sql
-- B-1: extend rpp (no schema change)
-- B-2: NEW climate + electricity_rates tables
-- B-4: pce_deflator → TS module preferred (Trap #59), no DB
```

---

## §7 Rollout sequence (V3 wall-clock)

```
Phase A (2-3h)        REAL middleware build → deploy → smoke
       ↓ 24h Cloudflare cache observation
Phase B-1 (2-3h)      BEA RPP 2008-2019 backfill   ┐
Phase B-2 (2-3h)      NREL + EIA TS modules        ├─ 4 parallelizable
Phase B-3-scaffold    Glossary structure + 카테고리 (~1h) ┤
Phase B-4 (2-3h)      BEA PCE deflator             ┘
       ↓
Phase B-3-content (≥6h handwritten)  Glossary 50 본문 작성
       ↓
Phase B-5 (3-4h)      Citation network /glossary/ + backlinks (waits B-3 content)
Phase B-6 (1-2h)      City-pair equivalent (waits B-1)
       ↓ all data layer committed
Phase C (9-12h)       9 components + 11 route groups + wire-ups + 50 glossary content review
       ↓ deploy → 50-check verify
Phase D (1-2h)        sitemap +266, verify, IndexNow
       ↓ 7-day GSC observation
```

**Total V3 estimate: 24-34 hours (3-4 dev days).**
**Parallel (4 agents B-1/2/4 + scaffold): 16-22 hours wall-clock.**

V3 wall-clock 이 V2 보다 +3-3h 솔직 — 50 glossary 본문 ≥6h 알맞게 산정 + Phase C +3h.

---

## §8 Verification checklist (V3)

### Phase A verify
- [ ] `curl -sI https://costbycity.com/` → `x-edge-version: 2026-05-02-tier-s-v3`
- [ ] `/es/` → 410 / `/search/`, `/rankings/`, `/compare/`, `/embed/` → 200 + X-Robots-Tag: noindex
- [ ] `public/robots.txt` ≡ `app/robots.ts` (Trap #73)

### Phase B verify (local)
- [ ] `sqlite3 data/costliving.db "SELECT year, COUNT(*) FROM rpp GROUP BY year"` → 2008-2024 ~1,900/yr
- [ ] climate (~387) + electricity_rates (~250) tables exist
- [ ] `bun -e "import('./lib/glossary-data').then(m => console.log(m.GLOSSARY.length))"` → 50
- [ ] `bun -e "import('./lib/pce-deflator').then(m => console.log(m.PCE_DEFLATOR.length))"` → ~1,150
- [ ] `bun -e "import('./lib/citation-network').then(m => console.log(Object.keys(m.CITATION_NETWORK).length))"` → 50
- [ ] `bun -e "import('./lib/equivalent-pairs').then(m => console.log(m.EQUIVALENT_PAIRS.length))"` → 200
- [ ] Each glossary entry has ≥1 citation + ≥3 related_terms

### Phase C verify (local pre-deploy)
- [ ] `bun run build` succeeds (no Trap #16)
- [ ] `bunx tsc --noEmit` clean / `bunx eslint .` clean
- [ ] `/cities/abilene-tx/` HTML includes `<svg class="rpp-trend">`, `<svg class="affordability-score">`, `<svg class="real-wage-equivalent">`, `<sup>` citation refs
- [ ] `/glossary/regional-price-parity/` ≥200 words + ≥1 citation link + ≥3 backlinks + DefinedTerm JSON-LD
- [ ] `/trend/rpp/` PCE toggle markup
- [ ] `/equivalent/detroit-mi-vs-san-francisco-ca/` **≥400 words** + bidirectional + 16-yr cross-link

### Phase D verify (production)
- [ ] sitemap.xml 1,556±10 URLs
- [ ] 5 /cities/, 5 /utility-bill/, 5 /state/, 10 /glossary/, 5 /trend/, 10 /equivalent/ → all 200
- [ ] /sources/ 5 federal sources cited
- [ ] 5 AXIS B paths X-Robots-Tag: noindex
- [ ] IndexNow ≥260/270

---

## §9 Open questions for user (Q1-Q9, V3 권고 수정)

### V1 questions

**Q1 Glossary scope** — 50 vs 100? **Recommend: 50** (이미 supplementary 로 downgrade, 100 으로 늘리는 것은 V4).

**Q2 Affordability score** — composite vs multi-dim? **Recommend: composite headline + 3-component breakdown.**

**Q3 BEA boundary changes** — strict per-FIPS vs metro name rebrand? **Recommend: strict per-FIPS + "boundary changed YYYY" disclaimer.**

**Q4 Climate cost** — absolute vs delta? **Recommend: 둘 다** (absolute headline + delta side-note).

**Q5 Phase E (Transit + Crime)** — same chunk vs separate? **Recommend: separate.**

### V2 questions (V3 수정 권고)

**Q6 Citation network scope (V3 REVISED):**
- ❌ V2 권고: entire-site DefinedTerm regex inline
- ✅ **V3 권고: /glossary/{slug}/ 페이지에만 DefinedTerm schema + cross-references + Wikipedia-style backlinks**
- 이유: regex site-wide injection 은 false-positive 위험 ("the index", "rate") + maintenance 부담. 387 city + 51 state 페이지는 이미 Place + Article schema 부담. /glossary/ 한정이 정확하고 효과 큼.

**Q7 PCE deflator UX** — client-side toggle vs URL variant? **Recommend: client-side `'use client'` toggle** (URL 폭증 회피, default 2024 dollars).

**Q8 City-pair top 200 selection** — A/B/C? **Recommend: C (mixed)** — `compare-featured.json` (이미 존재) + GSC 28d top + 50 cross-region.

**Q9 schema scope (V3 REVISED 페이지 타입별 차등):**
- ❌ V2 권고: 모두 일괄 4종 (Article+Person+DefinedTerm+Place)
- ✅ **V3 권고: 페이지 타입별 차등**
  - `/cities/{slug}/` → Place + Dataset + Article (Person ❌, DefinedTerm 인라인 ❌)
  - `/state/{slug}/` → Place + Article
  - `/glossary/{slug}/` → DefinedTerm + Article + Person
  - `/blog/`, `/insights/`, `/guide/` → Article + Person
  - `/equivalent/{pair}/` → Article + Dataset
- 이유: page type 별 schema 가 Google 가 expect 하는 정확한 markup. 일괄 4종은 noise + maintenance 부담.

---

## §10 vs taxded / oshapeek / salarybycity / V2 비교

| Dimension | taxded | oshapeek | salarybycity | costbycity V2 | **costbycity V3** |
|-----------|--------|----------|--------------|---------------|-------------------|
| Data source | IRS SOI | DOL OSHA | BLS OEWS | BEA + ACS + NREL + EIA + PCE | **same as V2** |
| Pre-existing depth | 119 | 7→2,096 | 535 | 1,290 | **1,290** |
| Phase target URLs | +0 | +2,089 | +55 | +270 | **+266** |
| Differentiator count (헤드라인) | 1 | 4 | 4 | 7 (사전 frame) | **4 헤드라인 + 3 supporting** |
| 사전 정체성 frame | low | low | medium | HIGH (오류) | **N/A — academic-grade COL precision** |
| Middleware approach | AXIS B advisory | HARD 410 | done | BARE → 3-AXIS | **same as V2** |
| Wall-clock | 1d | 1d | 1d | 21-31h | **24-34h (parallel 16-22h)** |
| Veto #7 | clear | mitigated | clear | clear | **clear (equivalent derivation 명시)** |
| Veto #8 | n/a | applied | n/a | applied | **applied** |
| Trap #80 risk | hit (fixed) | hit (fixed 2nd) | n/a | low | **low** |
| User-facing innovation | state commentary | inspection narrative | charts+glossary | 7 ⭐ (사전 frame) | **PCE deflator + real-wage equivalent + 16-yr RPP + climate** |

**costbycity V3 = portfolio 에서 가장 academic-grade COL chunk.** 사전 사이트 X — federal-source-backed comparison data 사이트의 academic-grade depth.

---

## Decision request

User please answer **Q1-Q9** (V3 권고 적용) or "all V3 defaults" to accept.

Once answered:
1. **Phase A** (2-3h, REAL work)
2. **Phase B-1/B-2/B-3-scaffold/B-4** parallel agents (~8h → 2-3h wall)
3. **Phase B-3 content** (≥6h handwritten, 단독)
4. **Phase B-5/B-6** sequential
5. **Phase C** (9-12h, local build verify before deploy)
6. **Phase D** (sitemap +266 + IndexNow + 7-day GSC observation)

Or: defer entire chunk if user wants to focus on other sites first.

---

**End of V3 directive.**
