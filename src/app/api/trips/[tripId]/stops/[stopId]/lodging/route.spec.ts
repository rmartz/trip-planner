import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { LodgingStatus } from "@/lib/types/lodging";
import { NotFoundError } from "@/services/errors";

vi.mock("@/services/lodging", () => ({
  getLodgingForStop: vi.fn(),
}));

import { getLodgingForStop } from "@/services/lodging";
import { GET } from "./route";

function makeParams(tripId: string, stopId: string) {
  return { params: Promise.resolve({ tripId, stopId }) };
}

function makeRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }

  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/lodging",
    { headers },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/stops/[stopId]/lodging", () => {
  it("returns 401 when uid header is absent", async () => {
    const response = await GET(
      makeRequest(undefined),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(401);
  });

  it("passes uid through to the lodging service, redacts foreign invitedUids, and serializes dates", async () => {
    vi.mocked(getLodgingForStop).mockResolvedValue([
      {
        uid: "uid-guest",
        stopId: "stop-1",
        status: LodgingStatus.NeedLodging,
        updatedAt: new Date("2025-06-03T00:00:00.000Z"),
      },
      {
        uid: "uid-host",
        stopId: "stop-1",
        status: LodgingStatus.SecuredCapacity,
        updatedAt: new Date("2025-06-03T00:00:00.000Z"),
        invitedUids: ["uid-guest"],
      },
    ]);

    const response = await GET(
      makeRequest("uid-guest"),
      makeParams("trip-1", "stop-1"),
    );
    const body = (await response.json()) as {
      records: Record<string, unknown>[];
    };

    expect(response.status).toBe(200);
    expect(getLodgingForStop).toHaveBeenCalledWith(
      "uid-guest",
      "trip-1",
      "stop-1",
    );
    expect(body.records[0]?.["updatedAt"]).toBe("2025-06-03T00:00:00.000Z");
    expect(body.records[1]?.["invitedUids"]).toBeUndefined();
  });

  it("returns 404 when the requester is not a trip member", async () => {
    vi.mocked(getLodgingForStop).mockRejectedValue(
      new NotFoundError("Trip not found"),
    );

    const response = await GET(
      makeRequest("uid-guest"),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(404);
  });
});
