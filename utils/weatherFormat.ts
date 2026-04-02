export interface WeatherCondition {
  label: string;
  dayIcon: string;
  nightIcon: string;
}

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return { label: "Clear sky", dayIcon: "☀️", nightIcon: "🌙" };
  if (code === 1) return { label: "Mainly clear", dayIcon: "🌤️", nightIcon: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", dayIcon: "⛅", nightIcon: "⛅" };
  if (code === 3) return { label: "Overcast", dayIcon: "☁️", nightIcon: "☁️" };
  if (code <= 48) return { label: "Foggy", dayIcon: "🌫️", nightIcon: "🌫️" };
  if (code <= 57) return { label: "Drizzle", dayIcon: "🌦️", nightIcon: "🌦️" };
  if (code <= 67) return { label: "Rain", dayIcon: "🌧️", nightIcon: "🌧️" };
  if (code <= 77) return { label: "Snow", dayIcon: "❄️", nightIcon: "❄️" };
  if (code <= 82)
    return { label: "Rain showers", dayIcon: "🌦️", nightIcon: "🌦️" };
  if (code <= 86)
    return { label: "Snow showers", dayIcon: "🌨️", nightIcon: "🌨️" };
  if (code === 95)
    return { label: "Thunderstorm", dayIcon: "⛈️", nightIcon: "⛈️" };
  return { label: "Thunderstorm", dayIcon: "⛈️", nightIcon: "⛈️" };
}

export function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
