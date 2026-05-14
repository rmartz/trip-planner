import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "./errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({
  firebaseToTripMember: vi.fn(),
}));
vi.mock("@/lib/firebase/schema/non-account-member", () => ({
  firebaseToNonAccountMember: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTripMember } from "@/lib/firebase/schema/trip";
import { firebaseToNonAccountMember } from "@/lib/firebase/schema/non-account-member";
import {
  addNonAccountMember,
  generateClaimToken,
  getMembersForTrip,
  promoteGuestToPlanner,
  removeGuest,
} from "./members";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";

function makeMemberDoc(uid: string, role: TripRole) {
  return {
    id: uid,
    data: () => ({ uid, role }),
  };
}

function makeNonAccountDoc(id: string, name: string) {
  return {
    id,
    data: () => ({
      name,
      proxiedBy: "planner-uid",
      proxiedByName: "Planner Name",
      claimToken: "token-abc",
    }),
  };
}

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

describe("getMembersForTrip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns account members and non-account members for a trip", async () => {
    const { mockDb, memberGet, nonAccountGet, userDocGet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const memberDocs = [makeMemberDoc("uid-1", TripRole.Planner)];
    memberGet.mockResolvedValue({ docs: memberDocs });

    const nonAccountDocs = [makeNonAccountDoc("na-1", "Ben")];
    nonAccountGet.mockResolvedValue({ docs: nonAccountDocs });

    userDocGet.mockResolvedValue({
      id: "uid-1",
      data: () => ({ displayName: "Alice" }),
    });

    const rawMember: TripMember = {
      uid: "uid-1",
      tripId: "trip-1",
      role: TripRole.Planner,
      joinedAt: new Date("2025-01-01"),
      memberUids: [],
      displayName: undefined,
    };
    vi.mocked(firebaseToTripMember).mockReturnValue(rawMember);

    const mappedNonAccount: NonAccountMember = {
      nonAccountMemberId: "na-1",
      tripId: "trip-1",
      name: "Ben",
      proxiedBy: "planner-uid",
      proxiedByName: "Planner Name",
      claimToken: "token-abc",
      claimedBy: undefined,
    };
    vi.mocked(firebaseToNonAccountMember).mockReturnValue(mappedNonAccount);

    const result = await getMembersForTrip("trip-1");

    expect(result.accountMembers).toEqual([
      { ...rawMember, displayName: "Alice" },
    ]);
    expect(result.nonAccountMembers).toEqual([mappedNonAccount]);
  });
});

describe("addNonAccountMember", () => {
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
      addNonAccountMember("guest-uid", "trip-1", "Alex"),
    ).rejects.toThrow(PlannerOnlyError);
  });

  it("creates a non-account member doc when requester is a Planner", async () => {
    const { mockDb, memberDocGet, nonAccountDocSet, userDocGet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });
    userDocGet.mockResolvedValue({
      data: () => ({ displayName: "Alice Planner" }),
    });
    nonAccountDocSet.mockResolvedValue(undefined);

    const result = await addNonAccountMember("planner-uid", "trip-1", "Alex");

    expect(nonAccountDocSet).toHaveBeenCalledTimes(1);
    expect(typeof result.nonAccountMemberId).toBe("string");
    expect(typeof result.claimToken).toBe("string");
    expect(result.name).toBe("Alex");
    expect(result.proxiedBy).toBe("planner-uid");
    expect(result.proxiedByName).toBe("Alice Planner");
  });

  it("throws when name is empty", async () => {
    const { mockDb, memberDocGet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    memberDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ role: TripRole.Planner }),
    });

    await expect(
      addNonAccountMember("planner-uid", "trip-1", "  "),
    ).rejects.toThrow("name is required");
  });
});

describe("promoteGuestToPlanner", () => {
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
      promoteGuestToPlanner("guest-uid", "trip-1", "target-uid"),
    ).rejects.toThrow(PlannerOnlyError);
  });

  it("updates the target member's role to Planner", async () => {
    const { mockDb, memberDocGet, memberDocUpdate } = makeMockDb();
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

    memberDocUpdate.mockResolvedValue(undefined);

    await promoteGuestToPlanner("planner-uid", "trip-1", "target-uid");

    expect(memberDocUpdate).toHaveBeenCalledWith({ role: TripRole.Planner });
  });

  it("throws when target member does not exist", async () => {
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
      promoteGuestToPlanner("planner-uid", "trip-1", "target-uid"),
    ).rejects.toThrow(NotFoundError);
  });
});

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

describe("generateClaimToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a non-empty string token", () => {
    const token = generateClaimToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("returns unique tokens on multiple calls", () => {
    const token1 = generateClaimToken();
    const token2 = generateClaimToken();
    expect(token1).not.toBe(token2);
  });
});
