import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";

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

describe("POST /api/trips/[tripId]/expenses — linked entity", () => {
  it("returns 400 when linkedEntity.type is invalid", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      linkedEntity: {
        type: "unknown",
        entityId: "stop-1",
        label: "Main stop",
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe(
      "linkedEntity.type must be a valid linked entity type",
    );
  });

  it("returns 400 when linkedEntity is missing a required field", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      linkedEntity: {
        type: ExpenseLinkedEntityType.Stop,
        entityId: "stop-1",
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe(
      "linkedEntity must include type, entityId, and label strings",
    );
    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });

  it("returns 400 when linkedEntity is not an object", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      linkedEntity: "stop-1",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("linkedEntity must be an object");
    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });

  it("passes linkedEntity when type is supported", async () => {
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      linkedEntity: {
        type: ExpenseLinkedEntityType.Stop,
        entityId: "stop-1",
        label: "Main stop",
      },
    });
    await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(vi.mocked(addExpense)).toHaveBeenCalledWith(
      "uid-alice",
      "trip-1",
      expect.objectContaining({
        linkedEntity: {
          type: ExpenseLinkedEntityType.Stop,
          entityId: "stop-1",
          label: "Main stop",
        },
      }),
    );
  });
});
