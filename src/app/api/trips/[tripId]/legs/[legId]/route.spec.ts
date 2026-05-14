import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { PlannerOnlyError } from "@/services/errors";

vi.mock("@/services/legs", () => ({
  updateLeg: vi.fn(),
}));

import { updateLeg } from "@/services/legs";
import { PATCH } from "./route";

function makePatchRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
  legId = "leg-1",
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/legs/${legId}`, {
    method: "PATCH",
    headers,
    body: options.malformedJson ? "not-json" : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/trips/[tripId]/legs/[legId]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePatchRequest(undefined, { fromStopId: "stop-3" });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const request = makePatchRequest("uid-1", {}, "trip-1", "leg-1", {
      malformedJson: true,
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 200 and calls updateLeg with fromStopId", async () => {
    vi.mocked(updateLeg).mockResolvedValue(undefined);

    const request = makePatchRequest("uid-1", { fromStopId: "stop-3" });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(200);
    expect(vi.mocked(updateLeg)).toHaveBeenCalledWith(
      "uid-1",
      "trip-1",
      "leg-1",
      {
        fromStopId: "stop-3",
      },
    );
  });

  it("returns 200 and calls updateLeg with toStopId", async () => {
    vi.mocked(updateLeg).mockResolvedValue(undefined);

    const request = makePatchRequest("uid-1", { toStopId: "stop-4" });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(200);
    expect(vi.mocked(updateLeg)).toHaveBeenCalledWith(
      "uid-1",
      "trip-1",
      "leg-1",
      {
        toStopId: "stop-4",
      },
    );
  });

  it("returns 403 when user is not a Planner", async () => {
    vi.mocked(updateLeg).mockRejectedValue(
      new PlannerOnlyError("Only Planners can edit legs"),
    );

    const request = makePatchRequest("uid-guest", { fromStopId: "stop-3" });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(updateLeg).mockRejectedValue(new Error("Database unavailable"));

    const request = makePatchRequest("uid-1", { fromStopId: "stop-3" });
    const response = await PATCH(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(500);
  });
});
