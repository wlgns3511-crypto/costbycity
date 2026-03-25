import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'costliving.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

// --- Types ---

export interface Metro {
  fips: string;
  name: string;
  short_name: string;
  state: string;
  slug: string;
}

export interface RPP {
  fips: string;
  year: number;
  category: string;
  value: number;
}

export interface ACS {
  fips: string;
  median_income: number | null;
  median_home_value: number | null;
  median_rent: number | null;
  per_capita_income: number | null;
}

export interface CityData {
  metro: Metro;
  rpp: Record<string, number>; // category -> value
  acs: ACS | null;
  year: number;
}

// --- Queries ---

export function getAllMetros(): Metro[] {
  return getDb().prepare('SELECT * FROM metros ORDER BY short_name').all() as Metro[];
}

export function getMetroBySlug(slug: string): Metro | undefined {
  return getDb().prepare('SELECT * FROM metros WHERE slug = ?').get(slug) as Metro | undefined;
}

export function getMetroByFips(fips: string): Metro | undefined {
  return getDb().prepare('SELECT * FROM metros WHERE fips = ?').get(fips) as Metro | undefined;
}

export function getLatestRPP(fips: string): Record<string, number> {
  const rows = getDb().prepare(`
    SELECT category, value FROM rpp
    WHERE fips = ? AND year = (SELECT MAX(year) FROM rpp WHERE fips = ?)
  `).all(fips, fips) as { category: string; value: number }[];

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.category] = row.value;
  }
  return result;
}

export function getLatestYear(fips: string): number {
  const row = getDb().prepare('SELECT MAX(year) as y FROM rpp WHERE fips = ?').get(fips) as { y: number };
  return row?.y || 2023;
}

export function getACS(fips: string): ACS | null {
  return getDb().prepare('SELECT * FROM acs WHERE fips = ?').get(fips) as ACS | null;
}

export function getCityData(slug: string): CityData | null {
  const metro = getMetroBySlug(slug);
  if (!metro) return null;
  const rpp = getLatestRPP(metro.fips);
  const acs = getACS(metro.fips);
  const year = getLatestYear(metro.fips);
  return { metro, rpp, acs, year };
}

// --- Rankings ---

export function getMostExpensiveCities(limit = 20): (Metro & { rpp_all: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as rpp_all
    FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE r.category = 'all' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY r.value DESC
    LIMIT ?
  `).all(limit) as (Metro & { rpp_all: number })[];
}

export function getCheapestCities(limit = 20): (Metro & { rpp_all: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as rpp_all
    FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE r.category = 'all' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY r.value ASC
    LIMIT ?
  `).all(limit) as (Metro & { rpp_all: number })[];
}

export function getAllCitiesWithRPP(): (Metro & { rpp_all: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as rpp_all
    FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE r.category = 'all' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY m.short_name
  `).all() as (Metro & { rpp_all: number })[];
}

// --- Comparison ---

export function getTopComparisons(limit = 5000): { slugA: string; slugB: string }[] {
  // Generate comparison pairs from top metros by RPP difference (most interesting)
  return getDb().prepare(`
    SELECT a_m.slug as slugA, b_m.slug as slugB
    FROM rpp a
    JOIN rpp b ON a.category = 'all' AND b.category = 'all'
      AND a.year = b.year AND a.fips < b.fips
      AND a.year = (SELECT MAX(year) FROM rpp)
    JOIN metros a_m ON a.fips = a_m.fips
    JOIN metros b_m ON b.fips = b_m.fips
    ORDER BY ABS(a.value - b.value) DESC
    LIMIT ?
  `).all(limit) as { slugA: string; slugB: string }[];
}

export function countMetros(): number {
  const row = getDb().prepare('SELECT COUNT(*) as c FROM metros').get() as { c: number };
  return row.c;
}

export function getMetrosByState(): Record<string, Metro[]> {
  const all = getAllMetros();
  const groups: Record<string, Metro[]> = {};
  for (const m of all) {
    const st = m.state || 'Other';
    if (!groups[st]) groups[st] = [];
    groups[st].push(m);
  }
  return groups;
}

export function getAllStates(): string[] {
  return (getDb().prepare('SELECT DISTINCT state FROM metros WHERE state IS NOT NULL AND state != \'\' ORDER BY state').all() as { state: string }[]).map(r => r.state);
}

export function getMetrosByStateCode(state: string): (Metro & { rpp_all: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as rpp_all FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE m.state = ? AND r.category = 'all' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY r.value DESC
  `).all(state) as (Metro & { rpp_all: number })[];
}

export function getRPPHistory(fips: string): { year: number; value: number }[] {
  return getDb().prepare(`
    SELECT year, value FROM rpp WHERE fips = ? AND category = 'all' ORDER BY year
  `).all(fips) as { year: number; value: number }[];
}

export function getCheapestHousing(limit = 20): (Metro & { housing: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as housing FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE r.category = 'housing' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY r.value ASC LIMIT ?
  `).all(limit) as (Metro & { housing: number })[];
}

export function getMostExpensiveHousing(limit = 20): (Metro & { housing: number })[] {
  return getDb().prepare(`
    SELECT m.*, r.value as housing FROM metros m
    JOIN rpp r ON m.fips = r.fips
    WHERE r.category = 'housing' AND r.year = (SELECT MAX(year) FROM rpp)
    ORDER BY r.value DESC LIMIT ?
  `).all(limit) as (Metro & { housing: number })[];
}
