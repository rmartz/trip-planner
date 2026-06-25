import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationType } from "@/lib/types/notification";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDatabase: vi.fn(),
  getAdminFirestore: vi.fn(),
}));

import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { writeNotificationsForLegDeletion } from "../legs";

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
  rolesByUid = {},
  transportationUids = [],
}: {
  rolesByUid?: Record<string, TripRole>;
  transportationUids?: string[];
}) {
  const whereGet = vi.fn().mockResolvedValue({
    docs: transportationUids.map((uid) => ({ data: () => ({ uid }) })),
  });
  const memberGet = vi.fn((uid: string) =>
    Promise.resolve({
      id: uid,
      data: () => ({ role: rolesByUid[uid] ?? TripRole.Guest }),
    }),
  );
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

  const tripDoc = {
    collection: vi.fn((name: string) => {
      if (name === "transportation")
        return { where: vi.fn(() => ({ get: whereGet })) };
      if (name === "members")
        return { doc: (uid: string) => ({ get: () => memberGet(uid) }) };
      return {};
    }),
  };
  const db = {
    batch,
    collection: vi.fn((name: string) => {
      if (name === "trips") return { doc: vi.fn(() => tripDoc) };
      if (name === "users") return { doc: userDoc };
      return {};
    }),
  };
  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );

  return { batch, batchCommit, batchSetCalls, userDoc };
}

describe("writeNotificationsForLegDeletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDatabaseMock();
  });

  it("writes no notifications when no transportation entries reference the leg", async () => {
    const { batch } = setupFirestoreMock({ transportationUids: [] });

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(batch).not.toHaveBeenCalled();
  });

  it("writes one notification per unique affected guest", async () => {
    const { userDoc } = setupFirestoreMock({
      transportationUids: ["guest-a", "guest-a", "guest-b"],
    });

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(userDoc).toHaveBeenCalledTimes(2);
    expect(userDoc).toHaveBeenCalledWith("guest-a");
    expect(userDoc).toHaveBeenCalledWith("guest-b");
  });

  it("writes notifications only for guests", async () => {
    const { userDoc } = setupFirestoreMock({
      rolesByUid: {
        "uid-guest": TripRole.Guest,
        "uid-planner": TripRole.Planner,
      },
      transportationUids: ["uid-guest", "uid-planner"],
    });

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(userDoc).toHaveBeenCalledTimes(1);
    expect(userDoc).toHaveBeenCalledWith("uid-guest");
  });

  it("writes notification + unread count in the same batch with merge", async () => {
    const { batch, batchCommit, batchSetCalls } = setupFirestoreMock({
      transportationUids: ["guest-a", "guest-b"],
    });

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(batch).toHaveBeenCalledTimes(2);
    expect(batchCommit).toHaveBeenCalledTimes(2);
    expect(batchSetCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            title: "Lyon → Marseille",
            tripId: "trip-1",
            triggerType: NotificationType.LegRemoved,
            type: NotificationType.LegRemoved,
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
    setupFirestoreMock({ transportationUids: ["guest-a", "guest-b"] });
    const { setCalls } = setupDatabaseMock();

    await writeNotificationsForLegDeletion(
      "trip-1",
      "leg-1",
      "Lyon → Marseille",
    );

    expect(setCalls.map((call) => call.path)).toEqual(
      expect.arrayContaining([
        "users/guest-a/unreadCount",
        "users/guest-b/unreadCount",
      ]),
    );
  });
});
