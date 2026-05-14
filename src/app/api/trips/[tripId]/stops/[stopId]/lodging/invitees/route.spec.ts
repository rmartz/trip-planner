import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { NotFoundError } from "@/services/errors";

vi.mock("@/services/lodging", () => ({
  getLodgingInviteeCandidates: vi.fn(),
  setLodgingInvitees: vi.fn(),
}));

import {
  getLodgingInviteeCandidates,
  setLodgingInvitees,
} from "@/services/lodging";
import { GET, PUT } from "./route";

function makeParams(tripId: string, stopId: string) {
  return { params: Promise.resolve({ tripId, stopId }) };
}

function makeRawRequest(uid: string, rawBody: string) {
  const headers = new Headers({
    "Content-Type": "application/json",
    [X_USER_ID_HEADER]: uid,
  });

  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/lodging/invitees",
    {
      method: "PUT",
      headers,
      body: rawBody,
    },
  );
}

function makeRequest(uid: string | undefined, body: unknown) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }

  return new NextRequest(
    "http://localhost/api/trips/trip-1/stops/stop-1/lodging/invitees",
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/stops/[stopId]/lodging/invitees", () => {
  it("returns 401 when uid header is absent", async () => {
    const response = await GET(
      makeRequest(undefined, { invitedUids: ["uid-guest"] }),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(401);
  });

  it("returns invitee candidates for the requesting host", async () => {
    vi.mocked(getLodgingInviteeCandidates).mockResolvedValue({
      candidateUids: ["uid-guest"],
      invitedUids: ["uid-guest"],
    });

    const response = await GET(
      makeRequest("uid-host", { invitedUids: ["uid-guest"] }),
      makeParams("trip-1", "stop-1"),
    );
    const body = (await response.json()) as {
      candidateUids: string[];
      invitedUids: string[];
    };

    expect(response.status).toBe(200);
    expect(getLodgingInviteeCandidates).toHaveBeenCalledWith(
      "uid-host",
      "trip-1",
      "stop-1",
    );
    expect(body).toEqual({
      candidateUids: ["uid-guest"],
      invitedUids: ["uid-guest"],
    });
  });
});

describe("PUT /api/trips/[tripId]/stops/[stopId]/lodging/invitees", () => {
  it("returns 400 when the body is a JSON null", async () => {
    const response = await PUT(
      makeRawRequest("uid-host", "null"),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(400);
    expect(setLodgingInvitees).not.toHaveBeenCalled();
  });

  it("returns 401 when uid header is absent", async () => {
    const response = await PUT(
      makeRequest(undefined, { invitedUids: ["uid-guest"] }),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(401);
  });

  it("calls the lodging service with the requester uid", async () => {
    vi.mocked(setLodgingInvitees).mockResolvedValue();

    const response = await PUT(
      makeRequest("uid-host", { invitedUids: ["uid-guest"] }),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(200);
    expect(setLodgingInvitees).toHaveBeenCalledWith(
      "uid-host",
      "trip-1",
      "stop-1",
      ["uid-guest"],
    );
  });

  it("returns 404 when the requester is not a trip member", async () => {
    vi.mocked(setLodgingInvitees).mockRejectedValue(
      new NotFoundError("Trip not found"),
    );

    const response = await PUT(
      makeRequest("uid-host", { invitedUids: ["uid-guest"] }),
      makeParams("trip-1", "stop-1"),
    );

    expect(response.status).toBe(404);
  });
});
