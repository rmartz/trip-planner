import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { NotFoundError, PlannerOnlyError } from "@/services/errors";

vi.mock("@/services/members", () => ({
  promoteGuestToPlanner: vi.fn(),
  removeGuest: vi.fn(),
}));

import { promoteGuestToPlanner, removeGuest } from "@/services/members";
import { DELETE, PATCH } from "./route";

function makeRequest(
  method: string,
  uid: string | undefined,
  body?: unknown,
  tripId = "trip-1",
  memberId = "target-uid",
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest(
    `http://localhost/api/trips/${tripId}/members/${memberId}`,
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
  );
}

const PARAMS = { tripId: "trip-1", memberId: "target-uid" };

afterEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/trips/[tripId]/members/[memberId]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeRequest("PATCH", undefined, { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(401);
  });

  it("returns 400 when action is not 'promote'", async () => {
    const request = makeRequest("PATCH", "planner-uid", { action: "unknown" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(400);
  });

  it("returns 403 when promoteGuestToPlanner throws PlannerOnlyError", async () => {
    vi.mocked(promoteGuestToPlanner).mockRejectedValue(
      new PlannerOnlyError("Only Planners can promote members"),
    );

    const request = makeRequest("PATCH", "guest-uid", { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(403);
  });

  it("returns 403 for PlannerOnlyError regardless of message wording", async () => {
    vi.mocked(promoteGuestToPlanner).mockRejectedValue(
      new PlannerOnlyError("authorization failure"),
    );

    const request = makeRequest("PATCH", "guest-uid", { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(403);
  });

  it("returns 404 when target member not found", async () => {
    vi.mocked(promoteGuestToPlanner).mockRejectedValue(
      new NotFoundError("Target member not found or is not a Guest"),
    );

    const request = makeRequest("PATCH", "planner-uid", { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 for NotFoundError regardless of message wording", async () => {
    vi.mocked(promoteGuestToPlanner).mockRejectedValue(
      new NotFoundError("entity missing"),
    );

    const request = makeRequest("PATCH", "planner-uid", { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(404);
  });

  it("returns 200 and calls promoteGuestToPlanner on success", async () => {
    vi.mocked(promoteGuestToPlanner).mockResolvedValue(undefined);

    const request = makeRequest("PATCH", "planner-uid", { action: "promote" });
    const response = await PATCH(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(200);
    expect(vi.mocked(promoteGuestToPlanner)).toHaveBeenCalledWith(
      "planner-uid",
      "trip-1",
      "target-uid",
    );
  });
});

describe("DELETE /api/trips/[tripId]/members/[memberId]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const request = makeRequest("DELETE", undefined);
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(401);
  });

  it("returns 403 when removeGuest throws PlannerOnlyError", async () => {
    vi.mocked(removeGuest).mockRejectedValue(
      new PlannerOnlyError("Only Planners can remove members"),
    );

    const request = makeRequest("DELETE", "guest-uid");
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(403);
  });

  it("returns 403 for PlannerOnlyError regardless of message wording", async () => {
    vi.mocked(removeGuest).mockRejectedValue(
      new PlannerOnlyError("authorization failure"),
    );

    const request = makeRequest("DELETE", "guest-uid");
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(403);
  });

  it("returns 404 when target member not found or not a Guest", async () => {
    vi.mocked(removeGuest).mockRejectedValue(
      new NotFoundError("Target member not found or is not a Guest"),
    );

    const request = makeRequest("DELETE", "planner-uid");
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 for NotFoundError regardless of message wording", async () => {
    vi.mocked(removeGuest).mockRejectedValue(
      new NotFoundError("entity missing"),
    );

    const request = makeRequest("DELETE", "planner-uid");
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(404);
  });

  it("returns 200 and calls removeGuest on success", async () => {
    vi.mocked(removeGuest).mockResolvedValue(undefined);

    const request = makeRequest("DELETE", "planner-uid");
    const response = await DELETE(request, {
      params: Promise.resolve(PARAMS),
    });
    expect(response.status).toBe(200);
    expect(vi.mocked(removeGuest)).toHaveBeenCalledWith(
      "planner-uid",
      "trip-1",
      "target-uid",
    );
  });
});
