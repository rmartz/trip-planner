import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Stop } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToStop: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToStop } from "@/lib/firebase/schema/trip";
import { addStop, getStopsForTrip, reorderStops, updateStop } from "./stops";

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "London",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    endDate: new Date("2025-06-05T00:00:00.000Z"),
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
  ref?: { id: string };
}

describe("getStopsForTrip", () => {
  const orderBy = vi.fn();
  const get = vi.fn();
  const stopsCollection = vi.fn();
  const tripDoc = vi.fn();
  const tripsCollection = vi.fn();

  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripsCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({ collection: stopsCollection });
    stopsCollection.mockReturnValue({ orderBy });
    orderBy.mockReturnValue({ get });
  });

  it("queries the stops subcollection ordered by order", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    await getStopsForTrip("trip-abc");

    expect(tripsCollection).toHaveBeenCalledWith("trips");
    expect(tripDoc).toHaveBeenCalledWith("trip-abc");
    expect(stopsCollection).toHaveBeenCalledWith("stops");
    expect(orderBy).toHaveBeenCalledWith("order");
  });

  it("maps each document through firebaseToStop", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "stop-1", exists: true, data: () => ({ name: "Paris" }) },
      { id: "stop-2", exists: true, data: () => ({ name: "Rome" }) },
    ];
    get.mockResolvedValue({ empty: false, docs } satisfies MockQuerySnapshot);

    const mapped = makeStop({ stopId: "stop-1", name: "Paris" });
    vi.mocked(firebaseToStop).mockReturnValue(mapped);

    const stops = await getStopsForTrip("trip-abc");

    expect(firebaseToStop).toHaveBeenCalledTimes(2);
    expect(firebaseToStop).toHaveBeenCalledWith("stop-1", "trip-abc", {
      name: "Paris",
    });
    expect(stops).toHaveLength(2);
  });

  it("returns empty array when there are no stops", async () => {
    get.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);

    const stops = await getStopsForTrip("trip-abc");

    expect(stops).toEqual([]);
  });
});

describe("addStop", () => {
  const mockBatch = { set: vi.fn(), commit: vi.fn() };
  const memberDocGet = vi.fn();
  const tripDocGet = vi.fn();
  const stopsOrderBy = vi.fn();
  const stopsLimit = vi.fn();
  const stopsGet = vi.fn();
  const stopDocSet = vi.fn();
  const stopDocRef = { id: "new-stop-id", set: stopDocSet };
  const stopsDocFn = vi.fn(() => stopDocRef);
  const stopsFn = vi.fn();
  const tripDocRef = {
    collection: vi.fn(),
    get: tripDocGet,
  };
  const tripsCollection = vi.fn(() => ({ doc: vi.fn(() => tripDocRef) }));
  const mockDb = {
    collection: tripsCollection,
    batch: vi.fn(() => mockBatch),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripDocRef.collection.mockImplementation((name: string) => {
      if (name === "members")
        return { doc: vi.fn(() => ({ get: memberDocGet })) };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (name === "stops") return stopsFn();
      return {};
    });
    stopsFn.mockReturnValue({
      orderBy: stopsOrderBy,
      doc: stopsDocFn,
    });
    stopsOrderBy.mockReturnValue({ limit: stopsLimit });
    stopsLimit.mockReturnValue({ get: stopsGet });
  });

  it("throws when name is empty", async () => {
    await expect(
      addStop(
        "uid-1",
        "trip-1",
        "",
        new Date("2025-06-01"),
        new Date("2025-06-05"),
      ),
    ).rejects.toThrow("name is required");
  });

  it("throws when startDate is after endDate", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    await expect(
      addStop(
        "uid-1",
        "trip-1",
        "London",
        new Date("2025-06-10"),
        new Date("2025-06-01"),
      ),
    ).rejects.toThrow("startDate must be before or equal to endDate");
  });

  it("throws when user is not a Planner", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });
    await expect(
      addStop(
        "uid-guest",
        "trip-1",
        "London",
        new Date("2025-06-01"),
        new Date("2025-06-05"),
      ),
    ).rejects.toThrow("Only Planners can add stops");
  });

  it("creates a stop and returns its id", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    tripDocGet.mockResolvedValue({
      data: () => ({ memberUids: ["uid-1"] }),
    });
    stopsGet.mockResolvedValue({
      empty: true,
      docs: [],
    } satisfies MockQuerySnapshot);
    stopDocSet.mockResolvedValue(undefined);

    const stopId = await addStop(
      "uid-1",
      "trip-1",
      "London",
      new Date("2025-06-01"),
      new Date("2025-06-05"),
    );

    expect(stopId).toBe("new-stop-id");
    expect(stopDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: "London", order: 0 }),
    );
  });

  it("assigns next order after existing stops", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    tripDocGet.mockResolvedValue({
      data: () => ({ memberUids: ["uid-1"] }),
    });
    stopsGet.mockResolvedValue({
      empty: false,
      docs: [{ id: "stop-0", exists: true, data: () => ({ order: 2 }) }],
    } satisfies MockQuerySnapshot);
    stopDocSet.mockResolvedValue(undefined);

    await addStop(
      "uid-1",
      "trip-1",
      "Paris",
      new Date("2025-06-01"),
      new Date("2025-06-05"),
    );

    expect(stopDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ order: 3 }),
    );
  });
});

describe("updateStop", () => {
  const memberDocGet = vi.fn();
  const stopUpdate = vi.fn();
  const stopDocRef = { update: stopUpdate };
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
      if (name === "stops") return { doc: vi.fn(() => stopDocRef) };
      return {};
    });
  });

  it("throws when user is not a Planner", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });
    await expect(
      updateStop("uid-guest", "trip-1", "stop-1", { name: "New Name" }),
    ).rejects.toThrow("Only Planners can edit stops");
  });

  it("throws when updating name to empty string", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    await expect(
      updateStop("uid-1", "trip-1", "stop-1", { name: "" }),
    ).rejects.toThrow("name is required");
  });

  it("updates name in Firestore", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    stopUpdate.mockResolvedValue(undefined);

    await updateStop("uid-1", "trip-1", "stop-1", { name: "Vienna" });

    expect(stopUpdate).toHaveBeenCalledWith({ name: "Vienna" });
  });

  it("updates start and end dates in Firestore", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    stopUpdate.mockResolvedValue(undefined);

    const start = new Date("2025-07-01T00:00:00.000Z");
    const end = new Date("2025-07-05T00:00:00.000Z");
    await updateStop("uid-1", "trip-1", "stop-1", {
      startDate: start,
      endDate: end,
    });

    expect(stopUpdate).toHaveBeenCalledWith({ startDate: start, endDate: end });
  });
});

describe("reorderStops", () => {
  const memberDocGet = vi.fn();
  const batchUpdate = vi.fn();
  const batchCommit = vi.fn();
  const mockBatch = { update: batchUpdate, commit: batchCommit };
  const stopDocFn = vi.fn((id: string) => ({ id }));
  const tripDocRef = {
    collection: vi.fn(),
  };
  const tripsCollection = vi.fn(() => ({ doc: vi.fn(() => tripDocRef) }));
  const mockDb = {
    collection: tripsCollection,
    batch: vi.fn(() => mockBatch),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    tripDocRef.collection.mockImplementation((name: string) => {
      if (name === "members")
        return { doc: vi.fn(() => ({ get: memberDocGet })) };
      if (name === "stops") return { doc: stopDocFn };
      return {};
    });
  });

  it("throws when user is not a Planner", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });
    await expect(
      reorderStops("uid-guest", "trip-1", ["stop-a", "stop-b"]),
    ).rejects.toThrow("Only Planners can reorder stops");
  });

  it("batch-updates each stop's order to its index", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    batchCommit.mockResolvedValue(undefined);

    await reorderStops("uid-1", "trip-1", ["stop-b", "stop-c", "stop-a"]);

    expect(batchUpdate).toHaveBeenCalledTimes(3);
    expect(batchUpdate).toHaveBeenCalledWith({ id: "stop-b" }, { order: 0 });
    expect(batchUpdate).toHaveBeenCalledWith({ id: "stop-c" }, { order: 1 });
    expect(batchUpdate).toHaveBeenCalledWith({ id: "stop-a" }, { order: 2 });
    expect(batchCommit).toHaveBeenCalledTimes(1);
  });
});
