import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TransportationStatus,
  TransportOfferVisibility,
} from "@/lib/types/transportation";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/transportation", () => ({
  firebaseToTransportationEntry: vi.fn((entryId, legId, uid, data) => ({
    entryId,
    legId,
    uid,
    status: data.status as TransportationStatus,
    routeName: (data.routeName as string | undefined) ?? "",
    ...(data.seatCount !== undefined
      ? { seatCount: data.seatCount as number }
      : {}),
    ...(data.ridingWithUid !== undefined
      ? { ridingWithUid: data.ridingWithUid as string }
      : {}),
  })),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  computeLegSummary,
  getTransportationEntriesForTrip,
  resolveDriverDisplayNames,
} from "./transportation";
import type { TransportationEntry } from "@/lib/types/transportation";

function makeEntry(
  overrides: Partial<TransportationEntry> = {},
): TransportationEntry {
  return {
    entryId: "entry-1",
    legId: "leg-1",
    uid: "uid-1",
    status: TransportationStatus.NeedTransportation,
    routeName: "Chicago to NYC",
    ...overrides,
  };
}

// ── Firestore mock setup ──────────────────────────────────────────────────────

interface MockDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

const collectionGet = vi.fn();
const innerCollection = vi.fn(() => ({ get: collectionGet }));
const tripDoc = vi.fn(() => ({ collection: innerCollection }));
const userDocGet = vi.fn();
const userDoc = vi.fn(() => ({ get: userDocGet }));

const mockDb = {
  collection: vi.fn((name: string) => {
    if (name === "trips") return { doc: tripDoc };
    if (name === "users") return { doc: userDoc };
    return { doc: vi.fn() };
  }),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminFirestore).mockReturnValue(
    mockDb as unknown as ReturnType<typeof getAdminFirestore>,
  );
});

// ── getTransportationEntriesForTrip ──────────────────────────────────────────

describe("getTransportationEntriesForTrip", () => {
  it("queries the transportation subcollection for the given tripId", async () => {
    collectionGet.mockResolvedValue({ docs: [] });

    await getTransportationEntriesForTrip("trip-1");

    expect(tripDoc).toHaveBeenCalledWith("trip-1");
    expect(innerCollection).toHaveBeenCalledWith("transportation");
  });

  it("returns empty array when no entries exist", async () => {
    collectionGet.mockResolvedValue({ docs: [] });

    const result = await getTransportationEntriesForTrip("trip-1");

    expect(result).toEqual([]);
  });

  it("maps docs to TransportationEntry objects", async () => {
    const docs: MockDocSnapshot[] = [
      {
        id: "entry-1",
        data: () => ({
          legId: "leg-1",
          uid: "uid-alice",
          status: TransportationStatus.DrivingWithSeats,
          routeName: "Route 1",
          seatCount: 3,
        }),
      },
    ];
    collectionGet.mockResolvedValue({ docs });

    const result = await getTransportationEntriesForTrip("trip-1");

    expect(result).toHaveLength(1);
    expect(result[0]!.entryId).toBe("entry-1");
    expect(result[0]!.legId).toBe("leg-1");
    expect(result[0]!.uid).toBe("uid-alice");
  });
});

// ── resolveDriverDisplayNames ─────────────────────────────────────────────────

describe("resolveDriverDisplayNames", () => {
  it("returns empty object when given no uids", async () => {
    const result = await resolveDriverDisplayNames([]);
    expect(result).toEqual({});
  });

  it("looks up display name for each uid", async () => {
    userDocGet.mockResolvedValueOnce({
      id: "uid-alice",
      data: () => ({ displayName: "Alice" }),
    });

    const result = await resolveDriverDisplayNames(["uid-alice"]);

    expect(result["uid-alice"]).toBe("Alice");
  });

  it("returns undefined for uids without a displayName", async () => {
    userDocGet.mockResolvedValueOnce({
      id: "uid-anon",
      data: () => ({}),
    });

    const result = await resolveDriverDisplayNames(["uid-anon"]);

    expect(result["uid-anon"]).toBeUndefined();
  });
});

// ── computeLegSummary — demand ────────────────────────────────────────────────

describe("computeLegSummary — demand", () => {
  it("counts Driving entries in demand.driving", () => {
    const entries = [
      makeEntry({ uid: "uid-1", status: TransportationStatus.Driving }),
      makeEntry({ uid: "uid-2", status: TransportationStatus.Driving }),
    ];
    const { demand } = computeLegSummary(["uid-1", "uid-2"], entries, {});

    expect(demand.driving).toBe(2);
    expect(demand.needRide).toBe(0);
  });

  it("counts DrivingWithSeats entries in demand.driving", () => {
    const entries = [
      makeEntry({
        uid: "uid-1",
        status: TransportationStatus.DrivingWithSeats,
      }),
    ];
    const { demand } = computeLegSummary(["uid-1"], entries, {});

    expect(demand.driving).toBe(1);
  });

  it("counts NeedTransportation entries in demand.needRide", () => {
    const entries = [
      makeEntry({
        uid: "uid-1",
        status: TransportationStatus.NeedTransportation,
      }),
    ];
    const { demand } = computeLegSummary(["uid-1"], entries, {});

    expect(demand.needRide).toBe(1);
    expect(demand.driving).toBe(0);
  });

  it("counts FlyingOrOther entries in demand.skipLeg", () => {
    const entries = [
      makeEntry({ uid: "uid-1", status: TransportationStatus.FlyingOrOther }),
    ];
    const { demand } = computeLegSummary(["uid-1"], entries, {});

    expect(demand.skipLeg).toBe(1);
    expect(demand.haveOwn).toBe(0);
    expect(demand.driving).toBe(0);
  });

  it("counts members with no entry in demand.noReply", () => {
    const entries = [
      makeEntry({ uid: "uid-1", status: TransportationStatus.Driving }),
    ];
    const { demand } = computeLegSummary(
      ["uid-1", "uid-2", "uid-3"],
      entries,
      {},
    );

    expect(demand.noReply).toBe(2);
  });

  it("does not include RidingWith entries in demand counts", () => {
    const entries = [
      makeEntry({
        uid: "uid-1",
        status: TransportationStatus.RidingWith,
        ridingWithUid: "uid-driver",
      }),
    ];
    const { demand } = computeLegSummary(["uid-1"], entries, {});

    expect(demand.driving).toBe(0);
    expect(demand.needRide).toBe(0);
    expect(demand.haveOwn).toBe(0);
    expect(demand.noReply).toBe(0);
  });

  it("produces zero skipLeg when no FlyingOrOther entries are present", () => {
    const { demand } = computeLegSummary([], [], {});

    expect(demand.skipLeg).toBe(0);
  });
});

// ── computeLegSummary — supply ────────────────────────────────────────────────

describe("computeLegSummary — supply", () => {
  it("includes DrivingWithSeats entries in supply", () => {
    const entries = [
      makeEntry({
        uid: "uid-1",
        status: TransportationStatus.DrivingWithSeats,
        routeName: "Route 66",
        seatCount: 3,
      }),
    ];
    const { supply } = computeLegSummary(["uid-1"], entries, {
      "uid-1": "Alice",
    });

    expect(supply).toHaveLength(1);
    expect(supply[0]!.driverName).toBe("Alice");
    expect(supply[0]!.routeName).toBe("Route 66");
    expect(supply[0]!.seatCount).toBe(3);
  });

  it("excludes Driving (no-seats) entries from supply", () => {
    const entries = [
      makeEntry({ uid: "uid-1", status: TransportationStatus.Driving }),
    ];
    const { supply } = computeLegSummary(["uid-1"], entries, {
      "uid-1": "Alice",
    });

    expect(supply).toHaveLength(0);
  });

  it("uses uid as fallback driverName when displayName is absent", () => {
    const entries = [
      makeEntry({
        uid: "uid-unknown",
        status: TransportationStatus.DrivingWithSeats,
        seatCount: 2,
      }),
    ];
    const { supply } = computeLegSummary(["uid-unknown"], entries, {});

    expect(supply[0]!.driverName).toBe("uid-unknown");
  });

  it("marks supply as Public when no one is riding with the driver", () => {
    const entries = [
      makeEntry({
        uid: "uid-driver",
        status: TransportationStatus.DrivingWithSeats,
        seatCount: 4,
      }),
    ];
    const { supply } = computeLegSummary(["uid-driver"], entries, {
      "uid-driver": "Bob",
    });

    expect(supply[0]!.visibility).toBe(TransportOfferVisibility.Public);
    expect(supply[0]!.inviteeCount).toBeUndefined();
  });

  it("marks supply as InviteOnly and includes inviteeCount when riders are present", () => {
    const entries = [
      makeEntry({
        uid: "uid-driver",
        status: TransportationStatus.DrivingWithSeats,
        seatCount: 4,
      }),
      makeEntry({
        entryId: "entry-2",
        uid: "uid-rider",
        status: TransportationStatus.RidingWith,
        ridingWithUid: "uid-driver",
      }),
    ];
    const { supply } = computeLegSummary(["uid-driver", "uid-rider"], entries, {
      "uid-driver": "Bob",
    });

    expect(supply[0]!.visibility).toBe(TransportOfferVisibility.InviteOnly);
    expect(supply[0]!.inviteeCount).toBe(1);
  });
});
