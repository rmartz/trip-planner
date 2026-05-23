import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/services/activities", () => ({
  getActivitiesForTrip: vi.fn(),
}));
vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import { getActivitiesForTrip } from "@/services/activities";
import { getTripMemberRole } from "@/services/trips";
import { GET } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest(`http://localhost/api/trips/${tripId}/activities`, {
    headers,
  });
}

describe("GET /api/trips/[tripId]/activities", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const request = makeGetRequest("uid-stranger");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns activities payload for a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getActivitiesForTrip).mockResolvedValue([
      {
        activityId: "act-1",
        stopId: "stop-1",
        tripId: "trip-1",
        name: "Museum",
        estimatedDurationMinutes: 60,
      },
    ]);

    const request = makeGetRequest("uid-member");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      activities: { activityId: string }[];
    };
    expect(data.activities).toHaveLength(1);
    expect(data.activities[0]?.activityId).toBe("act-1");
  });
});
