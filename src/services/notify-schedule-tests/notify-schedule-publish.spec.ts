import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationType } from "@/lib/types/notification";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDatabase: vi.fn(),
  getAdminFirestore: vi.fn(),
}));

import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { writeNotificationsForSchedulePublish } from "../notify-schedule";

interface StopFixture {
  name: string;
  memberUids: string[];
}

interface MemberFixture {
  role: TripRole;
}

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

function setupFirestoreMock(
  stop: StopFixture,
  membersByUid: Record<string, MemberFixture>,
) {
  const notificationDoc = vi.fn(() => ({ id: "notification-id" }));
  const userDoc = vi.fn((uid: string) => ({
    collection: vi.fn((name: string) => {
      if (name === "notifications") return { doc: notificationDoc };
      return {};
    }),
    id: uid,
  }));

  const stopDoc = vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ data: () => stop }),
  }));
  const memberDoc = vi.fn((uid: string) => ({
    get: vi.fn().mockResolvedValue({ data: () => membersByUid[uid], id: uid }),
  }));
  const tripDoc = vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === "stops") return { doc: stopDoc };
      if (name === "members") return { doc: memberDoc };
      return {};
    }),
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
      if (name === "trips") return { doc: tripDoc };
      return {};
    }),
  };
  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );

  return { batch, batchCommit, batchSetCalls, userDoc };
}

describe("writeNotificationsForSchedulePublish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDatabaseMock();
  });

  it("writes one notification per attending guest", async () => {
    const { userDoc } = setupFirestoreMock(
      { memberUids: ["planner-1", "guest-a", "guest-b"], name: "Reykjavik" },
      {
        "guest-a": { role: TripRole.Guest },
        "guest-b": { role: TripRole.Guest },
        "planner-1": { role: TripRole.Planner },
      },
    );

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(userDoc).toHaveBeenCalledTimes(2);
    expect(userDoc).toHaveBeenCalledWith("guest-a");
    expect(userDoc).toHaveBeenCalledWith("guest-b");
  });

  it("does not notify the publishing planner", async () => {
    const { userDoc } = setupFirestoreMock(
      { memberUids: ["planner-1", "guest-a"], name: "Reykjavik" },
      {
        "guest-a": { role: TripRole.Guest },
        "planner-1": { role: TripRole.Planner },
      },
    );

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(userDoc).not.toHaveBeenCalledWith("planner-1");
  });

  it("excludes attendees whose role is not Guest", async () => {
    const { userDoc } = setupFirestoreMock(
      { memberUids: ["planner-1", "planner-2", "guest-a"], name: "Reykjavik" },
      {
        "guest-a": { role: TripRole.Guest },
        "planner-1": { role: TripRole.Planner },
        "planner-2": { role: TripRole.Planner },
      },
    );

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(userDoc).toHaveBeenCalledTimes(1);
    expect(userDoc).toHaveBeenCalledWith("guest-a");
  });

  it("writes no notifications when the stop has no attending guests", async () => {
    const { batch } = setupFirestoreMock(
      { memberUids: ["planner-1"], name: "Reykjavik" },
      { "planner-1": { role: TripRole.Planner } },
    );

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(batch).not.toHaveBeenCalled();
  });

  it("writes the schedule-published notification with the stop name and trip", async () => {
    const { batchSetCalls } = setupFirestoreMock(
      { memberUids: ["planner-1", "guest-a"], name: "Reykjavik" },
      {
        "guest-a": { role: TripRole.Guest },
        "planner-1": { role: TripRole.Planner },
      },
    );

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(batchSetCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            title: "Reykjavik",
            tripId: "trip-1",
            triggerType: NotificationType.SchedulePublished,
            type: NotificationType.SchedulePublished,
            uid: "guest-a",
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
    setupFirestoreMock(
      { memberUids: ["planner-1", "guest-a", "guest-b"], name: "Reykjavik" },
      {
        "guest-a": { role: TripRole.Guest },
        "guest-b": { role: TripRole.Guest },
        "planner-1": { role: TripRole.Planner },
      },
    );
    const { setCalls } = setupDatabaseMock();

    await writeNotificationsForSchedulePublish("planner-1", "trip-1", "stop-1");

    expect(setCalls.map((call) => call.path)).toEqual(
      expect.arrayContaining([
        "users/guest-a/unreadCount",
        "users/guest-b/unreadCount",
      ]),
    );
  });
});
