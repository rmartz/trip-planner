import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToTrip: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { getTripsForUser } from "./trips";

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
});
