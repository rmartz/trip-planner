import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { NotFoundError } from "@/services/errors";

vi.mock("@/services/transportation", () => ({
  getSeatOfferCandidates: vi.fn(),
  setSeatOffer: vi.fn(),
}));

import {
  getSeatOfferCandidates,
  setSeatOffer,
} from "@/services/transportation";
import { GET, PUT } from "./route";

function makeParams(tripId: string, legId: string) {
  return { params: Promise.resolve({ tripId, legId }) };
}

function makeRawRequest(uid: string, rawBody: string) {
  const headers = new Headers({
    "Content-Type": "application/json",
    [X_USER_ID_HEADER]: uid,
  });

  return new NextRequest(
    "http://localhost/api/trips/trip-1/legs/leg-1/seat-offer",
    { method: "PUT", headers, body: rawBody },
  );
}

function makeRequest(uid: string | undefined, body: unknown) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }

  return new NextRequest(
    "http://localhost/api/trips/trip-1/legs/leg-1/seat-offer",
    { method: "PUT", headers, body: JSON.stringify(body) },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/legs/[legId]/seat-offer", () => {
  it("returns 401 when uid header is absent", async () => {
    const response = await GET(
      makeRequest(undefined, undefined),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(401);
  });

  it("returns seat-offer candidates for the requesting driver", async () => {
    vi.mocked(getSeatOfferCandidates).mockResolvedValue({
      candidateUids: ["uid-guest"],
      offeredToUids: ["uid-guest"],
    });

    const response = await GET(
      makeRequest("uid-driver", undefined),
      makeParams("trip-1", "leg-1"),
    );
    const body = (await response.json()) as {
      candidateUids: string[];
      offeredToUids: string[];
    };

    expect(response.status).toBe(200);
    expect(getSeatOfferCandidates).toHaveBeenCalledWith(
      "uid-driver",
      "trip-1",
      "leg-1",
    );
    expect(body).toEqual({
      candidateUids: ["uid-guest"],
      offeredToUids: ["uid-guest"],
    });
  });
});

describe("PUT /api/trips/[tripId]/legs/[legId]/seat-offer", () => {
  it("returns 400 when the body is a JSON null", async () => {
    const response = await PUT(
      makeRawRequest("uid-driver", "null"),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(400);
    expect(setSeatOffer).not.toHaveBeenCalled();
  });

  it("returns 400 when offeredToUids is missing from the body", async () => {
    const response = await PUT(
      makeRequest("uid-driver", {}),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(400);
    expect(setSeatOffer).not.toHaveBeenCalled();
  });

  it("returns 400 when offeredToUids is not an array", async () => {
    const response = await PUT(
      makeRequest("uid-driver", { offeredToUids: "uid-guest" }),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(400);
    expect(setSeatOffer).not.toHaveBeenCalled();
  });

  it("returns 400 when offeredToUids contains a non-string element", async () => {
    const response = await PUT(
      makeRequest("uid-driver", { offeredToUids: [1, "uid-guest"] }),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(400);
    expect(setSeatOffer).not.toHaveBeenCalled();
  });

  it("returns 401 when uid header is absent", async () => {
    const response = await PUT(
      makeRequest(undefined, { offeredToUids: ["uid-guest"] }),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(401);
  });

  it("calls the seat-offer service with the requester uid", async () => {
    vi.mocked(setSeatOffer).mockResolvedValue();

    const response = await PUT(
      makeRequest("uid-driver", { offeredToUids: ["uid-guest"] }),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(200);
    expect(setSeatOffer).toHaveBeenCalledWith("uid-driver", "trip-1", "leg-1", [
      "uid-guest",
    ]);
  });

  it("returns 404 when the driver has no transportation entry", async () => {
    vi.mocked(setSeatOffer).mockRejectedValue(
      new NotFoundError("Transportation entry not found for this driver."),
    );

    const response = await PUT(
      makeRequest("uid-driver", { offeredToUids: ["uid-guest"] }),
      makeParams("trip-1", "leg-1"),
    );

    expect(response.status).toBe(404);
  });
});
