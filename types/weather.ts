export interface CurrentWeatherUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  [key: string]: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  [key: string]: string | number;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentWeatherUnits;
  current: CurrentWeather;
}

export interface WeatherRequestParams {
  latitude: number;
  longitude: number;
  current?: string;
  timezone?: string;
}
