import { NextRequest, NextResponse } from "next/server";
import type { WeatherResponse } from "@/types/weather";

const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";

const DEFAULT_CURRENT_VARIABLES = "temperature_2m,weathercode,windspeed_10m";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("latitude");
  const lon = searchParams.get("longitude");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Query parameters 'latitude' and 'longitude' are required" },
      { status: 400 }
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!isFinite(latitude) || !isFinite(longitude)) {
    return NextResponse.json(
      { error: "'latitude' and 'longitude' must be valid finite numbers" },
      { status: 400 }
    );
  }

  const current =
    searchParams.get("current") ?? DEFAULT_CURRENT_VARIABLES;
  const timezone = searchParams.get("timezone") ?? "auto";

  const upstreamUrl = new URL(WEATHER_API_BASE);
  upstreamUrl.searchParams.set("latitude", String(latitude));
  upstreamUrl.searchParams.set("longitude", String(longitude));
  upstreamUrl.searchParams.set("current", current);
  upstreamUrl.searchParams.set("timezone", timezone);

  const response = await fetch(upstreamUrl.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: response.status }
    );
  }

  const data: WeatherResponse = await response.json();

  return NextResponse.json(data);
}
