import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";

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
  const memberGet =
    vi.fn<
      (uid: string) => Promise<{ id: string; data: () => { role?: TripRole } }>
    >();
  const memberDoc = vi.fn((uid: string) => ({
    get: () => memberGet(uid),
    id: uid,
  }));
  const tripCollection = vi.fn((name: string) => {
    if (name === "transportation") return { where };
    if (name === "members") return { doc: memberDoc };
    return {};
  });
  const tripDoc = vi.fn(() => ({ collection: tripCollection }));
  const tripsCollection = vi.fn(() => ({ doc: tripDoc }));
  const mockDb = { collection: tripsCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    memberGet.mockImplementation((uid: string) =>
      Promise.resolve({
        id: uid,
        data: () => ({ role: TripRole.Guest }),
      }),
    );
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
  });

  it("queries the transportation subcollection for the given tripId and legId", async () => {
    whereGet.mockResolvedValue({ docs: [] });

    await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(tripsCollection).toHaveBeenCalledWith("trips");
    expect(tripDoc).toHaveBeenCalledWith("trip-1");
    expect(tripCollection).toHaveBeenCalledWith("transportation");
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

    expect(result).toHaveLength(2);
    expect(result).toContain("uid-alice");
    expect(result).toContain("uid-bob");
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

  it("filters out non-guest members", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "t-1", data: () => ({ uid: "uid-guest", legId: "leg-1" }) },
      { id: "t-2", data: () => ({ uid: "uid-planner", legId: "leg-1" }) },
    ];
    whereGet.mockResolvedValue({ docs });
    memberGet.mockImplementation((uid: string) =>
      Promise.resolve({
        id: uid,
        data: () => ({
          role: uid === "uid-guest" ? TripRole.Guest : TripRole.Planner,
        }),
      }),
    );

    const result = await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(result).toEqual(["uid-guest"]);
  });

  it("treats members with missing role as guest", async () => {
    const docs: MockDocSnapshot[] = [
      { id: "t-1", data: () => ({ uid: "uid-no-role", legId: "leg-1" }) },
    ];
    whereGet.mockResolvedValue({ docs });
    memberGet.mockImplementation((uid: string) =>
      Promise.resolve({
        id: uid,
        data: () => ({}),
      }),
    );

    const result = await getAffectedGuestsForLeg("trip-1", "leg-1");

    expect(result).toEqual(["uid-no-role"]);
  });
});
