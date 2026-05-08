import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/services/invite", () => ({
  regenerateInviteToken: vi.fn(),
}));
vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import { regenerateInviteToken } from "@/services/invite";
import { getTripMemberRole } from "@/services/trips";
import { POST } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

function makeRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/trips/trip-1/invite", {
    method: "POST",
    headers,
  });
}

describe("POST /api/trips/[tripId]/invite — unauthenticated", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await POST(makeRequest(undefined), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });
});

describe("POST /api/trips/[tripId]/invite — not a Planner", () => {
  it("returns 403 when user is a Guest", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);

    const response = await POST(makeRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("returns 403 when user is not a member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const response = await POST(makeRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
  });
});

describe("POST /api/trips/[tripId]/invite — Planner", () => {
  it("returns the new invite token", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(regenerateInviteToken).mockResolvedValue("new-tok-xyz");

    const response = await POST(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as { inviteToken: string };
    expect(body.inviteToken).toBe("new-tok-xyz");
  });

  it("calls regenerateInviteToken with the tripId", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(regenerateInviteToken).mockResolvedValue("new-tok-xyz");

    await POST(makeRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(regenerateInviteToken)).toHaveBeenCalledWith("trip-1");
  });
});
