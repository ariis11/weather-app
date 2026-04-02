import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/weather/route";

const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_CURRENT_VARIABLES = "temperature_2m,weathercode,windspeed_10m";

const MOCK_WEATHER_RESPONSE = {
  latitude: 3.125,
  longitude: 101.625,
  generationtime_ms: 0.025153160095214844,
  utc_offset_seconds: 28800,
  timezone: "Asia/Kuala_Lumpur",
  timezone_abbreviation: "MYT",
  elevation: 47.0,
  current_units: {
    time: "iso8601",
    interval: "seconds",
    temperature_2m: "°C",
    weathercode: "wmo code",
    windspeed_10m: "km/h",
  },
  current: {
    time: "2026-04-01T17:30",
    interval: 900,
    temperature_2m: 25.7,
    weathercode: 3,
    windspeed_10m: 12.5,
  },
};

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("GET /api/weather", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  describe("validation", () => {
    it("returns 400 when both latitude and longitude are missing", async () => {
      const req = makeRequest("/api/weather");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe(
        "Query parameters 'latitude' and 'longitude' are required"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is missing", async () => {
      const req = makeRequest("/api/weather?longitude=101.68653");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe(
        "Query parameters 'latitude' and 'longitude' are required"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when longitude is missing", async () => {
      const req = makeRequest("/api/weather?latitude=3.1412");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe(
        "Query parameters 'latitude' and 'longitude' are required"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is not a valid number", async () => {
      const req = makeRequest("/api/weather?latitude=abc&longitude=101.68653");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe(
        "'latitude' and 'longitude' must be valid numbers"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when longitude is not a valid number", async () => {
      const req = makeRequest("/api/weather?latitude=3.1412&longitude=not-a-number");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe(
        "'latitude' and 'longitude' must be valid numbers"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("default parameter values", () => {
    it("uses default current variables and timezone=auto when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_WEATHER_RESPONSE,
      } as Response);

      const req = makeRequest("/api/weather?latitude=3.1412&longitude=101.68653");
      await GET(req);

      expect(mockFetch).toHaveBeenCalledOnce();
      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.origin + calledUrl.pathname).toBe(WEATHER_API_BASE);
      expect(calledUrl.searchParams.get("current")).toBe(
        DEFAULT_CURRENT_VARIABLES
      );
      expect(calledUrl.searchParams.get("timezone")).toBe("auto");
    });

    it("forwards custom current and timezone when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_WEATHER_RESPONSE,
      } as Response);

      const req = makeRequest(
        "/api/weather?latitude=3.1412&longitude=101.68653&current=temperature_2m&timezone=Asia%2FKuala_Lumpur"
      );
      await GET(req);

      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get("current")).toBe("temperature_2m");
      expect(calledUrl.searchParams.get("timezone")).toBe("Asia/Kuala_Lumpur");
    });
  });

  describe("success response", () => {
    it("returns 200 with weather data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_WEATHER_RESPONSE,
      } as Response);

      const req = makeRequest("/api/weather?latitude=3.1412&longitude=101.68653");
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.latitude).toBe(3.125);
      expect(data.longitude).toBe(101.625);
      expect(data.current.temperature_2m).toBe(25.7);
      expect(data.current.weathercode).toBe(3);
      expect(data.current_units.temperature_2m).toBe("°C");
    });

    it("passes parsed coordinates as numbers to the upstream URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_WEATHER_RESPONSE,
      } as Response);

      const req = makeRequest("/api/weather?latitude=3.1412&longitude=101.68653");
      await GET(req);

      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get("latitude")).toBe("3.1412");
      expect(calledUrl.searchParams.get("longitude")).toBe("101.68653");
    });
  });

  describe("error handling", () => {
    it("returns the upstream status code on a non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response);

      const req = makeRequest("/api/weather?latitude=3.1412&longitude=101.68653");
      const response = await GET(req);

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe("Failed to fetch weather data");
    });

    it("propagates a 429 upstream rate-limit as-is", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      const req = makeRequest("/api/weather?latitude=3.1412&longitude=101.68653");
      const response = await GET(req);

      expect(response.status).toBe(429);
    });
  });
});
