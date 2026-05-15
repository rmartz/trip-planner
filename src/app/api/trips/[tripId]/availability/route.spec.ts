import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { PlannerOnlyError } from "@/services/errors";
import { TripRole } from "@/lib/types/trip";
import type { TripAvailability } from "@/lib/types/trip-availability";

vi.mock("@/services/trip-availability", () => ({
  getTripAvailability: vi.fn(),
  setMyTripAvailability: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import {
  getTripAvailability,
  setMyTripAvailability,
} from "@/services/trip-availability";
import { getTripMemberRole } from "@/services/trips";
import { GET, PUT } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

const ROUTE_CONTEXT = { params: Promise.resolve({ tripId: "trip-1" }) };

function makeGetRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/trips/trip-1/availability", {
    headers,
  });
}

function makePutRequest(uid: string | undefined, body: unknown) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  headers.set("content-type", "application/json");
  return new NextRequest("http://localhost/api/trips/trip-1/availability", {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

function makeMalformedPutRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  headers.set("content-type", "application/json");
  return new NextRequest("http://localhost/api/trips/trip-1/availability", {
    method: "PUT",
    headers,
    body: "not-json{{",
  });
}

function makeAvailability(
  overrides: Partial<TripAvailability> = {},
): TripAvailability {
  return {
    uid: "uid-1",
    tripId: "trip-1",
    availableDates: ["2025-06-10", "2025-06-11"],
    ...overrides,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe("GET /api/trips/[tripId]/availability — unauthenticated", () => {
  it("returns 401 when uid header is absent", async () => {
    const response = await GET(makeGetRequest(undefined), ROUTE_CONTEXT);
    expect(response.status).toBe(401);
  });
});

describe("GET /api/trips/[tripId]/availability — authorization", () => {
  it("returns 403 when user is not a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const response = await GET(makeGetRequest("uid-non-member"), ROUTE_CONTEXT);
    expect(response.status).toBe(403);
  });

  it("calls getTripMemberRole with the tripId and uid", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripAvailability).mockResolvedValue([]);

    await GET(makeGetRequest("uid-1"), ROUTE_CONTEXT);
    expect(vi.mocked(getTripMemberRole)).toHaveBeenCalledWith(
      "trip-1",
      "uid-1",
    );
  });
});

describe("GET /api/trips/[tripId]/availability — success", () => {
  it("returns 200 with availability array", async () => {
    const availability = [makeAvailability()];
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripAvailability).mockResolvedValue(availability);

    const response = await GET(makeGetRequest("uid-1"), ROUTE_CONTEXT);
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body["availability"]).toEqual(availability);
  });

  it("calls getTripAvailability with the tripId", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getTripAvailability).mockResolvedValue([]);

    await GET(makeGetRequest("uid-1"), ROUTE_CONTEXT);
    expect(vi.mocked(getTripAvailability)).toHaveBeenCalledWith("trip-1");
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe("PUT /api/trips/[tripId]/availability — unauthenticated", () => {
  it("returns 401 when uid header is absent", async () => {
    const response = await PUT(
      makePutRequest(undefined, { availableDates: ["2025-06-10"] }),
      ROUTE_CONTEXT,
    );
    expect(response.status).toBe(401);
  });
});

describe("PUT /api/trips/[tripId]/availability — validation", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const response = await PUT(makeMalformedPutRequest("uid-1"), ROUTE_CONTEXT);
    expect(response.status).toBe(400);
  });

  it("returns 400 when availableDates is missing", async () => {
    const response = await PUT(makePutRequest("uid-1", {}), ROUTE_CONTEXT);
    expect(response.status).toBe(400);
  });

  it("returns 400 when availableDates is not an array", async () => {
    const response = await PUT(
      makePutRequest("uid-1", { availableDates: "2025-06-10" }),
      ROUTE_CONTEXT,
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when availableDates contains non-string elements", async () => {
    const response = await PUT(
      makePutRequest("uid-1", { availableDates: [1, 2, 3] }),
      ROUTE_CONTEXT,
    );
    expect(response.status).toBe(400);
  });
});

describe("PUT /api/trips/[tripId]/availability — authorization", () => {
  it("returns 403 when caller is not a Planner", async () => {
    vi.mocked(setMyTripAvailability).mockRejectedValue(
      new PlannerOnlyError("Only Planners can set availability for a trip"),
    );

    const response = await PUT(
      makePutRequest("uid-guest", { availableDates: ["2025-06-10"] }),
      ROUTE_CONTEXT,
    );
    expect(response.status).toBe(403);
  });
});

describe("PUT /api/trips/[tripId]/availability — success", () => {
  it("returns 200 with ok:true on valid input", async () => {
    vi.mocked(setMyTripAvailability).mockResolvedValue(undefined);

    const response = await PUT(
      makePutRequest("uid-1", { availableDates: ["2025-06-10", "2025-06-11"] }),
      ROUTE_CONTEXT,
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body["ok"]).toBe(true);
  });

  it("calls setMyTripAvailability with uid, tripId, and dates", async () => {
    vi.mocked(setMyTripAvailability).mockResolvedValue(undefined);

    await PUT(
      makePutRequest("uid-1", { availableDates: ["2025-06-10", "2025-06-11"] }),
      ROUTE_CONTEXT,
    );
    expect(vi.mocked(setMyTripAvailability)).toHaveBeenCalledWith(
      "uid-1",
      "trip-1",
      ["2025-06-10", "2025-06-11"],
    );
  });
});
