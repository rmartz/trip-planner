import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/notifications", () => ({
  markAllNotificationsRead: vi.fn(),
}));

import { markAllNotificationsRead } from "@/services/notifications";
import { POST } from "./route";

function makePostRequest(uid: string | undefined) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/notifications/mark-all-read", {
    method: "POST",
    headers,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/notifications/mark-all-read", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await POST(makePostRequest(undefined));
    expect(response.status).toBe(401);
  });

  it("calls markAllNotificationsRead with the uid", async () => {
    vi.mocked(markAllNotificationsRead).mockResolvedValue(undefined);
    await POST(makePostRequest("uid-abc"));
    expect(vi.mocked(markAllNotificationsRead)).toHaveBeenCalledWith("uid-abc");
  });

  it("returns 200 on success", async () => {
    vi.mocked(markAllNotificationsRead).mockResolvedValue(undefined);
    const response = await POST(makePostRequest("uid-abc"));
    expect(response.status).toBe(200);
  });
});
