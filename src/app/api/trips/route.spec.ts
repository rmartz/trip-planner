import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Trip } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/trips", () => ({
  getTripsForUser: vi.fn(),
  createTripForUser: vi.fn(),
}));

import { createTripForUser, getTripsForUser } from "@/services/trips";
import { GET, POST } from "./route";
import { proxy } from "@/proxy";

const START_DATE = "2025-06-01";
const END_DATE = "2025-06-08";
const CREATED_AT = "2025-01-15T12:00:00.000Z";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 8),
    createdAt: new Date(CREATED_AT),
    createdBy: "uid-abc",
    memberUids: ["uid-abc"],
    inviteToken: "tok-abc",
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest("http://localhost/api/trips", { headers });
}

function makePostRequest(
  uid: string | undefined,
  body: unknown,
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest("http://localhost/api/trips", {
    method: "POST",
    headers,
    body: options.malformedJson ? "not-json" : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("serializes startDate and endDate as YYYY-MM-DD date strings to avoid timezone drift", async () => {
    const trip = makeTrip();
    vi.mocked(getTripsForUser).mockResolvedValue([trip]);

    const request = makeGetRequest("uid-abc");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(1);
    const item = data[0] as Record<string, unknown>;
    expect(item["startDate"]).toBe(START_DATE);
    expect(item["endDate"]).toBe(END_DATE);
  });

  it("serializes createdAt as a full ISO timestamp", async () => {
    const trip = makeTrip();
    vi.mocked(getTripsForUser).mockResolvedValue([trip]);

    const request = makeGetRequest("uid-abc");
    const response = await GET(request);

    const data = (await response.json()) as unknown[];
    const item = data[0] as Record<string, unknown>;
    expect(item["createdAt"]).toBe(CREATED_AT);
  });

  it("calls getTripsForUser with the uid from x-user-id header", async () => {
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    const request = makeGetRequest("uid-xyz");
    await GET(request);
    expect(vi.mocked(getTripsForUser)).toHaveBeenCalledWith("uid-xyz");
  });

  it("returns empty array when user has no trips", async () => {
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    const request = makeGetRequest("uid-abc");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(0);
  });

  it("rejects forged x-user-id when no session cookie is present", async () => {
    // Trust boundary note: route.ts trusts x-user-id only after proxy auth.
    const response = await proxy(makeGetRequest("uid-forged"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/sign-in?next=%2Fapi%2Ftrips",
    );
  });
});

describe("POST /api/trips", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePostRequest(undefined, {
      name: "Road Trip",
      startDate: "2025-06-01",
      endDate: "2025-06-08",
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON body", async () => {
    const request = makePostRequest("user-abc", {}, { malformedJson: true });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const request = makePostRequest("user-abc", {
      startDate: "2025-06-01",
      endDate: "2025-06-08",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when dates are invalid", async () => {
    const request = makePostRequest("user-abc", {
      name: "Road Trip",
      startDate: "not-a-date",
      endDate: "2025-06-08",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when end date is before start date", async () => {
    const request = makePostRequest("user-abc", {
      name: "Road Trip",
      startDate: "2025-06-08",
      endDate: "2025-06-01",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns tripId on success", async () => {
    vi.mocked(createTripForUser).mockResolvedValue("trip-xyz");

    const request = makePostRequest("user-abc", {
      name: "Road Trip",
      startDate: "2025-06-01",
      endDate: "2025-06-08",
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { tripId: string };
    expect(body.tripId).toBe("trip-xyz");
  });

  it("calls createTripForUser with uid, name, and parsed dates", async () => {
    vi.mocked(createTripForUser).mockResolvedValue("trip-xyz");

    const request = makePostRequest("user-abc", {
      name: "Road Trip",
      startDate: "2025-06-01",
      endDate: "2025-06-08",
    });
    await POST(request);
    expect(vi.mocked(createTripForUser)).toHaveBeenCalledWith(
      "user-abc",
      "Road Trip",
      new Date(2025, 5, 1),
      new Date(2025, 5, 8),
    );
  });
});
