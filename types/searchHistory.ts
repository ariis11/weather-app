export interface SearchHistoryEntry {
  id: number;
  name: string;
  country: string;
  longitude: number;
  latitude: number;
  last_searched_at: string; // ISO 8601
}

export interface UpsertSearchHistoryInput {
  name: string;
  country: string;
  longitude: number;
  latitude: number;
}
