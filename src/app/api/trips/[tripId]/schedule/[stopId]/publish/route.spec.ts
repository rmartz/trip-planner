import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/schedule", async () => {
  const actual = await vi.importActual<typeof import("@/services/schedule")>(
    "@/services/schedule",
  );
  return { ...actual, publishSchedule: vi.fn() };
});

import {
  publishSchedule,
  PublishScheduleForbiddenError,
} from "@/services/schedule";
import { POST } from "./route";

function makeRequest(
  uid: string | undefined,
  body: unknown,
  options: { malformedJson?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(
    "http://localhost/api/trips/trip-1/schedule/stop-1/publish",
    {
      method: "POST",
      headers,
      body: options.malformedJson ? "not-json" : JSON.stringify(body),
    },
  );
}

const params = Promise.resolve({ tripId: "trip-1", stopId: "stop-1" });

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/trips/[tripId]/schedule/[stopId]/publish", () => {
  it("returns 401 when the user header is absent", async () => {
    const response = await POST(makeRequest(undefined, {}), { params });
    expect(response.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(
      makeRequest("uid-1", {}, { malformedJson: true }),
      {
        params,
      },
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when orderedActivityIds is not an array of strings", async () => {
    const response = await POST(
      makeRequest("uid-1", { orderedActivityIds: [1, 2] }),
      { params },
    );
    expect(response.status).toBe(400);
  });

  it("returns 403 when the service rejects a non-Planner", async () => {
    vi.mocked(publishSchedule).mockRejectedValueOnce(
      new PublishScheduleForbiddenError(),
    );
    const response = await POST(
      makeRequest("guest-1", { orderedActivityIds: ["activity-a"] }),
      { params },
    );
    expect(response.status).toBe(403);
  });

  it("publishes and returns the published status on success", async () => {
    vi.mocked(publishSchedule).mockResolvedValueOnce(undefined);
    const response = await POST(
      makeRequest("planner-1", {
        orderedActivityIds: ["activity-b", "activity-a"],
      }),
      { params },
    );
    expect(response.status).toBe(200);
    expect(publishSchedule).toHaveBeenCalledWith(
      "planner-1",
      "trip-1",
      "stop-1",
      ["activity-b", "activity-a"],
    );
  });
});
