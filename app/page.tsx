"use client";

import { useEffect, useState } from "react";
import SearchInput from "@/components/SearchInput";
import type { GeocodingResult, GeocodingResponse } from "@/types/geocoding";
import type { WeatherResponse } from "@/types/weather";
import type { SearchHistoryEntry } from "@/types/searchHistory";

export default function Home() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearchResultsLoading, setIsSearchResultsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // ── Debounced geocoding search ─────────────────────────────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearchResultsLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsSearchResultsLoading(true);
      try {
        const res = await fetch(
          `/api/geocoding?name=${encodeURIComponent(query.trim())}&count=5`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data: GeocodingResponse = await res.json();
          setSearchResults(data.results ?? []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setSearchResults([]);
      } finally {
        setIsSearchResultsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // ── Load search history on mount ───────────────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/search-history?limit=5");
        if (res.ok) {
          const data: SearchHistoryEntry[] = await res.json();
          setSearchHistory(data);
        }
      } catch {
        setSearchHistory([]);
      } finally {
        setIsHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  // ── Handlers (wired up in later steps) ────────────────────────────────────
  void setSelectedLocation;
  void setWeather;

  const hasWeather = selectedLocation !== null && weather !== null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur px-6 py-4">
        <span className="text-2xl leading-none" aria-hidden="true">
          🌤
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Weather
        </span>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        className={`flex flex-1 flex-col items-center px-4 transition-all duration-300 ${
          hasWeather ? "justify-start pt-10" : "justify-center pb-16"
        }`}
      >
        {/* Hero text — hidden once a location is selected */}
        {!hasWeather && (
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              What&apos;s the weather like?
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              Search for any city or location to see current conditions.
            </p>
          </div>
        )}

        {/* Search bar */}
        <div className="w-full max-w-xl">
          <SearchInput
            query={query}
            onChange={setQuery}
            isFocused={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            searchResults={searchResults}
            isSearchResultsLoading={isSearchResultsLoading}
            searchHistory={searchHistory}
            isHistoryLoading={isHistoryLoading}
          />
        </div>

        {/* Weather card placeholder — populated in a later step */}
        {hasWeather && (
          <div className="mt-6 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            {/* WeatherCard will be rendered here */}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        Powered by{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
