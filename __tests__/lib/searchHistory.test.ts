import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type Database from "better-sqlite3";

// Point to an in-memory DB before any module that calls getDb() is imported
process.env.SEARCH_HISTORY_DB_PATH = ":memory:";

import { getDb } from "@/lib/db";
import { getRecentSearches, upsertSearchHistory } from "@/lib/searchHistory";

// ─── helpers ──────────────────────────────────────────────────────────────────

const globalForDb = globalThis as unknown as { _db: Database.Database | undefined };

function resetDb() {
  if (globalForDb._db) {
    globalForDb._db.close();
    globalForDb._db = undefined;
  }
}

// ─── setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  // Close the current in-memory connection; the next getDb() call creates a
  // fresh one with an empty schema — giving each test its own isolated DB.
  resetDb();
});

afterAll(() => {
  resetDb();
});

// ─── tests ────────────────────────────────────────────────────────────────────

describe("upsertSearchHistory", () => {
  it("inserts a new location and returns the full row", () => {
    const entry = upsertSearchHistory({
      name: "Kuala Lumpur",
      country: "Malaysia",
      longitude: 101.68653,
      latitude: 3.1412,
    });

    expect(entry.id).toBe(1);
    expect(entry.name).toBe("Kuala Lumpur");
    expect(entry.country).toBe("Malaysia");
    expect(entry.longitude).toBe(101.68653);
    expect(entry.latitude).toBe(3.1412);
    expect(typeof entry.last_searched_at).toBe("string");
    expect(entry.last_searched_at).not.toBe("");

    // Confirm the row is actually persisted
    const rows = getDb().prepare("SELECT * FROM search_history").all();
    expect(rows).toHaveLength(1);
  });

  it("upserts an existing location and updates last_searched_at without creating a duplicate", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-04-01T10:00:00.000Z"));
    const first = upsertSearchHistory({
      name: "Kuala Lumpur",
      country: "Malaysia",
      longitude: 101.68653,
      latitude: 3.1412,
    });

    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
    const second = upsertSearchHistory({
      name: "Kuala Lumpur",
      country: "Malaysia",
      longitude: 101.68653,
      latitude: 3.1412,
    });

    vi.useRealTimers();

    // Same row — id must not change
    expect(second.id).toBe(first.id);
    // Timestamp must be bumped
    expect(second.last_searched_at).toBe("2026-04-01T12:00:00.000Z");
    expect(second.last_searched_at).not.toBe(first.last_searched_at);
    // Still only one row in the table
    const rows = getDb().prepare("SELECT * FROM search_history").all();
    expect(rows).toHaveLength(1);
  });
});

describe("getRecentSearches", () => {
  it("returns entries ordered by last_searched_at descending and respects limit", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-04-01T08:00:00.000Z"));
    upsertSearchHistory({ name: "Tokyo", country: "Japan", longitude: 139.6917, latitude: 35.6895 });

    vi.setSystemTime(new Date("2026-04-01T10:00:00.000Z"));
    upsertSearchHistory({ name: "London", country: "United Kingdom", longitude: -0.1257, latitude: 51.5085 });

    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
    upsertSearchHistory({ name: "Kuala Lumpur", country: "Malaysia", longitude: 101.68653, latitude: 3.1412 });

    vi.useRealTimers();

    const all = getRecentSearches(10);
    expect(all).toHaveLength(3);
    expect(all[0].name).toBe("Kuala Lumpur");
    expect(all[1].name).toBe("London");
    expect(all[2].name).toBe("Tokyo");

    // limit is respected
    const top2 = getRecentSearches(2);
    expect(top2).toHaveLength(2);
    expect(top2[0].name).toBe("Kuala Lumpur");
    expect(top2[1].name).toBe("London");
  });
});
