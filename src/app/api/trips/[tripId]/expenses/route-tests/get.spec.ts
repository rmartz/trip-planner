import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/services/expenses", () => ({
  addExpense: vi.fn(),
  getExpensesForTrip: vi.fn(),
}));
vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
  getTripMemberUids: vi.fn(),
}));

import { getExpensesForTrip } from "@/services/expenses";
import { getTripMemberRole } from "@/services/trips";
import { GET } from "../route";
import { makeExpense, makeGetRequest } from "./setup";

beforeEach(() => {
  vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/expenses", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const request = makeGetRequest("uid-stranger");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("does not fetch expenses for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const request = makeGetRequest("uid-stranger");
    await GET(request, { params: Promise.resolve({ tripId: "trip-1" }) });

    expect(vi.mocked(getExpensesForTrip)).not.toHaveBeenCalled();
  });

  it("returns expenses for a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([makeExpense()]);

    const request = makeGetRequest("uid-alice");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      expenses: Record<string, unknown>[];
    };
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0]!["name"]).toBe("Hotel stay");
    expect(data.expenses[0]!["amount"]).toBe(150);
    expect(data.expenses[0]!["currency"]).toBe("USD");
  });

  it("calls getTripMemberRole with tripId and uid", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([]);

    const request = makeGetRequest("uid-alice", "trip-abc");
    await GET(request, { params: Promise.resolve({ tripId: "trip-abc" }) });

    expect(vi.mocked(getTripMemberRole)).toHaveBeenCalledWith(
      "trip-abc",
      "uid-alice",
    );
  });
});
