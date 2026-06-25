import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationType } from "@/lib/types/notification";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDatabase: vi.fn(),
  getAdminFirestore: vi.fn(),
}));

import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { writeNotificationForTripInvite } from "../invite";

function setupDatabaseMock() {
  const setCalls: { path: string; value: unknown }[] = [];
  const ref = vi.fn((path: string) => ({
    set: (value: unknown) => {
      setCalls.push({ path, value });
      return Promise.resolve();
    },
  }));
  vi.mocked(getAdminDatabase).mockReturnValue({ ref } as unknown as ReturnType<
    typeof getAdminDatabase
  >);
  return { setCalls };
}

function setupFirestoreMock({
  tripName = "Iceland Ring Road",
}: {
  tripName?: string;
}) {
  const tripGet = vi
    .fn()
    .mockResolvedValue({ data: () => ({ name: tripName }) });
  const notificationDoc = vi.fn(() => ({ id: "notification-id" }));
  const userDoc = vi.fn((uid: string) => ({
    collection: vi.fn((name: string) => {
      if (name === "notifications") return { doc: notificationDoc };
      return {};
    }),
    id: uid,
  }));

  const batchSetCalls: unknown[][] = [];
  const batchCommit = vi.fn().mockResolvedValue(undefined);
  const batch = vi.fn(() => ({
    set: (...args: unknown[]) => {
      batchSetCalls.push(args);
    },
    commit: batchCommit,
  }));

  const db = {
    batch,
    collection: vi.fn((name: string) => {
      if (name === "trips") return { doc: vi.fn(() => ({ get: tripGet })) };
      if (name === "users") return { doc: userDoc };
      return {};
    }),
  };
  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );

  return { batch, batchCommit, batchSetCalls, userDoc };
}

describe("writeNotificationForTripInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDatabaseMock();
  });

  it("writes the notification for the accepting user with the trip name as title", async () => {
    const { batchSetCalls, userDoc } = setupFirestoreMock({
      tripName: "Iceland Ring Road",
    });

    await writeNotificationForTripInvite("trip-1", "guest-a");

    expect(userDoc).toHaveBeenCalledTimes(1);
    expect(userDoc).toHaveBeenCalledWith("guest-a");
    expect(batchSetCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            title: "Iceland Ring Road",
            tripId: "trip-1",
            triggerType: NotificationType.TripInvite,
            type: NotificationType.TripInvite,
            uid: "guest-a",
          }),
        ]),
      ]),
    );
  });

  it("writes notification + unread count in the same batch with merge", async () => {
    const { batch, batchCommit, batchSetCalls } = setupFirestoreMock({
      tripName: "Iceland Ring Road",
    });

    await writeNotificationForTripInvite("trip-1", "guest-a");

    expect(batch).toHaveBeenCalledTimes(1);
    expect(batchCommit).toHaveBeenCalledTimes(1);
    expect(batchSetCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ id: "guest-a" }),
          expect.objectContaining({ unreadCount: expect.anything() }),
          { merge: true },
        ]),
      ]),
    );
  });

  it("mirrors the unread count increment to the RTDB path for the user", async () => {
    setupFirestoreMock({ tripName: "Iceland Ring Road" });
    const { setCalls } = setupDatabaseMock();

    await writeNotificationForTripInvite("trip-1", "guest-a");

    expect(setCalls.map((call) => call.path)).toEqual([
      "users/guest-a/unreadCount",
    ]);
  });
});
