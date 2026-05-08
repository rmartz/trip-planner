import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Leg } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToLeg: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { getArchivedLegsForTrip } from "../legs";

interface MockDocSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown>;
}

interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
}

describe("getArchivedLegsForTrip", () => {
  const orderBy = vi.fn();
  const where = vi.fn();
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
    legsCollection.mockReturnValue({ where });
    where.mockReturnValue({ orderBy });
    orderBy.mockReturnValue({ get });
  });

  it("queries legs where isActive is false", async () => {
    get.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    await getArchivedLegsForTrip("trip-abc");

    expect(where).toHaveBeenCalledWith("isActive", "==", false);
  });

  it("orders results by order field", async () => {
    get.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    await getArchivedLegsForTrip("trip-abc");

    expect(orderBy).toHaveBeenCalledWith("order");
  });

  it("returns empty array when no archived legs exist", async () => {
    get.mockResolvedValue({ docs: [] } satisfies MockQuerySnapshot);

    const result = await getArchivedLegsForTrip("trip-abc");

    expect(result).toEqual([]);
  });

  it("maps each document through firebaseToLeg", async () => {
    const docs: MockDocSnapshot[] = [
      {
        id: "leg-1",
        exists: true,
        data: () => ({
          fromStopId: "stop-1",
          toStopId: "stop-2",
          isActive: false,
        }),
      },
    ];
    get.mockResolvedValue({ docs } satisfies MockQuerySnapshot);

    const mappedLeg: Leg = {
      legId: "leg-1",
      tripId: "trip-abc",
      fromStopId: "stop-1",
      toStopId: "stop-2",
      name: "London to Paris",
      order: 0,
      memberUids: [],
      isActive: false,
    };
    vi.mocked(firebaseToLeg).mockReturnValue(mappedLeg);

    const result = await getArchivedLegsForTrip("trip-abc");

    expect(firebaseToLeg).toHaveBeenCalledWith(
      "leg-1",
      "trip-abc",
      docs[0]!.data(),
    );
    expect(result).toEqual([mappedLeg]);
  });
});
