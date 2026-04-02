"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import type { GeocodingResult } from "@/types/geocoding";
import type { WeatherResponse } from "@/types/weather";

export default function Home() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers (wired up in later steps) ────────────────────────────────────
  void setIsLoading;
  void setSelectedLocation;
  void setWeather;
  void setError;

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
            isLoading={isLoading}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-4 w-full max-w-xl rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

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
