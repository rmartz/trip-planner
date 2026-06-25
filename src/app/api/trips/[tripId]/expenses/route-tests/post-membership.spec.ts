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

import { addExpense } from "@/services/expenses";
import { getTripMemberRole, getTripMemberUids } from "@/services/trips";
import { POST } from "../route";
import { makePostRequest, VALID_BODY } from "./setup";

beforeEach(() => {
  vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
  vi.mocked(getTripMemberUids).mockResolvedValue(["uid-alice", "uid-bob"]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/trips/[tripId]/expenses — membership", () => {
  it("returns 403 when user is not a member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const request = makePostRequest("uid-stranger", VALID_BODY);
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(403);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Forbidden");
  });

  it("does not call addExpense for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const request = makePostRequest("uid-stranger", VALID_BODY);
    await POST(request, { params: Promise.resolve({ tripId: "trip-1" }) });

    expect(vi.mocked(addExpense)).not.toHaveBeenCalled();
  });

  it("returns 400 when payerUid is not a trip member", async () => {
    vi.mocked(getTripMemberUids).mockResolvedValue(["uid-alice", "uid-bob"]);
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      payerUid: "uid-stranger",
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("payerUid must be a trip member");
  });

  it("returns 400 when any participantUid is not a trip member", async () => {
    vi.mocked(getTripMemberUids).mockResolvedValue(["uid-alice"]);
    const request = makePostRequest("uid-alice", {
      ...VALID_BODY,
      participantUids: ["uid-alice", "uid-bob"],
    });
    const response = await POST(request, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("participantUids must all be trip members");
  });
});
