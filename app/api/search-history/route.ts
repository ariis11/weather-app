import { NextRequest, NextResponse } from "next/server";
import {
  getRecentSearches,
  upsertSearchHistory,
} from "@/lib/searchHistory";
import type { UpsertSearchHistoryInput } from "@/types/searchHistory";

// Required to opt out of static caching for this data-driven route
export const dynamic = "force-dynamic";

/**
 * Accepts a JSON number or a non-empty string that resolves to a finite number.
 * Rejects "", " ", "abc", "1.5dfdfd", Infinity, NaN.
 */
function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number") return isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return isFinite(n) ? n : null;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const rawLimit = request.nextUrl.searchParams.get("limit") ?? "5";
  const limit = Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1) {
    return NextResponse.json(
      { error: "'limit' must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const entries = getRecentSearches(limit);
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve search history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Partial<UpsertSearchHistoryInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, country, longitude, latitude } = body;

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof country !== "string" ||
    country.trim().length === 0 ||
    longitude == null ||
    latitude == null
  ) {
    return NextResponse.json(
      {
        error:
          "name (string), country (string), longitude (number) and latitude (number) are required",
      },
      { status: 400 }
    );
  }

  const lon = parseCoordinate(longitude);
  const lat = parseCoordinate(latitude);

  if (lon === null || lat === null) {
    return NextResponse.json(
      { error: "longitude and latitude must be valid finite numbers" },
      { status: 400 }
    );
  }

  try {
    const entry = upsertSearchHistory({
      name: name.trim(),
      country: country.trim(),
      longitude: lon as number,
      latitude: lat as number,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save search history" },
      { status: 500 }
    );
  }
}
