import { NextRequest, NextResponse } from "next/server";
import type { GeocodingResponse } from "@/types/geocoding";

const GEOCODING_API_BASE = "https://geocoding-api.open-meteo.com/v1/search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter 'name' is required" },
      { status: 400 }
    );
  }

  const rawCount = searchParams.get("count") ?? "5";
  const count = Number(rawCount);

  if (!Number.isInteger(count) || count < 1) {
    return NextResponse.json(
      { error: "'count' must be a positive integer" },
      { status: 400 }
    );
  }

  const language = searchParams.get("language") ?? "en";

  const upstreamUrl = new URL(GEOCODING_API_BASE);
  upstreamUrl.searchParams.set("name", name.trim());
  upstreamUrl.searchParams.set("count", String(count));
  upstreamUrl.searchParams.set("language", language);
  upstreamUrl.searchParams.set("format", "json");
  try {
    const response = await fetch(upstreamUrl.toString(), {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch geocoding data" },
        { status: response.status }
      );
    }

    const data: GeocodingResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/geocoding]", error);
    return NextResponse.json(
      { error: "Failed to fetch geocoding data" },
      { status: 502 }
    );
  }
}
