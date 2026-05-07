import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { Trip } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/trips", () => ({
  getTripsForUser: vi.fn(),
}));

import { getTripsForUser } from "@/services/trips";
import { GET } from "./route";
import { middleware } from "@/middleware";

const START = "2025-06-01T00:00:00.000Z";
const END = "2025-06-08T00:00:00.000Z";
const CREATED_AT = "2025-01-15T12:00:00.000Z";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date(START),
    endDate: new Date(END),
    createdAt: new Date(CREATED_AT),
    createdBy: "uid-abc",
    memberUids: ["uid-abc"],
    ...overrides,
  };
}

function makeRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest("http://localhost/api/trips", { headers });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeRequest(undefined);
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns trips serialized with ISO date strings for the verified uid", async () => {
    const trip = makeTrip();
    vi.mocked(getTripsForUser).mockResolvedValue([trip]);

    const request = makeRequest("uid-abc");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(1);
    const item = data[0] as Record<string, unknown>;
    expect(item["startDate"]).toBe(START);
    expect(item["endDate"]).toBe(END);
    expect(item["createdAt"]).toBe(CREATED_AT);
  });

  it("calls getTripsForUser with the uid from x-user-id header", async () => {
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    const request = makeRequest("uid-xyz");
    await GET(request);
    expect(vi.mocked(getTripsForUser)).toHaveBeenCalledWith("uid-xyz");
  });

  it("returns empty array when user has no trips", async () => {
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    const request = makeRequest("uid-abc");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(0);
  });

  it("rejects forged x-user-id when no session cookie is present", async () => {
    // Trust boundary note: route.ts trusts x-user-id only after middleware auth.
    const response = await middleware(makeRequest("uid-forged"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/sign-in?next=%2Fapi%2Ftrips",
    );
  });
});
