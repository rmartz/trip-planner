import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { NotFoundError, PlannerOnlyError } from "@/services/errors";

vi.mock("@/services/stop-destinations", () => ({
  attachDestinationToStop: vi.fn(),
}));

import { attachDestinationToStop } from "@/services/stop-destinations";
import { POST } from "./route";

function makeParams(tripId: string, stopId: string) {
  return { params: Promise.resolve({ tripId, stopId }) };
}

function makePostRequest(uid: string | undefined, body: unknown) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/destinations",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/trips/[tripId]/stops/[stopId]/destinations", () => {
  it("returns 401 when uid header is absent", async () => {
    const req = makePostRequest(undefined, {
      destinationId: "dest-1",
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(401);
  });

  it("returns 400 when destinationId is missing", async () => {
    const req = makePostRequest("user-1", {
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(400);
  });

  it("returns 400 when catalogUid is missing", async () => {
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(400);
  });

  it("returns 400 when destinationName is missing", async () => {
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      catalogUid: "user-1",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(400);
  });

  it("calls attachDestinationToStop with correct arguments on valid request", async () => {
    vi.mocked(attachDestinationToStop).mockResolvedValue();
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(200);
    expect(attachDestinationToStop).toHaveBeenCalledWith(
      "user-1",
      "trip-1",
      "stop-1",
      "dest-1",
      "user-1",
      "Paris",
    );
  });

  it("returns 403 when service throws PlannerOnlyError", async () => {
    vi.mocked(attachDestinationToStop).mockRejectedValue(
      new PlannerOnlyError("Only Planners can attach destinations"),
    );
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(403);
  });

  it("returns 404 when service throws NotFoundError", async () => {
    vi.mocked(attachDestinationToStop).mockRejectedValue(
      new NotFoundError("Stop not found"),
    );
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(404);
  });
});
