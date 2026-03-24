"""
Fetch cost of living data from BEA Regional Price Parities + Census ACS.
Builds SQLite database for programmatic SEO site.

Usage: python3 scripts/fetch-data.py --bea-key=YOUR_BEA_KEY --census-key=YOUR_CENSUS_KEY
"""

import json
import os
import sys
import time
import sqlite3
import re
import urllib.request

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DB_PATH = os.path.join(DATA_DIR, 'costliving.db')

BEA_API = 'https://apps.bea.gov/api/data/'
CENSUS_API = 'https://api.census.gov/data/2022/acs/acs5'

# Parse CLI args
BEA_KEY = os.environ.get('BEA_API_KEY', '')
CENSUS_KEY = os.environ.get('CENSUS_API_KEY', '')
for arg in sys.argv:
    if arg.startswith('--bea-key='):
        BEA_KEY = arg.split('=', 1)[1]
    if arg.startswith('--census-key='):
        CENSUS_KEY = arg.split('=', 1)[1]

# RPP categories
RPP_CATEGORIES = {
    '1': 'all',
    '2': 'goods',
    '3': 'housing',
    '4': 'utilities',
    '5': 'other_services',
}


def slugify(text):
    text = text.lower()
    # Remove "(Metropolitan Statistical Area)" suffix
    text = re.sub(r'\s*\(metropolitan statistical area\)', '', text)
    text = re.sub(r'[,()\']', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def extract_state(name):
    m = re.search(r',\s*([A-Z]{2}(?:-[A-Z]{2})*)', name)
    if m:
        return m.group(1).split('-')[0]
    return ''


def short_name(name):
    """'New York-Newark-Jersey City, NY-NJ-PA (Metropolitan Statistical Area)' -> 'New York, NY'"""
    name = re.sub(r'\s*\(Metropolitan Statistical Area\)', '', name)
    parts = name.split(',')
    if len(parts) < 2:
        return name
    city = parts[0].split('-')[0].strip()
    state = parts[-1].strip().split('-')[0].strip()
    return f'{city}, {state}'


def api_get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'costliving-data/1.0'})
    resp = urllib.request.urlopen(req, timeout=60)
    return json.loads(resp.read())


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE metros (
            fips TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            short_name TEXT NOT NULL,
            state TEXT,
            slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE rpp (
            fips TEXT NOT NULL,
            year INTEGER NOT NULL,
            category TEXT NOT NULL,
            value REAL NOT NULL,
            PRIMARY KEY (fips, year, category)
        );

        CREATE TABLE acs (
            fips TEXT PRIMARY KEY,
            median_income INTEGER,
            median_home_value INTEGER,
            median_rent INTEGER,
            per_capita_income INTEGER
        );

        CREATE INDEX idx_rpp_fips ON rpp(fips);
        CREATE INDEX idx_metros_slug ON metros(slug);
    ''')
    conn.commit()
    return conn


def fetch_bea_rpp(conn):
    """Fetch BEA Regional Price Parities for all MSAs."""
    if not BEA_KEY:
        print('  SKIP BEA (no key)')
        return

    c = conn.cursor()
    metros_added = set()
    slug_counts = {}

    for line_code, category in RPP_CATEGORIES.items():
        url = (
            f'{BEA_API}?method=GetData&DataSetName=Regional'
            f'&TableName=MARPP&LineCode={line_code}&GeoFips=MSA'
            f'&Year=LAST5&UserID={BEA_KEY}&ResultFormat=json'
        )
        print(f'  Fetching RPP {category}...')
        try:
            result = api_get(url)
            data = result.get('BEAAPI', {}).get('Results', {}).get('Data', [])
            count = 0
            for row in data:
                fips = row.get('GeoFips', '').strip()
                name = row.get('GeoName', '').strip()
                year = int(row.get('TimePeriod', '0'))
                val_str = row.get('DataValue', '')

                if not fips or not name or not val_str or val_str == '(NA)':
                    continue

                try:
                    value = float(val_str.replace(',', ''))
                except ValueError:
                    continue

                # Add metro if not seen
                if fips not in metros_added:
                    state = extract_state(name)
                    sname = short_name(name)
                    slug = slugify(name)
                    if slug in slug_counts:
                        slug_counts[slug] += 1
                        slug = f'{slug}-{slug_counts[slug]}'
                    else:
                        slug_counts[slug] = 1
                    c.execute('INSERT OR IGNORE INTO metros VALUES (?,?,?,?,?)',
                              (fips, name, sname, state, slug))
                    metros_added.add(fips)

                c.execute('INSERT OR REPLACE INTO rpp VALUES (?,?,?,?)',
                          (fips, year, category, value))
                count += 1

            print(f'    {count} records')
        except Exception as e:
            print(f'    ERROR: {e}')

        time.sleep(0.5)

    conn.commit()


def fetch_census_acs(conn):
    """Fetch Census ACS data for all metros."""
    if not CENSUS_KEY:
        print('  SKIP Census (no key)')
        return

    variables = 'NAME,B19013_001E,B25077_001E,B25064_001E,B19301_001E'
    url = (
        f'{CENSUS_API}?get={variables}'
        f'&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:*'
        f'&key={CENSUS_KEY}'
    )

    print('  Fetching Census ACS data...')
    try:
        result = api_get(url)
        headers = result[0]
        rows = result[1:]

        c = conn.cursor()
        count = 0
        for row in rows:
            fips = row[-1]  # Last column is the FIPS code
            name = row[0]

            # Parse values (Census returns strings, -666666666 = missing)
            def parse_val(v):
                if not v or v == '-666666666' or v == 'null':
                    return None
                try:
                    return int(float(v))
                except:
                    return None

            income = parse_val(row[1])
            home_val = parse_val(row[2])
            rent = parse_val(row[3])
            per_capita = parse_val(row[4])

            if income or home_val or rent:
                c.execute('INSERT OR REPLACE INTO acs VALUES (?,?,?,?,?)',
                          (fips, income, home_val, rent, per_capita))
                count += 1

        print(f'    {count} records')
        conn.commit()
    except Exception as e:
        print(f'    ERROR: {e}')


def main():
    print('=== Cost of Living Data Fetcher ===')
    print(f'BEA key: {"SET" if BEA_KEY else "NOT SET"}')
    print(f'Census key: {"SET" if CENSUS_KEY else "NOT SET"}')

    conn = init_db()

    print('\n1. Fetching BEA Regional Price Parities...')
    fetch_bea_rpp(conn)

    print('\n2. Fetching Census ACS data...')
    fetch_census_acs(conn)

    # Summary
    c = conn.cursor()
    metro_count = c.execute('SELECT COUNT(*) FROM metros').fetchone()[0]
    rpp_count = c.execute('SELECT COUNT(*) FROM rpp').fetchone()[0]
    acs_count = c.execute('SELECT COUNT(*) FROM acs').fetchone()[0]
    latest_year = c.execute('SELECT MAX(year) FROM rpp').fetchone()[0]

    # Count potential comparison pages
    compare_pages = metro_count * (metro_count - 1) // 2

    print(f'\n=== Database Summary ===')
    print(f'  Metro areas: {metro_count}')
    print(f'  RPP records: {rpp_count}')
    print(f'  ACS records: {acs_count}')
    print(f'  Latest RPP year: {latest_year}')
    print(f'  DB size: {os.path.getsize(DB_PATH) / 1024:.1f} KB')
    print(f'\n  City pages: {metro_count}')
    print(f'  Comparison pages: {compare_pages}')
    print(f'  Total potential pages: {metro_count + compare_pages}')

    conn.close()
    print('\nDone!')


if __name__ == '__main__':
    main()
