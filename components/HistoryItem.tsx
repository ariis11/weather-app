import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type { SearchHistoryEntry } from "@/types/searchHistory";

interface HistoryItemProps {
  entry: SearchHistoryEntry;
  onSelect?: (entry: SearchHistoryEntry) => void;
}

export default function HistoryItem({ entry, onSelect }: HistoryItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(entry)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        {/* Clock icon */}
        <span className="shrink-0 text-slate-300 dark:text-slate-600">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            />
          </svg>
        </span>

        {/* Name + country */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {entry.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {entry.country}
          </p>
        </div>

        {/* Relative time */}
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
          {formatRelativeTime(entry.last_searched_at)}
        </span>
      </button>
    </li>
  );
}
