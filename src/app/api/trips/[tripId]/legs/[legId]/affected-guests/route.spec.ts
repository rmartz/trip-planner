import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/services/legs", () => ({
  getAffectedGuestsForLeg: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import { getAffectedGuestsForLeg } from "@/services/legs";
import { getTripMemberRole } from "@/services/trips";
import { GET } from "./route";

function makeGetRequest(
  uid: string | undefined,
  tripId = "trip-1",
  legId = "leg-1",
) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    `http://localhost/api/trips/${tripId}/legs/${legId}/affected-guests`,
    { method: "GET", headers },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/legs/[legId]/affected-guests", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a Planner", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);

    const request = makeGetRequest("uid-guest");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 200 with affected guest uids", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getAffectedGuestsForLeg).mockResolvedValue(["uid-a", "uid-b"]);

    const request = makeGetRequest("uid-planner");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { affectedGuestUids: string[] };
    expect(body.affectedGuestUids).toEqual(["uid-a", "uid-b"]);
  });

  it("returns 200 with empty array when no guests are affected", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getAffectedGuestsForLeg).mockResolvedValue([]);

    const request = makeGetRequest("uid-planner");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { affectedGuestUids: string[] };
    expect(body.affectedGuestUids).toEqual([]);
  });
});
