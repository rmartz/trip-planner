import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/notifications", () => ({
  getNotificationsForUser: vi.fn(),
}));

import { getNotificationsForUser } from "@/services/notifications";
import { GET } from "./route";

const CREATED_AT = "2026-05-11T10:00:00.000Z";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    createdAt: new Date(CREATED_AT),
    notificationId: "n-1",
    read: false,
    title: "Invited to Iceland",
    tripId: "trip-7",
    triggerType: NotificationType.TripInvite,
    type: NotificationType.TripInvite,
    uid: "uid-abc",
    ...overrides,
  };
}

function makeGetRequest(uid: string | undefined) {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest("http://localhost/api/notifications", { headers });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/notifications", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await GET(makeGetRequest(undefined));
    expect(response.status).toBe(401);
  });

  it("calls getNotificationsForUser with the uid from the header", async () => {
    vi.mocked(getNotificationsForUser).mockResolvedValue([]);
    await GET(makeGetRequest("uid-xyz"));
    expect(vi.mocked(getNotificationsForUser)).toHaveBeenCalledWith("uid-xyz");
  });

  it("serializes createdAt as a full ISO timestamp", async () => {
    vi.mocked(getNotificationsForUser).mockResolvedValue([makeNotification()]);
    const response = await GET(makeGetRequest("uid-abc"));
    expect(response.status).toBe(200);
    const data = (await response.json()) as Record<string, unknown>[];
    expect(data[0]?.["createdAt"]).toBe(CREATED_AT);
  });

  it("preserves the notification type in the response", async () => {
    vi.mocked(getNotificationsForUser).mockResolvedValue([
      makeNotification({ type: NotificationType.LegRemoved }),
    ]);
    const response = await GET(makeGetRequest("uid-abc"));
    const data = (await response.json()) as Record<string, unknown>[];
    expect(data[0]?.["type"]).toBe(NotificationType.LegRemoved);
  });
});
