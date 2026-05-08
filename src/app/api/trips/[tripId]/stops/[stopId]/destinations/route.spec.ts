import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/stop-destinations", () => ({
  attachDestinationToStop: vi.fn(),
  getTripDestinations: vi.fn(),
}));

import {
  attachDestinationToStop,
  getTripDestinations,
} from "@/services/stop-destinations";
import { POST, GET } from "./route";

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

function makeGetRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/destinations",
    { headers },
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

  it("returns 403 when service throws a Planner-only error", async () => {
    vi.mocked(attachDestinationToStop).mockRejectedValue(
      new Error("Only Planners can attach destinations"),
    );
    const req = makePostRequest("user-1", {
      destinationId: "dest-1",
      catalogUid: "user-1",
      destinationName: "Paris",
    });
    const resp = await POST(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(403);
  });
});

describe("GET /api/trips/[tripId]/stops/[stopId]/destinations", () => {
  it("returns 401 when uid header is absent", async () => {
    const req = makeGetRequest(undefined);
    const resp = await GET(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(401);
  });

  it("returns trip destinations on valid request", async () => {
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
    const req = makeGetRequest("user-1");
    const resp = await GET(req, makeParams("trip-1", "stop-1"));
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data).toHaveLength(1);
  });
});
