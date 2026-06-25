import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import { ExpenseCategory } from "@/lib/types/expense";

vi.mock("@/services/expenses", () => ({
  addExpense: vi.fn(),
  getExpensesForTrip: vi.fn(),
}));
vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
  getTripMemberUids: vi.fn(),
}));

import { addExpense } from "@/services/expenses";
import { getTripMemberRole, getTripMemberUids } from "@/services/trips";
import { POST } from "../route";
import { makePostRequest, VALID_BODY } from "./setup";

beforeEach(() => {
  vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
  vi.mocked(getTripMemberUids).mockResolvedValue(["uid-alice", "uid-bob"]);
  vi.mocked(addExpense).mockResolvedValue("exp-new");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/trips/[tripId]/expenses — basic validation", () => {
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
    const request = makePostRequest("uid-alice", null, "trip-1", {
      nullBody: true,
    });
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

  it.each([0, -5])("returns 400 when amount is %s", async (amount) => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      amount,
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("amount must be greater than 0");
  });

  it("returns 400 when currency is not an ISO-4217 code", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      currency: "FAKE",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("currency must be a valid ISO 4217 code");
  });

  it("returns 400 when category is not supported", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      category: "unknown",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("category must be a valid expense category");
  });

  it("returns 400 when splitMethod is not supported", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      splitMethod: "unknown",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("splitMethod must be a valid expense split method");
  });

  it("returns 400 when participantUids contains a non-string entry", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      participantUids: ["uid-alice", 123],
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("participantUids must be an array of strings");
    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });

  it("returns 400 when participantUids is empty", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      participantUids: [],
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("participantUids must include at least one member");
  });

  it("returns expenseId on success", async () => {
    const request = makePostRequest("uid-alice", VALID_BODY);
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);

    const body = (await response.json()) as { expenseId: string };
    expect(body.expenseId).toBe("exp-new");
  });

  it("calls addExpense with uid, tripId, and expense fields", async () => {
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
