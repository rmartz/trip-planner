import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationType } from "@/lib/types/notification";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDatabase: vi.fn(),
  getAdminFirestore: vi.fn(),
}));

import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications";

interface NotificationDocSeed {
  createdAtMs: number;
  notificationId: string;
  read: boolean;
  title: string;
  tripId: string;
  type: NotificationType;
}

function makeFirestoreMock(seeds: NotificationDocSeed[]) {
  const updateCalls: { id: string; data: unknown }[] = [];
  const userUpdateCalls: unknown[] = [];
  const readIds = new Set(
    seeds.filter((seed) => seed.read).map((seed) => seed.notificationId),
  );

  const notificationDocs = seeds.map((seed) => ({
    id: seed.notificationId,
    data: () => ({
      createdAt: { toDate: () => new Date(seed.createdAtMs) },
      read: seed.read,
      title: seed.title,
      tripId: seed.tripId,
      triggerType: seed.type,
      type: seed.type,
      uid: "uid-1",
    }),
    ref: {
      update: (data: unknown) => {
        readIds.add(seed.notificationId);
        updateCalls.push({ id: seed.notificationId, data });
        return Promise.resolve();
      },
    },
  }));

  const notificationDoc = vi.fn((id: string) => ({
    update: (data: unknown) => {
      readIds.add(id);
      updateCalls.push({ id, data });
      return Promise.resolve();
    },
  }));

  const batchUpdateCalls: unknown[][] = [];
  const batchCommit = vi.fn().mockResolvedValue(undefined);
  const batch = vi.fn(() => ({
    update: (...args: unknown[]) => {
      batchUpdateCalls.push(args);
    },
    commit: batchCommit,
  }));

  const orderedGet = vi.fn().mockResolvedValue({ docs: notificationDocs });
  const unreadGet = vi.fn(() =>
    Promise.resolve({
      docs: notificationDocs.filter((doc) => !readIds.has(doc.id)),
    }),
  );

  const notificationsCollection = {
    doc: notificationDoc,
    orderBy: vi.fn(() => ({ get: orderedGet })),
    where: vi.fn(() => ({ get: unreadGet })),
  };

  const userDocRef = {
    collection: vi.fn((name: string) =>
      name === "notifications" ? notificationsCollection : {},
    ),
    update: (data: unknown) => {
      userUpdateCalls.push(data);
      return Promise.resolve();
    },
  };

  const db = {
    batch,
    collection: vi.fn((name: string) =>
      name === "users" ? { doc: vi.fn(() => userDocRef) } : {},
    ),
  };

  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );

  return { batchUpdateCalls, updateCalls, userUpdateCalls };
}

function makeDatabaseMock() {
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNotificationsForUser — reads the user's notification subcollection", () => {
  it("maps Firestore docs into domain Notification records", async () => {
    makeFirestoreMock([
      {
        createdAtMs: Date.UTC(2026, 4, 11, 10, 0, 0),
        notificationId: "n-1",
        read: false,
        title: "Invited to Iceland",
        tripId: "trip-7",
        type: NotificationType.TripInvite,
      },
    ]);

    const result = await getNotificationsForUser("uid-1");

    expect(result).toHaveLength(1);
    expect(result[0]?.notificationId).toBe("n-1");
    expect(result[0]?.title).toBe("Invited to Iceland");
    expect(result[0]?.tripId).toBe("trip-7");
    expect(result[0]?.type).toBe(NotificationType.TripInvite);
    expect(result[0]?.createdAt.getTime()).toBe(
      Date.UTC(2026, 4, 11, 10, 0, 0),
    );
  });
});

describe("markNotificationRead — persists read state and decrements unread count", () => {
  it("updates the notification's read field to true", async () => {
    const { updateCalls } = makeFirestoreMock([
      {
        createdAtMs: Date.UTC(2026, 4, 11, 10, 0, 0),
        notificationId: "n-9",
        read: false,
        title: "Leg removed",
        tripId: "trip-1",
        type: NotificationType.LegRemoved,
      },
    ]);
    makeDatabaseMock();

    await markNotificationRead("uid-1", "n-9");

    expect(updateCalls).toContainEqual({ id: "n-9", data: { read: true } });
  });

  it("mirrors the recomputed unread count to the RTDB path", async () => {
    makeFirestoreMock([
      {
        createdAtMs: Date.UTC(2026, 4, 11, 10, 0, 0),
        notificationId: "n-9",
        read: false,
        title: "Leg removed",
        tripId: "trip-1",
        type: NotificationType.LegRemoved,
      },
      {
        createdAtMs: Date.UTC(2026, 4, 10, 10, 0, 0),
        notificationId: "n-10",
        read: false,
        title: "Another",
        tripId: "trip-1",
        type: NotificationType.VoteReceived,
      },
    ]);
    const { setCalls } = makeDatabaseMock();

    await markNotificationRead("uid-1", "n-9");

    expect(setCalls).toContainEqual({
      path: "users/uid-1/unreadCount",
      value: 1,
    });
  });
});

describe("markAllNotificationsRead — clears all unread notifications", () => {
  it("zeroes the RTDB unread count", async () => {
    makeFirestoreMock([
      {
        createdAtMs: Date.UTC(2026, 4, 11, 10, 0, 0),
        notificationId: "n-1",
        read: false,
        title: "One",
        tripId: "trip-1",
        type: NotificationType.TripInvite,
      },
      {
        createdAtMs: Date.UTC(2026, 4, 10, 10, 0, 0),
        notificationId: "n-2",
        read: false,
        title: "Two",
        tripId: "trip-1",
        type: NotificationType.VoteReceived,
      },
    ]);
    const { setCalls } = makeDatabaseMock();

    await markAllNotificationsRead("uid-1");

    expect(setCalls).toContainEqual({
      path: "users/uid-1/unreadCount",
      value: 0,
    });
  });

  it("batches a read update for each unread notification", async () => {
    const { batchUpdateCalls } = makeFirestoreMock([
      {
        createdAtMs: Date.UTC(2026, 4, 11, 10, 0, 0),
        notificationId: "n-1",
        read: false,
        title: "One",
        tripId: "trip-1",
        type: NotificationType.TripInvite,
      },
      {
        createdAtMs: Date.UTC(2026, 4, 10, 10, 0, 0),
        notificationId: "n-2",
        read: false,
        title: "Two",
        tripId: "trip-1",
        type: NotificationType.VoteReceived,
      },
    ]);
    makeDatabaseMock();

    await markAllNotificationsRead("uid-1");

    expect(batchUpdateCalls).toHaveLength(2);
  });
});
