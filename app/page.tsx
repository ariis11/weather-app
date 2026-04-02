"use client";

import { useEffect, useState } from "react";
import SearchInput from "@/components/SearchInput";
import WeatherCard from "@/components/WeatherCard";
import type { GeocodingResult, GeocodingResponse } from "@/types/geocoding";
import type { WeatherResponse } from "@/types/weather";
import type { SearchHistoryEntry } from "@/types/searchHistory";

type SelectedLocation = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export default function Home() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearchResultsLoading, setIsSearchResultsLoading] = useState(false);
  const [searchResultsError, setSearchResultsError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // ── Debounced geocoding search ─────────────────────────────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearchResultsLoading(false);
      setSearchResultsError(null);
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
        if (!res.ok) {
          setSearchResults([]);
          setSearchResultsError("Could not load locations. Try again.");
          return;
        }

        const data: GeocodingResponse = await res.json();
        setSearchResults(data.results ?? []);
        setSearchResultsError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setSearchResults([]);
        setSearchResultsError("Could not load locations. Try again.");
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

  // ── Selection handler ─────────────────────────────────────────────────────
  async function handleSelectLocation(location: SelectedLocation) {
    setQuery(location.name);
    setIsFocused(false);
    setSelectedLocation(location);
    setWeather(null);
    setWeatherError(null);
    setIsWeatherLoading(true);

    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        timezone: "auto",
        current: [
          "temperature_2m",
          "apparent_temperature",
          "relative_humidity_2m",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "wind_speed_10m",
          "wind_direction_10m",
          "is_day",
        ].join(","),
      });

      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) {
        setWeatherError("Could not load weather data. Please try again.");
        return;
      }
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch {
      setWeatherError("Could not load weather data. Please try again.");
    } finally {
      setIsWeatherLoading(false);
    }

    fetch("/api/search-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const histRes = await fetch("/api/search-history?limit=5");
        if (histRes.ok) {
          const data: SearchHistoryEntry[] = await histRes.json();
          setSearchHistory(data);
        }
      })
      .catch(() => undefined);
  }

  const hasSelectedLocation = selectedLocation !== null;
  const hasWeather = weather !== null;

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
          hasSelectedLocation ? "justify-start pt-10" : "justify-center pb-16"
        }`}
      >
        {/* Hero text — hidden once a location is selected */}
        {!hasSelectedLocation && (
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
            searchResultsError={searchResultsError}
            onSelectResult={handleSelectLocation}
            searchHistory={searchHistory}
            isHistoryLoading={isHistoryLoading}
            onSelectHistoryItem={handleSelectLocation}
          />
        </div>

        {hasSelectedLocation && (
          <div className="mt-6 w-full max-w-xl">
            {isWeatherLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                Loading weather...
              </div>
            )}

            {weatherError && !isWeatherLoading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {weatherError}
              </div>
            )}

            {weather && !isWeatherLoading && !weatherError && (
              <WeatherCard location={selectedLocation} weather={weather} />
            )}
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
