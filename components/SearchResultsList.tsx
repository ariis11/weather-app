import LocationItem from "@/components/LocationItem";
import type { GeocodingResult } from "@/types/geocoding";

interface SearchResultsListProps {
  results: GeocodingResult[];
  isLoading: boolean;
  onSelect?: (result: GeocodingResult) => void;
}

function ResultSkeletons() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </li>
      ))}
    </>
  );
}

export default function SearchResultsList({
  results,
  isLoading,
  onSelect,
}: SearchResultsListProps) {
  return (
    <ul role="listbox" aria-label="Location results">
      {isLoading ? (
        <ResultSkeletons />
      ) : results.length === 0 ? (
        <li className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
          No locations found
        </li>
      ) : (
        results.map((result) => (
          <LocationItem key={result.id} result={result} onSelect={onSelect} />
        ))
      )}
    </ul>
  );
}
