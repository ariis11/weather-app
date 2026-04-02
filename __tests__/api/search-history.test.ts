import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/searchHistory", () => ({
  upsertSearchHistory: vi.fn(),
  getRecentSearches: vi.fn(),
}));

import { GET, POST } from "@/app/api/search-history/route";
import {
  getRecentSearches,
  upsertSearchHistory,
} from "@/lib/searchHistory";

// ─── fixtures ─────────────────────────────────────────────────────────────────

const ENTRY_1 = {
  id: 1,
  name: "Kuala Lumpur",
  country: "Malaysia",
  longitude: 101.68653,
  latitude: 3.1412,
  last_searched_at: "2026-04-01T10:00:00.000Z",
};

const ENTRY_2 = {
  id: 2,
  name: "London",
  country: "United Kingdom",
  longitude: -0.12574,
  latitude: 51.50853,
  last_searched_at: "2026-04-01T12:00:00.000Z",
};

// Most-recent first (the order the DB helper returns)
const SORTED_ENTRIES = [ENTRY_2, ENTRY_1];

function makeGetRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/search-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── GET /api/search-history ──────────────────────────────────────────────────

describe("GET /api/search-history", () => {
  beforeEach(() => {
    vi.mocked(getRecentSearches).mockReturnValue(SORTED_ENTRIES);
  });

  describe("validation", () => {
    it("returns 400 when limit is not a number", async () => {
      const req = makeGetRequest("/api/search-history?limit=abc");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("'limit' must be a positive integer");
      expect(getRecentSearches).not.toHaveBeenCalled();
    });

    it("returns 400 when limit is zero", async () => {
      const req = makeGetRequest("/api/search-history?limit=0");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("'limit' must be a positive integer");
      expect(getRecentSearches).not.toHaveBeenCalled();
    });

    it("returns 400 when limit is negative", async () => {
      const req = makeGetRequest("/api/search-history?limit=-3");
      const response = await GET(req);

      expect(response.status).toBe(400);
      expect(getRecentSearches).not.toHaveBeenCalled();
    });

    it("returns 400 for a mixed string like '1.5dfdfd' (parseInt would silently return 1)", async () => {
      const req = makeGetRequest("/api/search-history?limit=1.5dfdfd");
      const response = await GET(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("'limit' must be a positive integer");
      expect(getRecentSearches).not.toHaveBeenCalled();
    });

    it("returns 400 for a float like '2.5'", async () => {
      const req = makeGetRequest("/api/search-history?limit=2.5");
      const response = await GET(req);

      expect(response.status).toBe(400);
      expect(getRecentSearches).not.toHaveBeenCalled();
    });
  });

  describe("default behaviour", () => {
    it("uses the default limit of 5 when limit is omitted", async () => {
      const req = makeGetRequest("/api/search-history");
      await GET(req);

      expect(getRecentSearches).toHaveBeenCalledOnce();
      expect(getRecentSearches).toHaveBeenCalledWith(5);
    });

    it("forwards a custom limit to getRecentSearches", async () => {
      const req = makeGetRequest("/api/search-history?limit=20");
      await GET(req);

      expect(getRecentSearches).toHaveBeenCalledWith(20);
    });
  });

  describe("success response", () => {
    it("returns 200 with entries sorted by last_searched_at descending", async () => {
      const req = makeGetRequest("/api/search-history?limit=5");
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(2);
      // most-recent entry comes first
      expect(data[0].name).toBe("London");
      expect(data[1].name).toBe("Kuala Lumpur");
      expect(data[0].last_searched_at > data[1].last_searched_at).toBe(true);
    });
  });

  describe("error handling", () => {
    it("returns 500 when getRecentSearches throws", async () => {
      vi.mocked(getRecentSearches).mockImplementationOnce(() => {
        throw new Error("DB locked");
      });

      const req = makeGetRequest("/api/search-history?limit=5");
      const response = await GET(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to retrieve search history");
    });
  });
});

// ─── POST /api/search-history ─────────────────────────────────────────────────

describe("POST /api/search-history", () => {
  beforeEach(() => {
    vi.mocked(upsertSearchHistory).mockReturnValue(ENTRY_1);
  });

  describe("validation – missing parameters", () => {
    it("returns 400 when name is missing", async () => {
      const req = makePostRequest({
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when name is an empty string", async () => {
      const req = makePostRequest({
        name: "   ",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when country is missing", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when longitude is missing", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is missing", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when the body is not valid JSON", async () => {
      const req = new NextRequest("http://localhost/api/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid JSON body");
    });
  });

  describe("parseCoordinate – full branch coverage", () => {
    const COORD_ERROR = "longitude and latitude must be valid finite numbers";

    // Branch: typeof value === "number" && isFinite → accepted (positive path)
    it("accepts numeric longitude and latitude (JSON numbers)", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    // Branch: typeof value === "number" && !isFinite → null
    // JSON numbers exceeding Number.MAX_VALUE are parsed as Infinity by V8
    it("returns 400 when longitude is Infinity (overflowing JSON number 1e309)", async () => {
      const req = new NextRequest("http://localhost/api/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"name":"Kuala Lumpur","country":"Malaysia","longitude":1e309,"latitude":3.1412}',
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is Infinity (overflowing JSON number 1e309)", async () => {
      const req = new NextRequest("http://localhost/api/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"name":"Kuala Lumpur","country":"Malaysia","longitude":101.68653,"latitude":1e309}',
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    // Branch: typeof value === "string" && trimmed !== "" && isFinite(n) → accepted
    it("accepts longitude and latitude sent as numeric strings", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: "101.68653",
        latitude: "3.1412",
      });
      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    // Branch: typeof value === "string" && isFinite(n) === false → null
    it("returns 400 when longitude is a string with trailing non-numeric characters (e.g. '101.68abc')", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: "101.68abc",
        latitude: 3.1412,
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    // Branch: typeof value is neither "number" nor "string" → null
    it("returns 400 when longitude is a boolean", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: true,
        latitude: 3.1412,
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is a boolean", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: false,
      });
      const response = await POST(req);
      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });
  });

  describe("validation – invalid parameters", () => {
    const COORD_ERROR = "longitude and latitude must be valid finite numbers";

    it("returns 400 when longitude is a non-numeric string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: "not-a-number",
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is a non-numeric string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: "not-a-number",
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when longitude is an empty string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: "",
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is an empty string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: "",
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when longitude is a whitespace-only string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: "   ",
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });

    it("returns 400 when latitude is a whitespace-only string", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: "   ",
      });
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect((await response.json()).error).toBe(COORD_ERROR);
      expect(upsertSearchHistory).not.toHaveBeenCalled();
    });
  });

  describe("success response", () => {
    it("returns 201 with the inserted entry", async () => {
      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe(1);
      expect(data.name).toBe("Kuala Lumpur");
      expect(data.country).toBe("Malaysia");
      expect(data.longitude).toBe(101.68653);
      expect(data.latitude).toBe(3.1412);
    });

    it("trims whitespace from name and country before calling upsert", async () => {
      const req = makePostRequest({
        name: "  Kuala Lumpur  ",
        country: "  Malaysia  ",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      await POST(req);

      expect(upsertSearchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Kuala Lumpur", country: "Malaysia" })
      );
    });

    it("updates last_searched_at when the same location is searched again", async () => {
      const updatedEntry = {
        ...ENTRY_1,
        last_searched_at: "2026-04-02T09:00:00.000Z",
      };
      vi.mocked(upsertSearchHistory).mockReturnValueOnce(updatedEntry);

      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.last_searched_at).toBe("2026-04-02T09:00:00.000Z");
      // same unique key is passed — upsert handles the conflict
      expect(upsertSearchHistory).toHaveBeenCalledWith({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
    });
  });

  describe("error handling", () => {
    it("returns 500 when upsertSearchHistory throws", async () => {
      vi.mocked(upsertSearchHistory).mockImplementationOnce(() => {
        throw new Error("DB write failed");
      });

      const req = makePostRequest({
        name: "Kuala Lumpur",
        country: "Malaysia",
        longitude: 101.68653,
        latitude: 3.1412,
      });
      const response = await POST(req);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to save search history");
    });
  });
});
