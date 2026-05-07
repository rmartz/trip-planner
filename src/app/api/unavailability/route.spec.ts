import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/unavailable-ranges", () => ({
  getUnavailableRanges: vi.fn(),
  createUnavailableRange: vi.fn(),
}));

import {
  getUnavailableRanges,
  createUnavailableRange,
} from "@/services/unavailable-ranges";
import { GET, POST } from "./route";
import { proxy } from "@/proxy";

const START = "2025-07-01T00:00:00.000Z";
const END = "2025-07-07T00:00:00.000Z";

function makeRange(
  overrides: Partial<UnavailableRange> = {},
): UnavailableRange {
  return {
    rangeId: "range-1",
    uid: "uid-abc",
    startDate: new Date(START),
    endDate: new Date(END),
    ...overrides,
  };
}

function makeRequest(uid: string | undefined, body?: unknown): NextRequest {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  if (body !== undefined) {
    headers.set("content-type", "application/json");
    return new NextRequest("http://localhost/api/unavailability", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }
  return new NextRequest("http://localhost/api/unavailability", { headers });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/unavailability", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await GET(makeRequest(undefined));
    expect(response.status).toBe(401);
  });

  it("returns ranges serialized with ISO date strings for the verified uid", async () => {
    const range = makeRange();
    vi.mocked(getUnavailableRanges).mockResolvedValue([range]);

    const response = await GET(makeRequest("uid-abc"));
    expect(response.status).toBe(200);

    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(1);
    const item = data[0] as Record<string, unknown>;
    expect(item["startDate"]).toBe(START);
    expect(item["endDate"]).toBe(END);
  });

  it("calls getUnavailableRanges with the uid from x-user-id header", async () => {
    vi.mocked(getUnavailableRanges).mockResolvedValue([]);

    await GET(makeRequest("uid-xyz"));
    expect(vi.mocked(getUnavailableRanges)).toHaveBeenCalledWith("uid-xyz");
  });

  it("returns empty array when user has no ranges", async () => {
    vi.mocked(getUnavailableRanges).mockResolvedValue([]);

    const response = await GET(makeRequest("uid-abc"));
    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(0);
  });

  it("rejects forged x-user-id when no session cookie is present", async () => {
    const response = await proxy(makeRequest("uid-forged"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/sign-in?next=%2Fapi%2Funavailability",
    );
  });
});

describe("POST /api/unavailability", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await POST(
      makeRequest(undefined, { startDate: START, endDate: END }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 when startDate is missing", async () => {
    const response = await POST(makeRequest("uid-abc", { endDate: END }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when endDate is missing", async () => {
    const response = await POST(makeRequest("uid-abc", { startDate: START }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when startDate is after endDate", async () => {
    const response = await POST(
      makeRequest("uid-abc", { startDate: END, endDate: START }),
    );
    expect(response.status).toBe(400);
  });

  it("creates range and returns 201 with ISO date strings", async () => {
    const range = makeRange();
    vi.mocked(createUnavailableRange).mockResolvedValue(range);

    const response = await POST(
      makeRequest("uid-abc", { startDate: START, endDate: END }),
    );
    expect(response.status).toBe(201);

    const data = (await response.json()) as Record<string, unknown>;
    expect(data["startDate"]).toBe(START);
    expect(data["endDate"]).toBe(END);
  });

  it("calls createUnavailableRange with the uid from x-user-id header", async () => {
    const range = makeRange({ uid: "uid-xyz" });
    vi.mocked(createUnavailableRange).mockResolvedValue(range);

    await POST(makeRequest("uid-xyz", { startDate: START, endDate: END }));
    expect(vi.mocked(createUnavailableRange)).toHaveBeenCalledWith(
      "uid-xyz",
      expect.objectContaining({
        startDate: new Date(START),
        endDate: new Date(END),
      }),
    );
  });
});
