import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";
import { TripRole } from "@/lib/types/trip";

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

describe("POST /api/trips/[tripId]/expenses — unit model override", () => {
  it("passes a valid unitModel override to addExpense", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      unitModel: ExpenseUnitModel.PerUnit,
    });
    await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(vi.mocked(addExpense)).toHaveBeenCalledWith(
      "uid-alice",
      "trip-1",
      expect.objectContaining({ unitModel: ExpenseUnitModel.PerUnit }),
    );
  });

  it("omits unitModel from addExpense input when absent", async () => {
    const request = makePostRequest("uid-alice", { ...VALID_BODY });
    await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    const input = vi.mocked(addExpense).mock.calls[0]?.[2];
    expect(input !== undefined && "unitModel" in input).toBe(false);
  });

  it("returns 400 when unitModel is not a valid model", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      unitModel: "not_a_model",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("unitModel must be a valid expense unit model");
    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });
});
