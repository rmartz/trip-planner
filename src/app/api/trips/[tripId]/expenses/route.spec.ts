import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";
import {
  ExpenseCategory,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import type { Expense } from "@/lib/types/expense";

vi.mock("@/services/expenses", () => ({
  addExpense: vi.fn(),
  getExpenseMemberRole: vi.fn(),
  getExpensesForTrip: vi.fn(),
}));

import {
  addExpense,
  getExpenseMemberRole,
  getExpensesForTrip,
} from "@/services/expenses";
import { GET, POST } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    expenseId: "exp-1",
    tripId: "trip-1",
    name: "Hotel stay",
    amount: 150,
    currency: "USD",
    category: ExpenseCategory.Lodging,
    payerUid: "uid-alice",
    participantUids: ["uid-alice", "uid-bob"],
    splitMethod: ExpenseSplitMethod.Even,
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/expenses`, {
    headers,
  });
}

function makePostRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers,
    body: options.malformedJson ? "not-json" : JSON.stringify(body),
  });
}

const VALID_BODY = {
  name: "Hotel stay",
  amount: 150,
  currency: "USD",
  category: ExpenseCategory.Lodging,
  payerUid: "uid-alice",
  participantUids: ["uid-alice", "uid-bob"],
  splitMethod: ExpenseSplitMethod.Even,
};

describe("GET /api/trips/[tripId]/expenses", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeGetRequest(undefined);
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a member", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(null);

    const request = makeGetRequest("uid-stranger");
    const response = await GET(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("does not fetch expenses for non-members", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(null);

    const request = makeGetRequest("uid-stranger");
    await GET(request, { params: Promise.resolve({ tripId: "trip-1" }) });

    expect(vi.mocked(getExpensesForTrip)).not.toHaveBeenCalled();
  });

  it("returns expenses for a trip member", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(TripRole.Guest);
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

  it("calls getExpenseMemberRole with uid and tripId", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpensesForTrip).mockResolvedValue([]);

    const request = makeGetRequest("uid-alice", "trip-abc");
    await GET(request, { params: Promise.resolve({ tripId: "trip-abc" }) });

    expect(vi.mocked(getExpenseMemberRole)).toHaveBeenCalledWith(
      "uid-alice",
      "trip-abc",
    );
  });
});

describe("POST /api/trips/[tripId]/expenses", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makePostRequest(undefined, VALID_BODY);
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const request = makePostRequest("uid-alice", {}, "trip-1", {
      malformedJson: true,
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when body is JSON null", async () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.set(X_USER_ID_HEADER, "uid-alice");
    const request = new NextRequest(
      "http://localhost/api/trips/trip-1/expenses",
      {
        method: "POST",
        headers,
        body: "null",
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when required fields are missing", async () => {
    const request = makePostRequest("uid-alice", { name: "Hotel stay" });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is empty", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      name: "  ",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("name is required");
  });

  it("returns 403 when user is not a member", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(null);

    const request = makePostRequest("uid-stranger", VALID_BODY);
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("does not call addExpense for non-members", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(null);

    const request = makePostRequest("uid-stranger", VALID_BODY);
    await POST(request, { params: Promise.resolve({ tripId: "trip-1" }) });

    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });

  it("returns expenseId on success", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(addExpense).mockResolvedValue("exp-new");

    const request = makePostRequest("uid-alice", VALID_BODY);
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as { expenseId: string };
    expect(body.expenseId).toBe("exp-new");
  });

  it("calls addExpense with uid, tripId, and expense fields", async () => {
    vi.mocked(getExpenseMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(addExpense).mockResolvedValue("exp-new");

    const request = makePostRequest("uid-alice", VALID_BODY, "trip-abc");
    await POST(request, { params: Promise.resolve({ tripId: "trip-abc" }) });

    expect(vi.mocked(addExpense)).toHaveBeenCalledWith(
      "uid-alice",
      "trip-abc",
      expect.objectContaining({
        name: "Hotel stay",
        amount: 150,
        currency: "USD",
        category: ExpenseCategory.Lodging,
        payerUid: "uid-alice",
      }),
    );
  });
});
