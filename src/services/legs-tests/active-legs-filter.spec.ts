import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Leg } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToLeg: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { getLegsForTrip } from "../legs";

interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown>;
}

interface MockQuerySnapshot {
  empty: boolean;
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

describe("getLegsForTrip — expense picker excludes soft-deleted legs", () => {
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

  it("excludes soft-deleted legs from results", async () => {
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
    get.mockResolvedValue({ empty: false, docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg)
      .mockReturnValueOnce(activeLeg)
      .mockReturnValueOnce(inactiveLeg);

    const result = await getLegsForTrip("trip-abc");

    expect(result).toHaveLength(1);
    expect(result[0]!.legId).toBe("leg-active");
  });

  it("returns only active legs when both active and inactive exist", async () => {
    const activeLeg1 = makeLeg({ legId: "leg-1", isActive: true });
    const inactiveLeg = makeLeg({ legId: "leg-2", isActive: false });
    const activeLeg2 = makeLeg({ legId: "leg-3", isActive: true });
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-1",
        exists: true,
        data: () => ({ isActive: true }),
      },
      {
        id: "leg-2",
        exists: true,
        data: () => ({ isActive: false }),
      },
      {
        id: "leg-3",
        exists: true,
        data: () => ({ isActive: true }),
      },
    ];
    get.mockResolvedValue({ empty: false, docs } satisfies MockQuerySnapshot);
    vi.mocked(firebaseToLeg)
      .mockReturnValueOnce(activeLeg1)
      .mockReturnValueOnce(inactiveLeg)
      .mockReturnValueOnce(activeLeg2);

    const result = await getLegsForTrip("trip-abc");

    expect(result).toHaveLength(2);
    expect(result.every((l) => l.isActive)).toBe(true);
  });
});
