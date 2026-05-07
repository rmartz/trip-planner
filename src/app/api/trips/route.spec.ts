import { describe, it, expect, vi, afterEach } from "vitest";
import type { Trip } from "@/lib/types/trip";

const { mockCookies, mockVerifySessionCookie } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockVerifySessionCookie: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: vi.fn(() => ({
    verifySessionCookie: mockVerifySessionCookie,
  })),
}));

vi.mock("@/services/trips", () => ({
  getTripsForUser: vi.fn(),
}));

import { getTripsForUser } from "@/services/trips";
import { GET } from "./route";

const START = "2025-06-01T00:00:00.000Z";
const END = "2025-06-08T00:00:00.000Z";
const CREATED_AT = "2025-01-15T12:00:00.000Z";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date(START),
    endDate: new Date(END),
    createdAt: new Date(CREATED_AT),
    createdBy: "uid-abc",
    memberUids: ["uid-abc"],
    ...overrides,
  };
}

function setSessionCookie(value: string | undefined) {
  mockCookies.mockResolvedValue({
    get: (name: string) =>
      name === "session" && value ? { value } : undefined,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips", () => {
  it("returns 401 when session cookie is absent", async () => {
    setSessionCookie(undefined);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 401 when session cookie is invalid", async () => {
    setSessionCookie("invalid-session");
    mockVerifySessionCookie.mockRejectedValueOnce(new Error("invalid"));

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns trips serialized with ISO date strings for the verified uid", async () => {
    setSessionCookie("valid-session");
    mockVerifySessionCookie.mockResolvedValueOnce({ uid: "uid-abc" });
    vi.mocked(getTripsForUser).mockResolvedValue([makeTrip()]);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(1);
    const item = data[0] as Record<string, unknown>;
    expect(item["startDate"]).toBe(START);
    expect(item["endDate"]).toBe(END);
    expect(item["createdAt"]).toBe(CREATED_AT);
  });

  it("calls getTripsForUser with the verified uid", async () => {
    setSessionCookie("valid-session");
    mockVerifySessionCookie.mockResolvedValueOnce({ uid: "uid-xyz" });
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    await GET();
    expect(vi.mocked(getTripsForUser)).toHaveBeenCalledWith("uid-xyz");
  });

  it("returns empty array when user has no trips", async () => {
    setSessionCookie("valid-session");
    mockVerifySessionCookie.mockResolvedValueOnce({ uid: "uid-abc" });
    vi.mocked(getTripsForUser).mockResolvedValue([]);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = (await response.json()) as unknown[];
    expect(data).toHaveLength(0);
  });
});
