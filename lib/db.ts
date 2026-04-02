import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "weather.db");

// Avoid creating multiple connections during Next.js hot reloads in dev
const globalForDb = globalThis as unknown as {
  _db: Database.Database | undefined;
};

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS search_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT    NOT NULL,
      country          TEXT    NOT NULL,
      longitude        REAL    NOT NULL,
      latitude         REAL    NOT NULL,
      last_searched_at TEXT    NOT NULL,
      UNIQUE(name, country, longitude, latitude)
    )
  `);
}

export function getDb(): Database.Database {
  if (!globalForDb._db) {
    const dbPath = process.env.SEARCH_HISTORY_DB_PATH ?? DEFAULT_DB_PATH;

    if (dbPath !== ":memory:") {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    const db = new Database(dbPath);
    // Write-Ahead Logging for better concurrent read performance
    db.pragma("journal_mode = WAL");
    initSchema(db);
    globalForDb._db = db;
  }
  return globalForDb._db;
}
