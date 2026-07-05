import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "../errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/non-account-member", () => ({
  firebaseToNonAccountMember: vi.fn(),
}));
vi.mock("@/lib/firebase/schema/trip", () => ({
  firebaseToTripMember: vi.fn(),
}));
vi.mock("../member-uids", () => ({ syncTripMemberUids: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { syncTripMemberUids } from "../member-uids";
import { removeGuest } from "../members";

function makeMockDb() {
  const memberGet = vi.fn();
  const nonAccountGet = vi.fn();
  const memberDocGet = vi.fn();
  const memberDocSet = vi.fn();
  const memberDocUpdate = vi.fn();
  const memberDocDelete = vi.fn();
  const nonAccountDocSet = vi.fn();
  const nonAccountDocGet = vi.fn();
  const userDocGet = vi.fn();
  const batchSet = vi.fn();
  const batchUpdate = vi.fn();
  const batchDelete = vi.fn();
  const batchCommit = vi.fn();

  const membersCollection = {
    get: memberGet,
    doc: vi.fn((id?: string) => ({
      id: id ?? "new-id",
      get: memberDocGet,
      set: memberDocSet,
      update: memberDocUpdate,
      delete: memberDocDelete,
    })),
  };

  const nonAccountCollection = {
    get: nonAccountGet,
    doc: vi.fn((id?: string) => ({
      id: id ?? "new-nonaccount-id",
      get: nonAccountDocGet,
      set: nonAccountDocSet,
    })),
  };

  const usersCollection = {
    doc: vi.fn(() => ({
      get: userDocGet,
    })),
  };

  const tripDoc = {
    collection: vi.fn((name: string) => {
      if (name === "members") return membersCollection;
      if (name === "nonAccountMembers") return nonAccountCollection;
      return {};
    }),
  };

  const tripsCollection = {
    doc: vi.fn(() => tripDoc),
  };

  const mockDb = {
    collection: vi.fn((name: string) => {
      if (name === "users") return usersCollection;
      return tripsCollection;
    }),
    batch: vi.fn(() => ({
      set: batchSet,
      update: batchUpdate,
      delete: batchDelete,
      commit: batchCommit,
    })),
  };

  return {
    mockDb,
    memberGet,
    nonAccountGet,
    memberDocGet,
    memberDocSet,
    memberDocUpdate,
    memberDocDelete,
    nonAccountDocSet,
    nonAccountDocGet,
    userDocGet,
    membersCollection,
    nonAccountCollection,
    usersCollection,
    batchSet,
    batchUpdate,
    batchDelete,
    batchCommit,
  };
}

describe("removeGuest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when requester is not a Planner", async () => {
    const { mockDb, memberDocGet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Guest }),
    });

    await expect(
      removeGuest("guest-uid", "trip-1", "target-uid"),
    ).rejects.toThrow(PlannerOnlyError);
  });

  it("deletes the target guest member doc", async () => {
    const { mockDb, memberDocGet, memberDocDelete } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    memberDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: TripRole.Planner }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: TripRole.Guest }),
      });

    memberDocDelete.mockResolvedValue(undefined);

    await removeGuest("planner-uid", "trip-1", "target-uid");

    expect(memberDocDelete).toHaveBeenCalledTimes(1);
  });

  it("fans out memberUids after deleting so the ex-member is dropped", async () => {
    const { mockDb, memberDocGet, memberDocDelete } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    let syncedBeforeDelete = false;
    vi.mocked(syncTripMemberUids).mockImplementation(() => {
      if (!memberDocDelete.mock.calls.length) syncedBeforeDelete = true;
      return Promise.resolve();
    });

    memberDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: TripRole.Planner }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: TripRole.Guest }),
      });
    memberDocDelete.mockResolvedValue(undefined);

    await removeGuest("planner-uid", "trip-1", "target-uid");

    expect(syncTripMemberUids).toHaveBeenCalledWith(mockDb, "trip-1");
    expect(syncedBeforeDelete).toBe(false);
  });

  it("throws when target member does not exist or is not a Guest", async () => {
    const { mockDb, memberDocGet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    memberDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: TripRole.Planner }),
      })
      .mockResolvedValueOnce({ exists: false });

    await expect(
      removeGuest("planner-uid", "trip-1", "target-uid"),
    ).rejects.toThrow(NotFoundError);
  });
});
