import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";
import {
  TransportationStatus,
  TransportOfferVisibility,
} from "@/lib/types/transportation";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToTrip: vi.fn() }));
vi.mock("./legs", () => ({ getLegsForTrip: vi.fn() }));
vi.mock("./transportation", () => ({
  computeLegSummary: vi.fn(),
  getTransportationEntriesForTrip: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { getLegsForTrip } from "./legs";
import {
  computeLegSummary,
  getTransportationEntriesForTrip,
} from "./transportation";
import {
  createTripForUser,
  getTripMemberRole,
  getTripMemberUids,
  getTripsForUser,
  recomputeTransportGapCount,
} from "./trips";

interface MockMemberDoc {
  ref: {
    parent: {
      parent?: {
        id?: string;
      };
    };
  };
}

interface MockTripDoc {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
}

describe("getTripsForUser", () => {
  const getMembers = vi.fn();
  const where = vi.fn(() => ({ get: getMembers }));
  const collectionGroup = vi.fn(() => ({ where }));
  const getAll = vi.fn();

  const mockDb = {
    collectionGroup,
    getAll,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("batches trip reads with getAll and maps existing trips", async () => {
    const memberDocs: MockMemberDoc[] = [
      { ref: { parent: { parent: { id: "trip-1" } } } },
      { ref: { parent: { parent: undefined } } },
      { ref: { parent: { parent: { id: "trip-2" } } } },
    ];
    getMembers.mockResolvedValue({ docs: memberDocs });

    const tripDocs: MockTripDoc[] = [
      { id: "trip-1", exists: true, data: () => ({ name: "A" }) },
      { id: "trip-2", exists: false, data: () => ({ name: "B" }) },
    ];
    getAll.mockResolvedValue(tripDocs);

    const mappedTrip: Trip = {
      tripId: "trip-1",
      name: "A",
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-01-02T00:00:00.000Z"),
      createdAt: new Date("2025-01-03T00:00:00.000Z"),
      createdBy: "uid-1",
      memberUids: ["uid-1"],
      inviteToken: "tok-1",
      transportGapCount: 0,
    };
    vi.mocked(firebaseToTrip).mockReturnValue(mappedTrip);

    const trips = await getTripsForUser("uid-1");

    expect(getAll).toHaveBeenCalledTimes(1);
    expect(getAll).toHaveBeenCalledWith({ id: "trip-1" }, { id: "trip-2" });
    expect(firebaseToTrip).toHaveBeenCalledWith("trip-1", { name: "A" });
    expect(trips).toEqual([mappedTrip]);
  });

  it("returns empty list without calling getAll when no trip IDs are found", async () => {
    const memberDocs: MockMemberDoc[] = [
      { ref: { parent: { parent: undefined } } },
    ];
    getMembers.mockResolvedValue({ docs: memberDocs });

    const trips = await getTripsForUser("uid-1");

    expect(getAll).not.toHaveBeenCalled();
    expect(firebaseToTrip).not.toHaveBeenCalled();
    expect(trips).toEqual([]);
  });

  it("returns trips without backfilling missing transportGapCount", async () => {
    getMembers.mockResolvedValue({
      docs: [{ ref: { parent: { parent: { id: "trip-1" } } } }],
    });
    getAll.mockResolvedValue([
      { id: "trip-1", exists: true, data: () => ({ name: "A" }) },
    ]);
    const mappedTrip: Trip = {
      tripId: "trip-1",
      name: "A",
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-01-02T00:00:00.000Z"),
      createdAt: new Date("2025-01-03T00:00:00.000Z"),
      createdBy: "uid-1",
      memberUids: ["uid-1"],
      inviteToken: "tok-1",
    };
    vi.mocked(firebaseToTrip).mockReturnValue(mappedTrip);

    const trips = await getTripsForUser("uid-1");

    expect(trips).toEqual([mappedTrip]);
    expect(trips[0]?.transportGapCount).toBeUndefined();
  });
});

describe("getTripMemberUids", () => {
  const getMembers = vi.fn();
  const membersCollection = vi.fn(() => ({ get: getMembers }));
  const doc = vi.fn(() => ({ collection: membersCollection }));
  const collection = vi.fn(() => ({ doc }));

  const mockDb = {
    collection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("returns member document IDs from the members subcollection", async () => {
    getMembers.mockResolvedValue({
      docs: [{ id: "uid-1" }, { id: "uid-2" }],
    });

    await expect(getTripMemberUids("trip-1")).resolves.toEqual([
      "uid-1",
      "uid-2",
    ]);
    expect(collection).toHaveBeenCalledWith("trips");
    expect(doc).toHaveBeenCalledWith("trip-1");
    expect(membersCollection).toHaveBeenCalledWith("members");
  });

  it("deduplicates repeated member IDs", async () => {
    getMembers.mockResolvedValue({
      docs: [{ id: "uid-1" }, { id: "uid-1" }, { id: "uid-2" }],
    });

    await expect(getTripMemberUids("trip-1")).resolves.toEqual([
      "uid-1",
      "uid-2",
    ]);
  });
});

describe("getTripMemberRole", () => {
  const memberDocGet = vi.fn();
  const membersDoc = vi.fn(() => ({ get: memberDocGet }));
  const membersCollection = vi.fn(() => ({ doc: membersDoc }));
  const tripDoc = vi.fn(() => ({ collection: membersCollection }));
  const collection = vi.fn(() => ({ doc: tripDoc }));

  const mockDb = { collection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("returns the stored role when the membership document has a role", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });

    await expect(getTripMemberRole("trip-1", "uid-1")).resolves.toBe(
      TripRole.Planner,
    );
  });

  it("defaults missing role to Guest for legacy membership documents", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    await expect(getTripMemberRole("trip-1", "uid-1")).resolves.toBe(
      TripRole.Guest,
    );
  });

  it("returns undefined when no membership document exists", async () => {
    memberDocGet.mockResolvedValue({
      exists: false,
      data: () => undefined,
    });

    await expect(getTripMemberRole("trip-1", "uid-1")).resolves.toBeUndefined();
  });
});

describe("recomputeTransportGapCount", () => {
  const getMembers = vi.fn();
  const membersCollection = vi.fn(() => ({ get: getMembers }));
  const update = vi.fn();
  const tripDoc = vi.fn(() => ({
    collection: membersCollection,
    update,
  }));
  const mockDb = {
    collection: vi.fn(() => ({ doc: tripDoc })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    update.mockResolvedValue(undefined);
  });

  it("writes computed transportGapCount to the trip document", async () => {
    vi.mocked(getLegsForTrip).mockResolvedValue([
      {
        legId: "leg-1",
        tripId: "trip-1",
        fromStopId: "s1",
        toStopId: "s2",
        name: "Leg 1",
        order: 0,
        memberUids: ["uid-a", "uid-b"],
        isActive: true,
      },
    ]);
    vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([
      {
        entryId: "e1",
        legId: "leg-1",
        uid: "uid-a",
        status: TransportationStatus.NeedTransportation,
        routeName: "",
      },
    ]);
    vi.mocked(computeLegSummary).mockReturnValue({
      demand: { driving: 0, needRide: 2, noReply: 0, skipLeg: 0 },
      supply: [
        {
          driverName: "Bob",
          seatCount: 1,
          routeName: "",
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    getMembers.mockResolvedValue({
      docs: [{ id: "uid-live-1" }, { id: "uid-live-2" }],
    });

    await recomputeTransportGapCount("trip-1");

    expect(vi.mocked(computeLegSummary)).toHaveBeenCalledWith(
      ["uid-live-1", "uid-live-2"],
      expect.any(Array),
      {},
    );
    expect(tripDoc).toHaveBeenCalledWith("trip-1");
    expect(update).toHaveBeenCalledWith({ transportGapCount: 1 });
  });

  it("writes 0 when there are no legs", async () => {
    vi.mocked(getLegsForTrip).mockResolvedValue([]);
    vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([]);
    getMembers.mockResolvedValue({ docs: [] });

    await recomputeTransportGapCount("trip-1");

    expect(update).toHaveBeenCalledWith({ transportGapCount: 0 });
  });

  it("writes 0 when supply covers all demand", async () => {
    vi.mocked(getLegsForTrip).mockResolvedValue([
      {
        legId: "leg-1",
        tripId: "trip-1",
        fromStopId: "s1",
        toStopId: "s2",
        name: "Leg 1",
        order: 0,
        memberUids: ["uid-a"],
        isActive: true,
      },
    ]);
    vi.mocked(getTransportationEntriesForTrip).mockResolvedValue([]);
    vi.mocked(computeLegSummary).mockReturnValue({
      demand: { driving: 1, needRide: 0, noReply: 0, skipLeg: 0 },
      supply: [
        {
          driverName: "Alice",
          seatCount: 3,
          routeName: "",
          visibility: TransportOfferVisibility.Public,
        },
      ],
    });
    getMembers.mockResolvedValue({
      docs: [{ id: "uid-live-1" }],
    });

    await recomputeTransportGapCount("trip-1");

    expect(update).toHaveBeenCalledWith({ transportGapCount: 0 });
  });
});

describe("createTripForUser — seeds the memberUids invariant", () => {
  const batchSet = vi.fn();
  const batchCommit = vi.fn();
  const memberDoc = vi.fn(() => ({ id: "creator-uid" }));
  const membersCollection = vi.fn(() => ({ doc: memberDoc }));
  const tripRef = { id: "new-trip-id", collection: membersCollection };
  const mockDb = {
    collection: vi.fn(() => ({ doc: vi.fn(() => tripRef) })),
    batch: vi.fn(() => ({ set: batchSet, commit: batchCommit })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    batchCommit.mockResolvedValue(undefined);
  });

  it("writes the creator uid into memberUids on the trip document", async () => {
    await createTripForUser(
      "creator-uid",
      "Alps Trip",
      new Date("2025-07-01T00:00:00Z"),
      new Date("2025-07-08T00:00:00Z"),
    );

    const tripWrite = batchSet.mock.calls.find((call) => call[0] === tripRef);
    expect(tripWrite?.[1]).toEqual(
      expect.objectContaining({ memberUids: ["creator-uid"] }),
    );
  });
});
