import { getDb } from "./db";
import type {
  SearchHistoryEntry,
  UpsertSearchHistoryInput,
} from "@/types/searchHistory";

/**
 * Insert a new location or bump its last_searched_at timestamp if it already exists.
 * Uniqueness is determined by the (name, country, longitude, latitude) combination.
 */
export function upsertSearchHistory(
  entry: UpsertSearchHistoryInput
): SearchHistoryEntry {
  const db = getDb();
  const now = new Date().toISOString();

  const row = db
    .prepare<UpsertSearchHistoryInput & { last_searched_at: string }>(
      `
      INSERT INTO search_history (name, country, longitude, latitude, last_searched_at)
      VALUES (@name, @country, @longitude, @latitude, @last_searched_at)
      ON CONFLICT(name, country, longitude, latitude)
      DO UPDATE SET last_searched_at = excluded.last_searched_at
      RETURNING *
    `
    )
    .get({ ...entry, last_searched_at: now });

  return row as SearchHistoryEntry;
}

/**
 * Return the most recently searched locations ordered by last_searched_at descending.
 */
export function getRecentSearches(limit: number = 5): SearchHistoryEntry[] {
  const db = getDb();

  const rows = db
    .prepare<[number]>(
      `
      SELECT id, name, country, longitude, latitude, last_searched_at
      FROM search_history
      ORDER BY last_searched_at DESC
      LIMIT ?
    `
    )
    .all(limit);

  return rows as SearchHistoryEntry[];
}
