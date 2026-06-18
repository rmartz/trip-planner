import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { PlannerOnlyError } from "@/services/errors";

vi.mock("@/services/legs", () => ({
  getLegById: vi.fn(),
  softDeleteLeg: vi.fn(),
  updateLeg: vi.fn(),
  writeNotificationsForLegDeletion: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  recomputeTransportGapCount: vi.fn(() => Promise.resolve()),
}));

import {
  getLegById,
  softDeleteLeg,
  writeNotificationsForLegDeletion,
} from "@/services/legs";
import { recomputeTransportGapCount } from "@/services/trips";
import { DELETE } from "./route";

function makeDeleteRequest(
  uid: string | undefined,
  tripId = "trip-1",
  legId = "leg-1",
) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/legs/${legId}`, {
    method: "DELETE",
    headers,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/trips/[tripId]/legs/[legId]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeDeleteRequest(undefined);
    const response = await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 200 and calls softDeleteLeg", async () => {
    vi.mocked(getLegById).mockResolvedValue({
      legId: "leg-1",
      tripId: "trip-1",
      name: "Lyon → Marseille",
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 0,
      memberUids: [],
      isActive: true,
    });
    vi.mocked(softDeleteLeg).mockResolvedValue(undefined);
    vi.mocked(writeNotificationsForLegDeletion).mockResolvedValue(undefined);

    const request = makeDeleteRequest("uid-planner");
    const response = await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(200);
    expect(vi.mocked(softDeleteLeg)).toHaveBeenCalledWith(
      "uid-planner",
      "trip-1",
      "leg-1",
    );
  });

  it("calls recomputeTransportGapCount with the tripId on success", async () => {
    vi.mocked(getLegById).mockResolvedValue({
      legId: "leg-1",
      tripId: "trip-1",
      name: "Lyon → Marseille",
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 0,
      memberUids: [],
      isActive: true,
    });
    vi.mocked(softDeleteLeg).mockResolvedValue(undefined);
    vi.mocked(writeNotificationsForLegDeletion).mockResolvedValue(undefined);

    const request = makeDeleteRequest("uid-planner");
    await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });

    expect(vi.mocked(recomputeTransportGapCount)).toHaveBeenCalledWith(
      "trip-1",
    );
  });

  it("calls writeNotificationsForLegDeletion with the leg name after soft-delete", async () => {
    vi.mocked(getLegById).mockResolvedValue({
      legId: "leg-1",
      tripId: "trip-1",
      name: "Lyon → Marseille",
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 0,
      memberUids: [],
      isActive: true,
    });
    vi.mocked(softDeleteLeg).mockResolvedValue(undefined);
    vi.mocked(writeNotificationsForLegDeletion).mockResolvedValue(undefined);

    const request = makeDeleteRequest("uid-planner");
    await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });

    expect(vi.mocked(writeNotificationsForLegDeletion)).toHaveBeenCalledWith(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );
  });

  it("uses a fallback leg name when the leg cannot be loaded", async () => {
    vi.mocked(getLegById).mockResolvedValue(undefined);
    vi.mocked(softDeleteLeg).mockResolvedValue(undefined);
    vi.mocked(writeNotificationsForLegDeletion).mockResolvedValue(undefined);

    const request = makeDeleteRequest("uid-planner");
    await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });

    expect(vi.mocked(writeNotificationsForLegDeletion)).toHaveBeenCalledWith(
      "trip-1",
      "leg-1",
      "A leg was removed",
    );
  });

  it("returns 200 when notification writing fails after soft-delete", async () => {
    vi.mocked(getLegById).mockResolvedValue({
      legId: "leg-1",
      tripId: "trip-1",
      name: "Lyon → Marseille",
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 0,
      memberUids: [],
      isActive: true,
    });
    vi.mocked(softDeleteLeg).mockResolvedValue(undefined);
    vi.mocked(writeNotificationsForLegDeletion).mockRejectedValue(
      new Error("notification write failed"),
    );
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = makeDeleteRequest("uid-planner");
    const response = await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });

    expect(response.status).toBe(200);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns 403 when user is not a Planner", async () => {
    vi.mocked(softDeleteLeg).mockRejectedValue(
      new PlannerOnlyError("Only Planners can remove legs"),
    );

    const request = makeDeleteRequest("uid-guest");
    const response = await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(softDeleteLeg).mockRejectedValue(
      new Error("Database unavailable"),
    );

    const request = makeDeleteRequest("uid-1");
    const response = await DELETE(request, {
      params: Promise.resolve({ tripId: "trip-1", legId: "leg-1" }),
    });
    expect(response.status).toBe(500);
  });
});
