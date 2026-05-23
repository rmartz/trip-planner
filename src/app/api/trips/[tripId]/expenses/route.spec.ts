import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import type { Expense } from "@/lib/types/expense";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/expenses", () => ({
  getExpensesForTrip: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import { getExpensesForTrip } from "@/services/expenses";
import { getTripMemberRole } from "@/services/trips";
import { GET } from "./route";

const STUB_EXPENSE: Expense = {
  expenseId: "exp-1",
  tripId: "trip-1",
  name: "Dinner",
  amount: 50,
  category: ExpenseCategory.Food,
  payerUid: "uid-a",
  participantUids: ["uid-a", "uid-b"],
  splitMethod: ExpenseSplitMethod.Even,
};

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/expenses`, {
    headers,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/expenses", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await GET(makeGetRequest(undefined), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);
    const response = await GET(makeGetRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("does not call getExpensesForTrip for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);
    await GET(makeGetRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(getExpensesForTrip)).not.toHaveBeenCalled();
  });

  it("returns 200 with expenses for trip members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([STUB_EXPENSE]);
    const response = await GET(makeGetRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
  });

  it("returns expenses array in response body", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([STUB_EXPENSE]);
    const response = await GET(makeGetRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    const body = (await response.json()) as { expenses: Expense[] };
    expect(body.expenses).toHaveLength(1);
    expect(body.expenses[0]?.expenseId).toBe("exp-1");
  });

  it("calls getExpensesForTrip with the correct tripId", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getExpensesForTrip).mockResolvedValue([]);
    await GET(makeGetRequest("uid-planner", "trip-abc"), {
      params: Promise.resolve({ tripId: "trip-abc" }),
    });
    expect(vi.mocked(getExpensesForTrip)).toHaveBeenCalledWith("trip-abc");
  });

  it("returns empty expenses array when trip has no expenses", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([]);
    const response = await GET(makeGetRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    const body = (await response.json()) as { expenses: Expense[] };
    expect(body.expenses).toHaveLength(0);
  });
});
