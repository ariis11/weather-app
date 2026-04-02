import HistoryItem from "@/components/HistoryItem";
import type { SearchHistoryEntry } from "@/types/searchHistory";

interface SearchHistoryListProps {
  entries: SearchHistoryEntry[];
  isLoading: boolean;
  onSelect?: (entry: SearchHistoryEntry) => void;
}

function HistorySkeletons() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </li>
      ))}
    </>
  );
}

export default function SearchHistoryList({
  entries,
  isLoading,
  onSelect,
}: SearchHistoryListProps) {
  return (
    <>
      {/* Section header */}
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
            d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Recent searches
        </span>
      </div>

      {/* Items */}
      <ul role="listbox" aria-label="Recent searches">
        {isLoading ? (
          <HistorySkeletons />
        ) : entries.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No recent searches yet
          </li>
        ) : (
          entries.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onSelect={onSelect} />
          ))
        )}
      </ul>
    </>
  );
}
