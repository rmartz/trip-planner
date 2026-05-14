import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/services/stop-destinations", () => ({
  getTripDestinations: vi.fn(),
}));

vi.mock("@/services/legs", () => ({
  getLegMemberRole: vi.fn(),
}));

import { getTripDestinations } from "@/services/stop-destinations";
import { getLegMemberRole } from "@/services/legs";
import { GET } from "./route";

function makeParams(tripId: string) {
  return { params: Promise.resolve({ tripId }) };
}

function makeGetRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/trips/trip-1/destinations", {
    headers,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/destinations", () => {
  it("returns 401 when uid header is absent", async () => {
    const req = makeGetRequest(undefined);
    const resp = await GET(req, makeParams("trip-1"));
    expect(resp.status).toBe(401);
  });

  it("returns 403 when caller is not a trip member", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(null);
    const req = makeGetRequest("user-1");
    const resp = await GET(req, makeParams("trip-1"));
    expect(resp.status).toBe(403);
    expect(getTripDestinations).not.toHaveBeenCalled();
  });

  it("returns trip destinations when caller is a Guest member", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getTripDestinations).mockResolvedValue([
      {
        destinationId: "dest-1",
        catalogUid: "user-1",
        name: "Paris",
        stopId: "stop-1",
        stopName: "London",
        tripId: "trip-1",
      },
    ]);
    const req = makeGetRequest("user-2");
    const resp = await GET(req, makeParams("trip-1"));
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data).toHaveLength(1);
  });

  it("returns trip destinations when caller is a Planner member", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripDestinations).mockResolvedValue([]);
    const req = makeGetRequest("user-1");
    const resp = await GET(req, makeParams("trip-1"));
    expect(resp.status).toBe(200);
    expect(getTripDestinations).toHaveBeenCalledWith("trip-1");
  });
});
