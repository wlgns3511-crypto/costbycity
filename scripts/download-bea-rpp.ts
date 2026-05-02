#!/usr/bin/env tsx
/**
 * BEA RPP 2008-2024 16-yr backfill — Phase B-1.
 *
 * Reads pre-downloaded BEA bulk CSVs from data/raw/bea-rpp/ (SARPP/MARPP)
 * and upserts into rpp table of data/costliving.db.
 *
 * Source: https://apps.bea.gov/regional/zip/SARPP.zip + MARPP.zip
 * Last data vintage: Feb 2026 (2024 estimates)
 *
 * Categories (LineCode → name):
 *   1 → all
 *   2 → goods
 *   3 → housing
 *   4 → utilities
 *   5 → other_services
 *
 * Veto #7 status: CLEAR — primary BEA RPP. No synthesis.
 *
 * Usage: npx tsx scripts/download-bea-rpp.ts
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW_DIR = join(process.cwd(), 'data/raw/bea-rpp');
const DB_PATH = join(process.cwd(), 'data/costliving.db');

const SARPP_FILE = join(RAW_DIR, 'SARPP_STATE_2008_2024.csv');
const MARPP_FILE = join(RAW_DIR, 'MARPP_MSA_2008_2024.csv');

const CATEGORY_MAP: Record<string, string> = {
  '1': 'all',
  '2': 'goods',
  '3': 'housing',
  '4': 'utilities',
  '5': 'other_services',
};

const YEARS = Array.from({ length: 17 }, (_, i) => 2008 + i); // 2008..2024

type Row = { fips: string; year: number; category: string; value: number };

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function importCsv(path: string, label: string): Row[] {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const yearStartIdx = header.indexOf('2008');
  if (yearStartIdx < 0) {
    throw new Error(`${label}: no 2008 column in header`);
  }

  const rows: Row[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCsvLine(line);
    if (cols.length < yearStartIdx + 17) continue;

    const fips = cols[0].replace(/"/g, '').trim();
    const lineCode = cols[4].replace(/"/g, '').trim();
    const category = CATEGORY_MAP[lineCode];
    if (!category) continue;
    if (fips === '00000') continue; // skip national aggregate
    if (!/^\d{5}$/.test(fips)) continue;

    for (let y = 0; y < 17; y++) {
      const yearStr = header[yearStartIdx + y];
      const year = parseInt(yearStr, 10);
      const valStr = cols[yearStartIdx + y].replace(/"/g, '').trim();
      const val = parseFloat(valStr);
      if (!Number.isFinite(val)) {
        skipped++;
        continue;
      }
      rows.push({ fips, year, category, value: val });
    }
  }

  console.log(`  ${label}: ${rows.length} rows parsed, ${skipped} cells skipped (NA/D)`);
  return rows;
}

function main() {
  console.log('[B-1] BEA RPP 16-yr backfill');
  console.log(`  source: ${RAW_DIR}`);
  console.log(`  target: ${DB_PATH}`);
  console.log(`  years: ${YEARS[0]}..${YEARS[YEARS.length - 1]} (${YEARS.length})`);
  console.log();

  const sarpp = importCsv(SARPP_FILE, 'SARPP_STATE');
  const marpp = importCsv(MARPP_FILE, 'MARPP_MSA');
  const all = sarpp.concat(marpp);

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const before = (db.prepare('SELECT COUNT(*) AS n FROM rpp').get() as { n: number }).n;
  console.log(`\n  rpp table before: ${before} rows`);

  const upsert = db.prepare(`
    INSERT INTO rpp (fips, year, category, value)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(fips, year, category) DO UPDATE SET value = excluded.value
  `);

  const tx = db.transaction((rows: Row[]) => {
    for (const r of rows) upsert.run(r.fips, r.year, r.category, r.value);
  });
  tx(all);

  const after = (db.prepare('SELECT COUNT(*) AS n FROM rpp').get() as { n: number }).n;
  console.log(`  rpp table after:  ${after} rows  (+${after - before})`);

  const yearStats = db.prepare(`
    SELECT year, COUNT(DISTINCT fips) AS fips_n, COUNT(*) AS rows
    FROM rpp GROUP BY year ORDER BY year
  `).all() as Array<{ year: number; fips_n: number; rows: number }>;
  console.log('\n  year coverage:');
  for (const s of yearStats) {
    console.log(`    ${s.year}: ${s.fips_n} FIPS, ${s.rows} rows`);
  }

  db.close();
  console.log('\n[B-1] done.');
}

main();
