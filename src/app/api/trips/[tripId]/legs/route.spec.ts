import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { Leg } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/legs", () => ({
  getLegsForTrip: vi.fn(),
  addLeg: vi.fn(),
  getLegMemberRole: vi.fn(),
}));

import { getLegsForTrip, addLeg, getLegMemberRole } from "@/services/legs";
import { GET, POST } from "./route";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: ["uid-planner"],
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/legs`, {
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
  return new NextRequest(`http://localhost/api/trips/${tripId}/legs`, {
    method: "POST",
    headers,
    body: options.malformedJson ? "not-json" : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/legs", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns legs and user role", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getLegsForTrip).mockResolvedValue([makeLeg()]);

    const request = makeGetRequest("uid-planner");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      legs: Record<string, unknown>[];
      role: string;
    };
    expect(data.role).toBe(TripRole.Planner);
    expect(data.legs).toHaveLength(1);
    expect(data.legs[0]!["fromStopId"]).toBe("stop-1");
    expect(data.legs[0]!["toStopId"]).toBe("stop-2");
  });

  it("returns null role when user is not a member", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(null);
    vi.mocked(getLegsForTrip).mockResolvedValue([]);

    const request = makeGetRequest("uid-stranger");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
    const data = (await response.json()) as { role: null };
    expect(data.role).toBeNull();
  });

  it("calls getLegMemberRole and getLegsForTrip with correct tripId", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getLegsForTrip).mockResolvedValue([]);

    const request = makeGetRequest("uid-1", "trip-abc");
    await GET(request, { params: Promise.resolve({ tripId: "trip-abc" }) });

    expect(vi.mocked(getLegMemberRole)).toHaveBeenCalledWith(
      "uid-1",
      "trip-abc",
    );
    expect(vi.mocked(getLegsForTrip)).toHaveBeenCalledWith("trip-abc");
  });
});

describe("POST /api/trips/[tripId]/legs", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePostRequest(undefined, {
      fromStopId: "stop-1",
      toStopId: "stop-2",
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

  it("returns 400 when fromStopId is missing", async () => {
    const request = makePostRequest("uid-1", { toStopId: "stop-2" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when toStopId is missing", async () => {
    const request = makePostRequest("uid-1", { fromStopId: "stop-1" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when fromStopId equals toStopId", async () => {
    const request = makePostRequest("uid-1", {
      fromStopId: "stop-1",
      toStopId: "stop-1",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const request = makePostRequest("uid-1", {
      fromStopId: "stop-1",
      toStopId: "stop-2",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns legId on success", async () => {
    vi.mocked(addLeg).mockResolvedValue("leg-xyz");

    const request = makePostRequest("uid-1", {
      fromStopId: "stop-1",
      toStopId: "stop-2",
      name: "London to Paris",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { legId: string };
    expect(body.legId).toBe("leg-xyz");
  });

  it("calls addLeg with uid, tripId, fromStopId, toStopId, and name", async () => {
    vi.mocked(addLeg).mockResolvedValue("leg-xyz");

    const request = makePostRequest("uid-1", {
      fromStopId: "stop-1",
      toStopId: "stop-2",
      name: "London to Paris",
    });
    await POST(request, { params: Promise.resolve({ tripId: "trip-1" }) });
    expect(vi.mocked(addLeg)).toHaveBeenCalledWith(
      "uid-1",
      "trip-1",
      "stop-1",
      "stop-2",
      "London to Paris",
      undefined,
    );
  });
});
