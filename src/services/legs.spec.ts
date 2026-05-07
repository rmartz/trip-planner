import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Leg } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToLeg: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { addLeg, getLegsForTrip, updateLeg } from "./legs";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: ["uid-planner"],
    ...overrides,
  };
}

interface MockQuerySnapshot {
  empty: boolean;
  docs: MockDocSnapshot[];
}

interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
}

describe("getLegsForTrip", () => {
  const orderBy = vi.fn();
  const get = vi.fn();
  const legsCollection = vi.fn();
  const tripDoc = vi.fn();
  const tripsCollection = vi.fn();

  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripsCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({ collection: legsCollection });
    legsCollection.mockReturnValue({ orderBy });
    orderBy.mockReturnValue({ get });
  });

  it("queries the legs subcollection ordered by order", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    await getLegsForTrip("trip-abc");

    expect(tripsCollection).toHaveBeenCalledWith("trips");
    expect(tripDoc).toHaveBeenCalledWith("trip-abc");
    expect(legsCollection).toHaveBeenCalledWith("legs");
    expect(orderBy).toHaveBeenCalledWith("order");
  });

  it("maps each document through firebaseToLeg", async () => {
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-1",
        exists: true,
        data: () => ({ fromStopId: "stop-1", toStopId: "stop-2" }),
      },
      {
        id: "leg-2",
        exists: true,
        data: () => ({ fromStopId: "stop-2", toStopId: "stop-3" }),
      },
    ];
    get.mockResolvedValue({ empty: false, docs } satisfies MockQuerySnapshot);

    const mapped = makeLeg({ legId: "leg-1" });
    vi.mocked(firebaseToLeg).mockReturnValue(mapped);

    const legs = await getLegsForTrip("trip-abc");

    expect(firebaseToLeg).toHaveBeenCalledTimes(2);
    expect(firebaseToLeg).toHaveBeenCalledWith("leg-1", "trip-abc", {
      fromStopId: "stop-1",
      toStopId: "stop-2",
    });
    expect(legs).toHaveLength(2);
  });

  it("returns empty array when there are no legs", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    const legs = await getLegsForTrip("trip-abc");

    expect(legs).toEqual([]);
  });
});

describe("addLeg", () => {
  const memberDocGet = vi.fn();
  const tripDocGet = vi.fn();
  const legsOrderBy = vi.fn();
  const legsLimit = vi.fn();
  const legsGet = vi.fn();
  const legDocSet = vi.fn();
  const legDocRef = { id: "new-leg-id", set: legDocSet };
  const legsDocFn = vi.fn(() => legDocRef);
  const legsFn = vi.fn();
  const tripDocRef = {
    collection: vi.fn(),
    get: tripDocGet,
  };
  const tripsCollection = vi.fn(() => ({ doc: vi.fn(() => tripDocRef) }));
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripDocRef.collection.mockImplementation((name: string) => {
      if (name === "members")
        return { doc: vi.fn(() => ({ get: memberDocGet })) };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (name === "legs") return legsFn();
      return {};
    });
    legsFn.mockReturnValue({
      orderBy: legsOrderBy,
      doc: legsDocFn,
    });
    legsOrderBy.mockReturnValue({ limit: legsLimit });
    legsLimit.mockReturnValue({ get: legsGet });
  });

  it("throws when fromStopId is empty", async () => {
    await expect(
      addLeg("uid-1", "trip-1", "", "stop-2", "London to Paris"),
    ).rejects.toThrow("fromStopId is required");
  });

  it("throws when toStopId is empty", async () => {
    await expect(
      addLeg("uid-1", "trip-1", "stop-1", "", "London to Paris"),
    ).rejects.toThrow("toStopId is required");
  });

  it("throws when fromStopId equals toStopId", async () => {
    await expect(
      addLeg("uid-1", "trip-1", "stop-1", "stop-1", "London to Paris"),
    ).rejects.toThrow("fromStopId and toStopId must be different");
  });

  it("throws when name is empty", async () => {
    await expect(
      addLeg("uid-1", "trip-1", "stop-1", "stop-2", ""),
    ).rejects.toThrow("name is required");
  });

  it("throws when user is not a Planner", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });
    await expect(
      addLeg("uid-guest", "trip-1", "stop-1", "stop-2", "London to Paris"),
    ).rejects.toThrow("Only Planners can add legs");
  });

  it("creates a leg and returns its id", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    tripDocGet.mockResolvedValue({
      data: () => ({ memberUids: ["uid-1"] }),
    });
    legsGet.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);
    legDocSet.mockResolvedValue(undefined);

    const legId = await addLeg(
      "uid-1",
      "trip-1",
      "stop-1",
      "stop-2",
      "London to Paris",
    );

    expect(legId).toBe("new-leg-id");
    expect(legDocSet).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStopId: "stop-1",
        toStopId: "stop-2",
        name: "London to Paris",
        order: 0,
      }),
    );
  });

  it("assigns next order after existing legs", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    tripDocGet.mockResolvedValue({
      data: () => ({ memberUids: ["uid-1"] }),
    });
    legsGet.mockResolvedValue({
      empty: false,
      docs: [{ id: "leg-0", exists: true, data: () => ({ order: 2 }) }],
    } satisfies MockQuerySnapshot);
    legDocSet.mockResolvedValue(undefined);

    await addLeg("uid-1", "trip-1", "stop-1", "stop-2", "London to Paris");

    expect(legDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ order: 3 }),
    );
  });
});

describe("updateLeg", () => {
  const memberDocGet = vi.fn();
  const legUpdate = vi.fn();
  const legDocRef = { update: legUpdate };
  const tripDocRef = {
    collection: vi.fn(),
  };
  const tripsCollection = vi.fn(() => ({ doc: vi.fn(() => tripDocRef) }));
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripDocRef.collection.mockImplementation((name: string) => {
      if (name === "members")
        return { doc: vi.fn(() => ({ get: memberDocGet })) };
      if (name === "legs") return { doc: vi.fn(() => legDocRef) };
      return {};
    });
  });

  it("throws when user is not a Planner", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });
    await expect(
      updateLeg("uid-guest", "trip-1", "leg-1", { fromStopId: "stop-1" }),
    ).rejects.toThrow("Only Planners can edit legs");
  });

  it("throws when updating fromStopId to empty string", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    await expect(
      updateLeg("uid-1", "trip-1", "leg-1", { fromStopId: "" }),
    ).rejects.toThrow("fromStopId is required");
  });

  it("throws when updating toStopId to empty string", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    await expect(
      updateLeg("uid-1", "trip-1", "leg-1", { toStopId: "" }),
    ).rejects.toThrow("toStopId is required");
  });

  it("updates fromStopId in Firestore", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    legUpdate.mockResolvedValue(undefined);

    await updateLeg("uid-1", "trip-1", "leg-1", { fromStopId: "stop-3" });

    expect(legUpdate).toHaveBeenCalledWith({ fromStopId: "stop-3" });
  });

  it("updates toStopId in Firestore", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    legUpdate.mockResolvedValue(undefined);

    await updateLeg("uid-1", "trip-1", "leg-1", { toStopId: "stop-4" });

    expect(legUpdate).toHaveBeenCalledWith({ toStopId: "stop-4" });
  });

  it("does nothing when no fields are provided", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });

    await updateLeg("uid-1", "trip-1", "leg-1", {});

    expect(legUpdate).not.toHaveBeenCalled();
  });
});
