import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Activity } from "@/lib/types/activity";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/activity", () => ({
  firebaseToActivity: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToActivity } from "@/lib/firebase/schema/activity";
import { getActivitiesForTrip } from "./activities";

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    activityId: "activity-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Museum tour",
    scheduledAt: undefined,
    notes: undefined,
    voteBy: undefined,
    pinnedAt: undefined,
    pinnedBy: undefined,
    voteStateByMember: {},
    yesCount: 0,
    noCount: 0,
    maybeCount: 0,
    ...overrides,
  };
}

interface MockDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
  ref?: {
    collection: (name: string) => { get: () => Promise<MockQuerySnapshot> };
  };
}

interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
}

describe("getActivitiesForTrip", () => {
  const activitiesByStop = new Map<string, MockQuerySnapshot>();
  const stopsGet = vi.fn();
  const stopsCollection = vi.fn();
  const tripDoc = vi.fn();
  const tripsCollection = vi.fn();
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    activitiesByStop.clear();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripsCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({ collection: stopsCollection });
    stopsCollection.mockReturnValue({ get: stopsGet });
  });

  it("returns an empty array when trip has no stops", async () => {
    stopsGet.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    const activities = await getActivitiesForTrip("trip-1");

    expect(activities).toEqual([]);
  });

  it("maps activities from multiple stops", async () => {
    const stopDocs: MockDocSnapshot[] = [
      {
        id: "stop-1",
        data: () => ({ name: "Paris" }),
        ref: {
          collection: () => ({
            get: () => Promise.resolve(activitiesByStop.get("stop-1")!),
          }),
        },
      },
      {
        id: "stop-2",
        data: () => ({ name: "Rome" }),
        ref: {
          collection: () => ({
            get: () => Promise.resolve(activitiesByStop.get("stop-2")!),
          }),
        },
      },
    ];

    activitiesByStop.set("stop-1", {
      docs: [{ id: "act-1", data: () => ({ name: "Louvre" }) }],
    });
    activitiesByStop.set("stop-2", {
      docs: [{ id: "act-2", data: () => ({ name: "Colosseum" }) }],
    });
    stopsGet.mockResolvedValue({ docs: stopDocs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToActivity)
      .mockReturnValueOnce(
        makeActivity({ activityId: "act-1", stopId: "stop-1" }),
      )
      .mockReturnValueOnce(
        makeActivity({ activityId: "act-2", stopId: "stop-2" }),
      );

    const activities = await getActivitiesForTrip("trip-1");

    expect(firebaseToActivity).toHaveBeenCalledWith(
      "act-1",
      "stop-1",
      "trip-1",
      {
        name: "Louvre",
      },
    );
    expect(firebaseToActivity).toHaveBeenCalledWith(
      "act-2",
      "stop-2",
      "trip-1",
      {
        name: "Colosseum",
      },
    );
    expect(activities).toHaveLength(2);
  });
});
