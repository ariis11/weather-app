import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/geocoding/route";

const GEOCODING_API_BASE = "https://geocoding-api.open-meteo.com/v1/search";

const MOCK_GEOCODING_RESPONSE = {
  results: [
    {
      id: 1735161,
      name: "Kuala Lumpur",
      latitude: 3.1412,
      longitude: 101.68653,
      elevation: 56.0,
      feature_code: "PPLC",
      country_code: "MY",
      admin1_id: 1733046,
      admin2_id: 12231269,
      timezone: "Asia/Kuala_Lumpur",
      population: 1453975,
      country_id: 1733045,
      country: "Malaysia",
      admin1: "Kuala Lumpur",
      admin2: "WP. Kuala Lumpur",
    },
  ],
  generationtime_ms: 0.7557869,
};

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("GET /api/geocoding", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  describe("validation", () => {
    it("returns 400 when the name param is missing", async () => {
      const req = makeRequest("/api/geocoding");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Query parameter 'name' is required");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when name is an empty string", async () => {
      const req = makeRequest("/api/geocoding?name=");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Query parameter 'name' is required");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns 400 when name contains only whitespace", async () => {
      const req = makeRequest("/api/geocoding?name=%20%20%20");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Query parameter 'name' is required");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("default parameter values", () => {
    it("uses count=5 and language=en when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_GEOCODING_RESPONSE,
      } as Response);

      const req = makeRequest("/api/geocoding?name=London");
      await GET(req);

      expect(mockFetch).toHaveBeenCalledOnce();
      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.origin + calledUrl.pathname).toBe(GEOCODING_API_BASE);
      expect(calledUrl.searchParams.get("count")).toBe("5");
      expect(calledUrl.searchParams.get("language")).toBe("en");
      expect(calledUrl.searchParams.get("format")).toBe("json");
    });

    it("forwards custom count and language when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_GEOCODING_RESPONSE,
      } as Response);

      const req = makeRequest("/api/geocoding?name=Paris&count=10&language=fr");
      await GET(req);

      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get("count")).toBe("10");
      expect(calledUrl.searchParams.get("language")).toBe("fr");
    });
  });

  describe("success response", () => {
    it("returns 200 with geocoding data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_GEOCODING_RESPONSE,
      } as Response);

      const req = makeRequest("/api/geocoding?name=Kuala+Lumpur");
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.results).toHaveLength(1);
      expect(data.results[0].name).toBe("Kuala Lumpur");
      expect(data.results[0].latitude).toBe(3.1412);
      expect(data.results[0].country).toBe("Malaysia");
      expect(data.generationtime_ms).toBe(0.7557869);
    });

    it("trims whitespace from the name before sending upstream", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_GEOCODING_RESPONSE,
      } as Response);

      const req = makeRequest("/api/geocoding?name=%20London%20");
      await GET(req);

      const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get("name")).toBe("London");
    });
  });

  describe("error handling", () => {
    it("returns the upstream status code on a non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response);

      const req = makeRequest("/api/geocoding?name=London");
      const response = await GET(req);

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe("Failed to fetch geocoding data");
    });

    it("propagates a 429 upstream rate-limit as-is", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      const req = makeRequest("/api/geocoding?name=Berlin");
      const response = await GET(req);

      expect(response.status).toBe(429);
    });
  });
});
