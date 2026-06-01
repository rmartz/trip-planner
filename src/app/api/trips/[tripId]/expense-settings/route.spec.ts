import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  ExpenseSettingsCategory,
  ExpenseUnitModel,
} from "@/lib/types/expense-settings";
import type { ExpenseSettingsMap } from "@/lib/types/expense-settings";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/expense-settings", () => ({
  getExpenseSettings: vi.fn(),
  setExpenseSettings: vi.fn(),
}));

vi.mock("@/services/trips", () => ({
  getTripMemberRole: vi.fn(),
}));

import {
  getExpenseSettings,
  setExpenseSettings,
} from "@/services/expense-settings";
import { getTripMemberRole } from "@/services/trips";
import { GET, POST } from "./route";

const STUB_SETTINGS: ExpenseSettingsMap = {
  [ExpenseSettingsCategory.Activities]: {
    unitModel: ExpenseUnitModel.UsageShare,
    defaultParticipantMemberIds: [],
  },
  [ExpenseSettingsCategory.Food]: {
    unitModel: ExpenseUnitModel.SharedBucket,
    defaultParticipantMemberIds: ["uid-a"],
  },
  [ExpenseSettingsCategory.Lodging]: {
    unitModel: ExpenseUnitModel.PerUnit,
    defaultParticipantMemberIds: [],
  },
  [ExpenseSettingsCategory.Other]: {
    unitModel: ExpenseUnitModel.SharedBucket,
    defaultParticipantMemberIds: [],
  },
  [ExpenseSettingsCategory.Transport]: {
    unitModel: ExpenseUnitModel.UsageShare,
    defaultParticipantMemberIds: [],
  },
};

function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    `http://localhost/api/trips/${tripId}/expense-settings`,
    { headers },
  );
}

function makePostRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    `http://localhost/api/trips/${tripId}/expense-settings`,
    {
      method: "POST",
      headers,
      body: options.malformedJson ? "not-json" : JSON.stringify(body),
    },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/trips/[tripId]/expense-settings", () => {
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

  it("does not call getExpenseSettings for non-members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    await GET(makeGetRequest("uid-stranger"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(getExpenseSettings)).not.toHaveBeenCalled();
  });

  it("returns 200 with settings for trip members", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);
    vi.mocked(getExpenseSettings).mockResolvedValue(STUB_SETTINGS);

    const response = await GET(makeGetRequest("uid-guest"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { categories: ExpenseSettingsMap };
    expect(body.categories).toBeDefined();
  });

  it("calls getExpenseSettings with the correct tripId", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getExpenseSettings).mockResolvedValue(STUB_SETTINGS);

    await GET(makeGetRequest("uid-planner", "trip-abc"), {
      params: Promise.resolve({ tripId: "trip-abc" }),
    });
    expect(vi.mocked(getExpenseSettings)).toHaveBeenCalledWith("trip-abc");
  });

  it("includes food unitModel in the response", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(getExpenseSettings).mockResolvedValue(STUB_SETTINGS);

    const response = await GET(makeGetRequest("uid-planner"), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    const body = (await response.json()) as { categories: ExpenseSettingsMap };
    expect(body.categories[ExpenseSettingsCategory.Food].unitModel).toBe(
      ExpenseUnitModel.SharedBucket,
    );
  });
});

describe("POST /api/trips/[tripId]/expense-settings", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await POST(makePostRequest(undefined, {}), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(
      makePostRequest("uid-1", {}, "trip-1", { malformedJson: true }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 403 when user is not a trip member", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(undefined);

    const response = await POST(
      makePostRequest("uid-stranger", { categories: STUB_SETTINGS }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(403);
  });

  it("returns 403 when user is a Guest (Planner-only write)", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);

    const response = await POST(
      makePostRequest("uid-guest", { categories: STUB_SETTINGS }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(403);
  });

  it("does not call setExpenseSettings for Guests", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Guest);

    await POST(makePostRequest("uid-guest", { categories: STUB_SETTINGS }), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(vi.mocked(setExpenseSettings)).not.toHaveBeenCalled();
  });

  it("returns 200 for Planners with valid payload", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(setExpenseSettings).mockResolvedValue(undefined);

    const response = await POST(
      makePostRequest("uid-planner", { categories: STUB_SETTINGS }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(200);
  });

  it("calls setExpenseSettings with tripId and categories", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(setExpenseSettings).mockResolvedValue(undefined);

    await POST(makePostRequest("uid-planner", { categories: STUB_SETTINGS }), {
      params: Promise.resolve({ tripId: "trip-xyz" }),
    });
    expect(vi.mocked(setExpenseSettings)).toHaveBeenCalledWith(
      "trip-xyz",
      STUB_SETTINGS,
    );
  });

  it("returns 400 when categories field is missing", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(makePostRequest("uid-planner", {}), {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 when categories is a string", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", { categories: "a string" }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when categories is an array", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", { categories: [] }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when categories contains an unknown key", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", {
        categories: { ...STUB_SETTINGS, unknownCategory: {} },
      }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when a category entry has an invalid unitModel", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", {
        categories: {
          ...STUB_SETTINGS,
          [ExpenseSettingsCategory.Food]: {
            unitModel: null,
            defaultParticipantMemberIds: [],
          },
        },
      }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when a category entry has a non-array defaultParticipantMemberIds", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", {
        categories: {
          ...STUB_SETTINGS,
          [ExpenseSettingsCategory.Food]: {
            unitModel: ExpenseUnitModel.SharedBucket,
            defaultParticipantMemberIds: "not-an-array",
          },
        },
      }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when defaultParticipantMemberIds contains a non-string element", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);

    const response = await POST(
      makePostRequest("uid-planner", {
        categories: {
          ...STUB_SETTINGS,
          [ExpenseSettingsCategory.Food]: {
            unitModel: ExpenseUnitModel.SharedBucket,
            defaultParticipantMemberIds: [42],
          },
        },
      }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 200 when defaultParticipantMemberIds is null", async () => {
    vi.mocked(getTripMemberRole).mockResolvedValue(TripRole.Planner);
    vi.mocked(setExpenseSettings).mockResolvedValue(undefined);

    const response = await POST(
      makePostRequest("uid-planner", {
        categories: {
          ...STUB_SETTINGS,
          [ExpenseSettingsCategory.Food]: {
            unitModel: ExpenseUnitModel.SharedBucket,
            defaultParticipantMemberIds: null,
          },
        },
      }),
      { params: Promise.resolve({ tripId: "trip-1" }) },
    );
    expect(response.status).toBe(200);
  });
});
