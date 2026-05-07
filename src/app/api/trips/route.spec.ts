import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers");
vi.mock("@/lib/firebase/admin");
vi.mock("@/services/trips");

import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { createTripForUser } from "@/services/trips";
import { POST } from "./route";

const mockGet = vi.fn();
const mockVerifySessionCookie = vi.fn();

beforeEach(() => {
  vi.mocked(cookies).mockResolvedValue({
    get: mockGet,
  } as unknown as Awaited<ReturnType<typeof cookies>>);
  vi.mocked(getAdminAuth).mockReturnValue({
    verifySessionCookie: mockVerifySessionCookie,
  } as unknown as ReturnType<typeof getAdminAuth>);
});

describe("POST /api/trips — no session cookie returns 401", () => {
  it("returns 401", async () => {
    mockGet.mockReturnValue(undefined);

    const request = new Request("http://localhost/api/trips", {
      method: "POST",
      body: JSON.stringify({
        name: "Road Trip",
        startDate: "2025-06-01",
        endDate: "2025-06-08",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

describe("POST /api/trips — invalid session cookie returns 401", () => {
  it("returns 401", async () => {
    mockGet.mockReturnValue({ value: "bad-cookie" });
    mockVerifySessionCookie.mockRejectedValue(new Error("Invalid"));

    const request = new Request("http://localhost/api/trips", {
      method: "POST",
      body: JSON.stringify({
        name: "Road Trip",
        startDate: "2025-06-01",
        endDate: "2025-06-08",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

describe("POST /api/trips — authenticated request creates trip", () => {
  it("returns tripId on success", async () => {
    mockGet.mockReturnValue({ value: "valid-session" });
    mockVerifySessionCookie.mockResolvedValue({ uid: "user-abc" });
    vi.mocked(createTripForUser).mockResolvedValue("trip-xyz");

    const request = new Request("http://localhost/api/trips", {
      method: "POST",
      body: JSON.stringify({
        name: "Road Trip",
        startDate: "2025-06-01",
        endDate: "2025-06-08",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { tripId: string };
    expect(body.tripId).toBe("trip-xyz");
  });

  it("calls createTripForUser with uid, name, and parsed dates", async () => {
    mockGet.mockReturnValue({ value: "valid-session" });
    mockVerifySessionCookie.mockResolvedValue({ uid: "user-abc" });
    vi.mocked(createTripForUser).mockResolvedValue("trip-xyz");

    const request = new Request("http://localhost/api/trips", {
      method: "POST",
      body: JSON.stringify({
        name: "Road Trip",
        startDate: "2025-06-01",
        endDate: "2025-06-08",
      }),
    });

    await POST(request);
    expect(vi.mocked(createTripForUser)).toHaveBeenCalledWith(
      "user-abc",
      "Road Trip",
      new Date("2025-06-01"),
      new Date("2025-06-08"),
    );
  });
});
