import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationType } from "@/lib/types/notification";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDatabase: vi.fn(),
  getAdminFirestore: vi.fn(),
}));

import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { writeNotificationsForLodgingOffer } from "../notify-offer";

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

function setupFirestoreMock() {
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
      if (name === "users") return { doc: userDoc };
      return {};
    }),
  };
  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );

  return { batch, batchCommit, batchSetCalls, userDoc };
}

describe("writeNotificationsForLodgingOffer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDatabaseMock();
  });

  it("writes no notifications when no guests are newly invited", async () => {
    const { batch } = setupFirestoreMock();

    await writeNotificationsForLodgingOffer("trip-1", "Reykjavik", []);

    expect(batch).not.toHaveBeenCalled();
  });

  it("writes one notification per newly invited guest", async () => {
    const { userDoc } = setupFirestoreMock();

    await writeNotificationsForLodgingOffer("trip-1", "Reykjavik", [
      "guest-a",
      "guest-b",
    ]);

    expect(userDoc).toHaveBeenCalledTimes(2);
    expect(userDoc).toHaveBeenCalledWith("guest-a");
    expect(userDoc).toHaveBeenCalledWith("guest-b");
  });

  it("writes notification + unread count in the same batch with merge", async () => {
    const { batch, batchCommit, batchSetCalls } = setupFirestoreMock();

    await writeNotificationsForLodgingOffer("trip-1", "Reykjavik", ["guest-a"]);

    expect(batch).toHaveBeenCalledTimes(1);
    expect(batchCommit).toHaveBeenCalledTimes(1);
    expect(batchSetCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            title: "Reykjavik",
            tripId: "trip-1",
            triggerType: NotificationType.LodgingOffer,
            type: NotificationType.LodgingOffer,
          }),
        ]),
        expect.arrayContaining([
          expect.objectContaining({ id: "guest-a" }),
          expect.objectContaining({ unreadCount: expect.anything() }),
          { merge: true },
        ]),
      ]),
    );
  });

  it("mirrors the unread count increment to the RTDB path for each guest", async () => {
    setupFirestoreMock();
    const { setCalls } = setupDatabaseMock();

    await writeNotificationsForLodgingOffer("trip-1", "Reykjavik", [
      "guest-a",
      "guest-b",
    ]);

    expect(setCalls.map((call) => call.path)).toEqual(
      expect.arrayContaining([
        "users/guest-a/unreadCount",
        "users/guest-b/unreadCount",
      ]),
    );
  });
});
