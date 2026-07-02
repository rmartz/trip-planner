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
    estimatedDurationMinutes: 60,
    name: "Museum tour",
    stopId: "stop-1",
    tripId: "trip-1",
    ...overrides,
  };
}

interface MockActivityDoc {
  id: string;
  data: () => Record<string, unknown>;
  ref: { parent: { parent: { id: string } } };
}

interface MockQuerySnapshot {
  docs: MockActivityDoc[];
}

function makeActivityDoc(
  id: string,
  stopId: string,
  data: Record<string, unknown>,
): MockActivityDoc {
  return {
    id,
    data: () => data,
    ref: { parent: { parent: { id: stopId } } },
  };
}

describe("getActivitiesForTrip", () => {
  const groupGet = vi.fn();
  const groupWhere = vi.fn();
  const collectionGroup = vi.fn();
  const mockDb = { collectionGroup };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    collectionGroup.mockReturnValue({ where: groupWhere });
    groupWhere.mockReturnValue({ get: groupGet });
  });

  it("issues a single collection-group query filtered by tripId", async () => {
    groupGet.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    await getActivitiesForTrip("trip-1");

    expect(collectionGroup).toHaveBeenCalledTimes(1);
    expect(collectionGroup).toHaveBeenCalledWith("activities");
    expect(groupWhere).toHaveBeenCalledWith("tripId", "==", "trip-1");
    expect(groupGet).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array when the trip has no activities", async () => {
    groupGet.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    const activities = await getActivitiesForTrip("trip-1");

    expect(activities).toEqual([]);
  });

  it("maps activities from the collection-group snapshot", async () => {
    groupGet.mockResolvedValue({
      docs: [
        makeActivityDoc("act-1", "stop-1", { name: "Louvre" }),
        makeActivityDoc("act-2", "stop-2", { name: "Colosseum" }),
      ],
    } satisfies MockQuerySnapshot);
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
