import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Leg } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToLeg: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { getAllLegsForTrip } from "../legs";

interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown>;
}

interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
}

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: [],
    isActive: true,
    ...overrides,
  };
}

describe("getAllLegsForTrip — returns all legs including soft-deleted", () => {
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

  it("returns empty array when no legs exist", async () => {
    get.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    const result = await getAllLegsForTrip("trip-abc");

    expect(result).toEqual([]);
  });

  it("orders results by order field", async () => {
    get.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    await getAllLegsForTrip("trip-abc");

    expect(orderBy).toHaveBeenCalledWith("order");
  });

  it("includes active legs", async () => {
    const activeLeg = makeLeg({ legId: "leg-active", isActive: true });
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-active",
        exists: true,
        data: () => ({
          fromStopId: "stop-1",
          toStopId: "stop-2",
          isActive: true,
        }),
      },
    ];
    get.mockResolvedValue({ docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg).mockReturnValue(activeLeg);

    const result = await getAllLegsForTrip("trip-abc");

    expect(result).toHaveLength(1);
    expect(result[0]!.isActive).toBe(true);
  });

  it("includes soft-deleted legs", async () => {
    const inactiveLeg = makeLeg({ legId: "leg-inactive", isActive: false });
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-inactive",
        exists: true,
        data: () => ({
          fromStopId: "stop-1",
          toStopId: "stop-2",
          isActive: false,
        }),
      },
    ];
    get.mockResolvedValue({ docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg).mockReturnValue(inactiveLeg);

    const result = await getAllLegsForTrip("trip-abc");

    expect(result).toHaveLength(1);
    expect(result[0]!.isActive).toBe(false);
  });

  it("maps each document through firebaseToLeg", async () => {
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-1",
        exists: true,
        data: () => ({
          fromStopId: "stop-1",
          toStopId: "stop-2",
          isActive: true,
        }),
      },
      {
        id: "leg-2",
        exists: true,
        data: () => ({
          fromStopId: "stop-2",
          toStopId: "stop-3",
          isActive: false,
        }),
      },
    ];
    get.mockResolvedValue({ docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg).mockReturnValue(makeLeg());

    await getAllLegsForTrip("trip-abc");

    expect(firebaseToLeg).toHaveBeenCalledTimes(2);
    expect(firebaseToLeg).toHaveBeenCalledWith(
      "leg-1",
      "trip-abc",
      docs[0]!.data(),
    );
    expect(firebaseToLeg).toHaveBeenCalledWith(
      "leg-2",
      "trip-abc",
      docs[1]!.data(),
    );
  });

  it("returns both active and inactive legs together", async () => {
    const activeLeg = makeLeg({ legId: "leg-active", isActive: true });
    const inactiveLeg = makeLeg({ legId: "leg-inactive", isActive: false });
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-active",
        exists: true,
        data: () => ({
          fromStopId: "stop-1",
          toStopId: "stop-2",
          isActive: true,
        }),
      },
      {
        id: "leg-inactive",
        exists: true,
        data: () => ({
          fromStopId: "stop-2",
          toStopId: "stop-3",
          isActive: false,
        }),
      },
    ];
    get.mockResolvedValue({ docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg)
      .mockReturnValueOnce(activeLeg)
      .mockReturnValueOnce(inactiveLeg);

    const result = await getAllLegsForTrip("trip-abc");

    expect(result).toHaveLength(2);
    expect(result.some((l) => l.isActive)).toBe(true);
    expect(result.some((l) => !l.isActive)).toBe(true);
  });
});
