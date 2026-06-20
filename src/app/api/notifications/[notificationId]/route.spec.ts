import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/notifications", () => ({
  markNotificationRead: vi.fn(),
}));

import { markNotificationRead } from "@/services/notifications";
import { PATCH } from "./route";

function makePatchRequest(uid: string | undefined) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/notifications/n-9", {
    method: "PATCH",
    headers,
  });
}

function makeParams(notificationId: string) {
  return { params: Promise.resolve({ notificationId }) };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/notifications/[notificationId]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await PATCH(
      makePatchRequest(undefined),
      makeParams("n-9"),
    );
    expect(response.status).toBe(401);
  });

  it("calls markNotificationRead with the uid and notificationId", async () => {
    vi.mocked(markNotificationRead).mockResolvedValue(undefined);
    await PATCH(makePatchRequest("uid-abc"), makeParams("n-9"));
    expect(vi.mocked(markNotificationRead)).toHaveBeenCalledWith(
      "uid-abc",
      "n-9",
    );
  });

  it("returns 200 on success", async () => {
    vi.mocked(markNotificationRead).mockResolvedValue(undefined);
    const response = await PATCH(
      makePatchRequest("uid-abc"),
      makeParams("n-9"),
    );
    expect(response.status).toBe(200);
  });
});
