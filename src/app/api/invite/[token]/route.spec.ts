import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import type { Trip } from "@/lib/types/trip";

vi.mock("@/services/invite", () => ({
  getTripByInviteToken: vi.fn(),
  acceptInvite: vi.fn(),
}));

import { getTripByInviteToken, acceptInvite } from "@/services/invite";
import { GET, POST } from "./route";

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
    memberUids: ["uid-owner", "uid-other"],
    inviteToken: "tok-abc",
    ...overrides,
  };
}

function makeGetRequest() {
  return new NextRequest("http://localhost/api/invite/tok-abc");
}

function makePostRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/invite/tok-abc", {
    method: "POST",
    headers,
  });
}

describe("GET /api/invite/[token] — valid token", () => {
  it("returns trip name, date range, and member count", async () => {
    vi.mocked(getTripByInviteToken).mockResolvedValue(makeTrip());

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body["name"]).toBe("Paris Trip");
    expect(body["startDate"]).toBe("2025-06-01T00:00:00.000Z");
    expect(body["endDate"]).toBe("2025-06-08T00:00:00.000Z");
    expect(body["memberCount"]).toBe(2);
  });

  it("calls getTripByInviteToken with the route token", async () => {
    vi.mocked(getTripByInviteToken).mockResolvedValue(makeTrip());

    await GET(makeGetRequest(), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(vi.mocked(getTripByInviteToken)).toHaveBeenCalledWith("tok-abc");
  });
});

describe("GET /api/invite/[token] — invalid token", () => {
  it("returns 404 when the token does not match any trip", async () => {
    vi.mocked(getTripByInviteToken).mockResolvedValue(undefined);

    const response = await GET(makeGetRequest(), {
      params: Promise.resolve({ token: "bad-token" }),
    });
    expect(response.status).toBe(404);
  });
});

describe("POST /api/invite/[token] — unauthenticated", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await POST(makePostRequest(undefined), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(response.status).toBe(401);
  });
});

describe("POST /api/invite/[token] — invalid token", () => {
  it("returns 404 when acceptInvite throws Invalid invite token", async () => {
    vi.mocked(acceptInvite).mockRejectedValue(
      new Error("Invalid invite token"),
    );

    const response = await POST(makePostRequest("uid-x"), {
      params: Promise.resolve({ token: "bad-token" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 500 when acceptInvite throws an unexpected error", async () => {
    vi.mocked(acceptInvite).mockRejectedValue(new Error("Firestore timeout"));

    const response = await POST(makePostRequest("uid-x"), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(response.status).toBe(500);
  });
});

describe("POST /api/invite/[token] — authenticated, valid token", () => {
  it("returns the tripId on success", async () => {
    vi.mocked(acceptInvite).mockResolvedValue("trip-1");

    const response = await POST(makePostRequest("uid-new"), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as { tripId: string };
    expect(body.tripId).toBe("trip-1");
  });

  it("calls acceptInvite with the token and uid", async () => {
    vi.mocked(acceptInvite).mockResolvedValue("trip-1");

    await POST(makePostRequest("uid-new"), {
      params: Promise.resolve({ token: "tok-abc" }),
    });
    expect(vi.mocked(acceptInvite)).toHaveBeenCalledWith("tok-abc", "uid-new");
  });
});
