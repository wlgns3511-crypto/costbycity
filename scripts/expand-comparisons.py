#!/usr/bin/env python3
"""Generate all pairwise city comparisons for cost-of-living"""
import sqlite3, os, time

DB_PATH = os.path.join(os.path.dirname(__file__), "../data/costliving.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS comparisons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slugA TEXT NOT NULL, slugB TEXT NOT NULL,
            cityA TEXT NOT NULL, cityB TEXT NOT NULL,
            popularity_score REAL DEFAULT 0,
            UNIQUE(slugA, slugB)
        )
    """)
    metros = conn.execute("SELECT slug, short_name FROM metros ORDER BY slug").fetchall()
    print(f"Total metros: {len(metros)}")
    existing = conn.execute("SELECT COUNT(*) FROM comparisons").fetchone()[0]
    if existing > 70000:
        print("Already expanded!")
        return
    t0 = time.time()
    batch = []
    count = 0
    for i in range(len(metros)):
        for j in range(i + 1, len(metros)):
            slugA, cityA = metros[i]
            slugB, cityB = metros[j]
            batch.append((slugA, slugB, cityA, cityB, len(cityA) + len(cityB)))
            count += 1
            if len(batch) >= 5000:
                conn.executemany("INSERT OR IGNORE INTO comparisons (slugA, slugB, cityA, cityB, popularity_score) VALUES (?,?,?,?,?)", batch)
                conn.commit()
                print(f"  Inserted {count} pairs...")
                batch = []
    if batch:
        conn.executemany("INSERT OR IGNORE INTO comparisons (slugA, slugB, cityA, cityB, popularity_score) VALUES (?,?,?,?,?)", batch)
        conn.commit()
    final = conn.execute("SELECT COUNT(*) FROM comparisons").fetchone()[0]
    print(f"\nDone! {final} comparisons in {time.time()-t0:.1f}s")
    conn.close()

if __name__ == "__main__":
    main()
