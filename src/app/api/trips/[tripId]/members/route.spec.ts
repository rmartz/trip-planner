import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/members", () => ({
  getMembersForTrip: vi.fn(),
  addNonAccountMember: vi.fn(),
}));

import { getMembersForTrip, addNonAccountMember } from "@/services/members";
import { GET, POST } from "./route";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";

function makeTripMember(overrides: Partial<TripMember> = {}): TripMember {
  return {
    uid: "uid-1",
    tripId: "trip-1",
    role: TripRole.Guest,
    joinedAt: new Date("2025-01-01T00:00:00.000Z"),
    memberUids: [],
    ...overrides,
  };
}

function makeNonAccountMember(
  overrides: Partial<NonAccountMember> = {},
): NonAccountMember {
  return {
    nonAccountMemberId: "na-1",
    tripId: "trip-1",
    name: "Ben",
    proxiedBy: "planner-uid",
    claimToken: "token-abc",
    claimedBy: undefined,
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest(`http://localhost/api/trips/${tripId}/members`, {
    headers,
  });
}

function makePostRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest(`http://localhost/api/trips/${tripId}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/members", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns account members and non-account members for a trip", async () => {
    const member = makeTripMember({ role: TripRole.Planner });
    const nonAccount = makeNonAccountMember();
    vi.mocked(getMembersForTrip).mockResolvedValue({
      accountMembers: [member],
      nonAccountMembers: [nonAccount],
    });

    const request = makeGetRequest("planner-uid");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      accountMembers: unknown[];
      nonAccountMembers: unknown[];
    };
    expect(data.accountMembers).toHaveLength(1);
    expect(data.nonAccountMembers).toHaveLength(1);
  });

  it("calls getMembersForTrip with the tripId from path params", async () => {
    vi.mocked(getMembersForTrip).mockResolvedValue({
      accountMembers: [],
      nonAccountMembers: [],
    });

    const request = makeGetRequest("uid-1", "trip-xyz");
    await GET(request, { params: Promise.resolve({ tripId: "trip-xyz" }) });
    expect(vi.mocked(getMembersForTrip)).toHaveBeenCalledWith("trip-xyz");
  });
});

describe("POST /api/trips/[tripId]/members", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePostRequest(undefined, { name: "Alex" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const request = makePostRequest("planner-uid", {});
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 403 when addNonAccountMember throws planner-only error", async () => {
    vi.mocked(addNonAccountMember).mockRejectedValue(
      new Error("Only Planners can add members"),
    );

    const request = makePostRequest("guest-uid", { name: "Alex" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns created non-account member on success", async () => {
    const nonAccount = makeNonAccountMember({ name: "Alex" });
    vi.mocked(addNonAccountMember).mockResolvedValue(nonAccount);

    const request = makePostRequest("planner-uid", { name: "Alex" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(201);

    const body = (await response.json()) as { name: string };
    expect(body.name).toBe("Alex");
  });
});
