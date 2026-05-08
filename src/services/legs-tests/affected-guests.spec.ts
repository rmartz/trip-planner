import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getAffectedGuestsForLeg } from "../legs";

interface MockDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

describe("getAffectedGuestsForLeg", () => {
  const whereGet = vi.fn();
  const where = vi.fn(() => ({ get: whereGet }));
  const transportationCollection = vi.fn(() => ({ where }));
  const tripDoc = vi.fn(() => ({ collection: transportationCollection }));
  const tripsCollection = vi.fn(() => ({ doc: tripDoc }));
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("queries the transportation subcollection for the given tripId and legId", async () => {
    whereGet.mockResolvedValue({ docs: [] });

    await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(tripsCollection).toHaveBeenCalledWith("trips");
    expect(tripDoc).toHaveBeenCalledWith("trip-1");
    expect(transportationCollection).toHaveBeenCalledWith("transportation");
    expect(where).toHaveBeenCalledWith("legId", "==", "leg-1");
  });

  it("returns empty array when no entries exist", async () => {
    whereGet.mockResolvedValue({ docs: [] });

    const result = await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(result).toEqual([]);
  });

  it("returns unique uids from transportation entries", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "t-1", data: () => ({ uid: "uid-alice", legId: "leg-1" }) },
      { id: "t-2", data: () => ({ uid: "uid-bob", legId: "leg-1" }) },
    ];
    whereGet.mockResolvedValue({ docs });

    const result = await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(result).toContain("uid-alice");
    expect(result).toContain("uid-bob");
    expect(result).toHaveLength(2);
  });

  it("deduplicates uids when same user has multiple entries", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "t-1", data: () => ({ uid: "uid-alice", legId: "leg-1" }) },
      { id: "t-2", data: () => ({ uid: "uid-alice", legId: "leg-1" }) },
    ];
    whereGet.mockResolvedValue({ docs });

    const result = await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(result).toEqual(["uid-alice"]);
  });
});
