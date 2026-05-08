import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { Stop } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/stops", () => ({
  getStopsForTrip: vi.fn(),
  addStop: vi.fn(),
  getStopMemberRole: vi.fn(),
}));

import { getStopsForTrip, addStop, getStopMemberRole } from "@/services/stops";
import { GET, POST } from "./route";

const START = "2025-06-01T00:00:00.000Z";
const END = "2025-06-05T00:00:00.000Z";

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "London",
    startDate: new Date(START),
    endDate: new Date(END),
    order: 0,
    memberUids: ["uid-planner"],
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/stops`, {
    headers,
  });
}

function makePostRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/stops`, {
    method: "POST",
    headers,
    body: options.malformedJson ? "not-json" : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/stops", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns stops with ISO date strings and user role", async () => {
    vi.mocked(getStopMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getStopsForTrip).mockResolvedValue([makeStop()]);

    const request = makeGetRequest("uid-planner");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      stops: Record<string, unknown>[];
      role: string;
    };
    expect(data.role).toBe(TripRole.Planner);
    expect(data.stops).toHaveLength(1);
    expect(data.stops[0]!["startDate"]).toBe(START);
    expect(data.stops[0]!["endDate"]).toBe(END);
  });

  it("returns null role when user is not a member", async () => {
    vi.mocked(getStopMemberRole).mockResolvedValue(null);
    vi.mocked(getStopsForTrip).mockResolvedValue([]);

    const request = makeGetRequest("uid-stranger");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
    const data = (await response.json()) as { role: null };
    expect(data.role).toBeNull();
  });
});

describe("POST /api/trips/[tripId]/stops", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePostRequest(undefined, {
      name: "London",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const request = makePostRequest("uid-1", {}, "trip-1", {
      malformedJson: true,
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const request = makePostRequest("uid-1", {
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when end date is before start date", async () => {
    const request = makePostRequest("uid-1", {
      name: "London",
      startDate: "2025-06-10",
      endDate: "2025-06-01",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns stopId on success", async () => {
    vi.mocked(addStop).mockResolvedValue("stop-xyz");

    const request = makePostRequest("uid-1", {
      name: "London",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { stopId: string };
    expect(body.stopId).toBe("stop-xyz");
  });

  it("calls addStop with uid, tripId, name and parsed dates", async () => {
    vi.mocked(addStop).mockResolvedValue("stop-xyz");

    const request = makePostRequest("uid-1", {
      name: "London",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    await POST(request, { params: Promise.resolve({ tripId: "trip-1" }) });
    expect(vi.mocked(addStop)).toHaveBeenCalledWith(
      "uid-1",
      "trip-1",
      "London",
      new Date("2025-06-01"),
      new Date("2025-06-05"),
    );
  });
});
