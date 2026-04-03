import { NextRequest, NextResponse } from "next/server";
import type { WeatherResponse } from "@/types/weather";

const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";

const DEFAULT_CURRENT_VARIABLES = "temperature_2m,weather_code,wind_speed_10m";

function parseCurrentVariables(rawCurrent: string): string | null {
  const variables = rawCurrent
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (variables.length === 0) return null;
  const areAllValid = variables.every((value) => /^[a-z0-9_]+$/i.test(value));
  if (!areAllValid) return null;

  return variables.join(",");
}

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

  const requestedCurrent = searchParams.get("current") ?? DEFAULT_CURRENT_VARIABLES;
  const current = parseCurrentVariables(requestedCurrent);
  if (!current) {
    return NextResponse.json(
      { error: "'current' must be a comma-separated list of weather variables" },
      { status: 400 }
    );
  }
  const timezone = searchParams.get("timezone") ?? "auto";

  const baseParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
  });
  const upstreamUrl = `${WEATHER_API_BASE}?${baseParams}&current=${current}`;

  try {
    const response = await fetch(upstreamUrl, {
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
  } catch (error) {
    console.error("[GET /api/weather]", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 502 }
    );
  }
}
