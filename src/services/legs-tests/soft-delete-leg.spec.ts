import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { softDeleteLeg } from "../legs";

describe("softDeleteLeg", () => {
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
      softDeleteLeg("uid-guest", "trip-1", "leg-1"),
    ).rejects.toThrow("Only Planners can remove legs");
  });

  it("throws when member does not exist", async () => {
    memberDocGet.mockResolvedValue({
      exists: false,
      data: () => undefined,
    });
    await expect(
      softDeleteLeg("uid-unknown", "trip-1", "leg-1"),
    ).rejects.toThrow("Only Planners can remove legs");
  });

  it("updates isActive to false in Firestore", async () => {
    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    legUpdate.mockResolvedValue(undefined);

    await softDeleteLeg("uid-planner", "trip-1", "leg-1");

    expect(legUpdate).toHaveBeenCalledWith({ isActive: false });
  });
});
