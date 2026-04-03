"use client";

import { type RefObject } from "react";
import SearchHistoryList from "@/components/SearchHistoryList";
import SearchResultsList from "@/components/SearchResultsList";
import type { GeocodingResult } from "@/types/geocoding";
import type { SearchHistoryEntry } from "@/types/searchHistory";

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onChange: (value: string) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  searchResults: GeocodingResult[];
  isSearchResultsLoading: boolean;
  searchResultsError?: string | null;
  onSelectResult?: (result: GeocodingResult) => void;
  searchHistory: SearchHistoryEntry[];
  isHistoryLoading: boolean;
  onSelectHistoryItem?: (entry: SearchHistoryEntry) => void;
}

export default function SearchInput({
  inputRef,
  query,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  searchResults,
  isSearchResultsLoading,
  searchResultsError,
  onSelectResult,
  searchHistory,
  isHistoryLoading,
  onSelectHistoryItem,
}: SearchInputProps) {
  // Switch to results mode only when there are enough characters to search
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="relative w-full">
      {/* ── Input field ─────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white dark:bg-slate-900 px-4 shadow-sm transition-all duration-150
          ${
            isFocused
              ? "border-blue-500 ring-3 ring-blue-500/20 shadow-md"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
      >
        {/* Left icon — spinner while loading, magnifier otherwise */}
        <span className="shrink-0 text-slate-400">
          {isSearchResultsLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          )}
        </span>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search for a city or location…"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 py-3.5 bg-transparent text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
        />

        {/* Clear button — visible only when there is a query */}
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange("")}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Dropdown ─────────────────────────────────────────────── */}
      {isFocused && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
        >
          {hasQuery ? (
            /* Search results */
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
                <svg
                  className="h-3.5 w-3.5 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Results
                </span>
              </div>
              <SearchResultsList
                results={searchResults}
                isLoading={isSearchResultsLoading}
                errorMessage={searchResultsError}
                onSelect={onSelectResult}
              />
            </>
          ) : (
            /* Recent searches */
            <SearchHistoryList
              entries={searchHistory}
              isLoading={isHistoryLoading}
              onSelect={onSelectHistoryItem}
            />
          )}
        </div>
      )}
    </div>
  );
}
