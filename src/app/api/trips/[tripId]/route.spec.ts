import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

vi.mock("@/services/trips", () => ({
  getTripById: vi.fn(),
  getTripMemberRole: vi.fn(),
}));

import { getTripById, getTripMemberRole } from "@/services/trips";
import { GET } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-08T00:00:00Z"),
    createdAt: new Date("2025-01-01T00:00:00Z"),
    createdBy: "uid-owner",
    memberUids: ["uid-owner"],
    inviteToken: "tok-abc",
    ...overrides,
  };
}

function makeRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/trips/trip-1", { headers });
}

describe("GET /api/trips/[tripId] — unauthenticated", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await GET(makeRequest(undefined), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });
});

describe("GET /api/trips/[tripId] — membership gate", () => {
  it("returns 404 when user is not a member of the trip", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const response = await GET(makeRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("does not call getTripById when user is not a member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    await GET(makeRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(getTripById)).not.toHaveBeenCalled();
  });
});

describe("GET /api/trips/[tripId] — success", () => {
  it("returns the trip with serialized dates", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getTripById).mockResolvedValue(makeTrip());

    const response = await GET(makeRequest("uid-owner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body["name"]).toBe("Paris Trip");
    expect(body["startDate"]).toBe("2025-06-01T00:00:00.000Z");
    expect(body["endDate"]).toBe("2025-06-08T00:00:00.000Z");
    expect(body["createdAt"]).toBe("2025-01-01T00:00:00.000Z");
    expect(body["inviteToken"]).toBe("tok-abc");
  });

  it("calls getTripMemberRole with the tripId and uid", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getTripById).mockResolvedValue(makeTrip());

    await GET(makeRequest("uid-owner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(getTripMemberRole)).toHaveBeenCalledWith(
      "trip-1",
      "uid-owner",
    );
  });

  it("returns 404 when trip document does not exist", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getTripById).mockResolvedValue(undefined);

    const response = await GET(makeRequest("uid-owner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(404);
  });
});
