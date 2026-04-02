import type { WeatherResponse } from "@/types/weather";
import { degreesToCompass, getWeatherCondition } from "@/utils/weatherFormat";

interface WeatherCardProps {
  location: {
    name: string;
    country: string;
    admin1?: string;
  };
  weather: WeatherResponse;
}

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetricTile({ icon, label, value }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

const DropIcon = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" />
  </svg>
);

const WindIcon = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

const CloudIcon = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const RainIcon = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10zM8 19v2M12 19v2M16 19v2" />
  </svg>
);

export default function WeatherCard({ location, weather }: WeatherCardProps) {
  const c = weather.current;
  const condition = getWeatherCondition(c.weather_code);
  const icon = c.is_day ? condition.dayIcon : condition.nightIcon;
  const subtitle = [location.admin1, location.country].filter(Boolean).join(", ");

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

      <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
          />
        </svg>
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {location.name}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 px-6 py-8">
        <span className="text-5xl leading-none" aria-hidden>{icon}</span>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {condition.label}
        </p>

        <div className="flex items-start gap-1 mt-3">
          <span className="text-7xl font-thin leading-none tracking-tighter text-slate-900 dark:text-slate-100">
            {c.temperature_2m.toFixed(1)}
          </span>
          <span className="mt-3 text-2xl font-light text-slate-700 dark:text-slate-300">
            {weather.current_units.temperature_2m}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Feels like{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {c.apparent_temperature.toFixed(1)}{weather.current_units.temperature_2m}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-6 pb-6">
        <MetricTile
          icon={DropIcon}
          label="Humidity"
          value={`${c.relative_humidity_2m}%`}
        />
        <MetricTile
          icon={WindIcon}
          label="Wind"
          value={`${c.wind_speed_10m} km/h ${degreesToCompass(c.wind_direction_10m)}`}
        />
        <MetricTile
          icon={RainIcon}
          label="Precipitation"
          value={`${c.precipitation} mm`}
        />
        <MetricTile
          icon={CloudIcon}
          label="Cloud cover"
          value={`${c.cloud_cover}%`}
        />
      </div>
    </div>
  );
}
