import type { GeocodingResult } from "@/types/geocoding";

interface LocationItemProps {
  result: GeocodingResult;
  onSelect?: (result: GeocodingResult) => void;
}

export default function LocationItem({ result, onSelect }: LocationItemProps) {
  const subtitle = [result.admin1, result.country].filter(Boolean).join(", ");

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(result)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        {/* Map pin icon */}
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
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
            />
          </svg>
        </span>

        {/* Name + region / country */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {result.name}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}
