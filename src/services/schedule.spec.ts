import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("./notify-schedule", () => ({
  writeNotificationsForSchedulePublish: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { publishSchedule, PublishScheduleForbiddenError } from "./schedule";
import { writeNotificationsForSchedulePublish } from "./notify-schedule";

interface StopState {
  scheduleStatus?: string;
}

function setupFirestoreMock(
  memberRole: TripRole | undefined,
  stopState: StopState,
) {
  const transactionUpdate = vi.fn();
  const transaction = {
    get: vi.fn().mockResolvedValue({ data: () => stopState }),
    update: transactionUpdate,
  };
  const stopDoc = vi.fn(() => ({}));
  const memberDoc = vi.fn(() => ({
    get: vi.fn().mockResolvedValue({
      data: () => (memberRole ? { role: memberRole } : undefined),
      exists: memberRole !== undefined,
    }),
  }));
  const tripDoc = vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === "stops") return { doc: stopDoc };
      if (name === "members") return { doc: memberDoc };
      return {};
    }),
  }));
  const db = {
    collection: vi.fn((name: string) => {
      if (name === "trips") return { doc: tripDoc };
      return {};
    }),
    runTransaction: vi.fn(
      async (callback: (tx: typeof transaction) => Promise<boolean>) =>
        callback(transaction),
    ),
  };
  vi.mocked(getAdminFirestore).mockReturnValue(
    db as unknown as ReturnType<typeof getAdminFirestore>,
  );
  return { stopUpdate: transactionUpdate };
}

describe("publishSchedule persists the published schedule and transitions status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes the ordered activity ids and a published status", async () => {
    const { stopUpdate } = setupFirestoreMock(TripRole.Planner, {
      scheduleStatus: "draft",
    });

    await publishSchedule("planner-1", "trip-1", "stop-1", [
      "activity-b",
      "activity-a",
    ]);

    const [, updates] = stopUpdate.mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(updates["scheduleActivityOrder"]).toEqual([
      "activity-b",
      "activity-a",
    ]);
    expect(updates["scheduleStatus"]).toBe("published");
  });
});

describe("publishSchedule restricts publishing to Planners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the actor is a Guest", async () => {
    setupFirestoreMock(TripRole.Guest, { scheduleStatus: "draft" });

    await expect(
      publishSchedule("guest-1", "trip-1", "stop-1", ["activity-a"]),
    ).rejects.toThrow(PublishScheduleForbiddenError);
  });

  it("throws when the actor is not a member", async () => {
    setupFirestoreMock(undefined, { scheduleStatus: "draft" });

    await expect(
      publishSchedule("stranger-1", "trip-1", "stop-1", ["activity-a"]),
    ).rejects.toThrow(PublishScheduleForbiddenError);
  });
});

describe("publishSchedule notifies only on the unpublished to published transition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invokes the notification producer when transitioning from draft", async () => {
    setupFirestoreMock(TripRole.Planner, { scheduleStatus: "draft" });

    await publishSchedule("planner-1", "trip-1", "stop-1", ["activity-a"]);

    expect(writeNotificationsForSchedulePublish).toHaveBeenCalledWith(
      "planner-1",
      "trip-1",
      "stop-1",
    );
  });

  it("does not notify when the schedule is already published", async () => {
    setupFirestoreMock(TripRole.Planner, { scheduleStatus: "published" });

    await publishSchedule("planner-1", "trip-1", "stop-1", ["activity-a"]);

    expect(writeNotificationsForSchedulePublish).not.toHaveBeenCalled();
  });

  it("still persists the update when the notification write fails", async () => {
    const { stopUpdate } = setupFirestoreMock(TripRole.Planner, {
      scheduleStatus: "draft",
    });
    vi.mocked(writeNotificationsForSchedulePublish).mockRejectedValueOnce(
      new Error("notify failed"),
    );

    await publishSchedule("planner-1", "trip-1", "stop-1", ["activity-a"]);

    expect(stopUpdate).toHaveBeenCalled();
  });
});
