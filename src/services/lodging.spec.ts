import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "./errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/lodging", () => ({
  firebaseToLodging: vi.fn(),
}));
vi.mock("./legs", () => ({ getLegMemberRole: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { getLegMemberRole } from "./legs";
import {
  getLodgingForStop,
  getLodgingInviteeCandidates,
  setLodgingInvitees,
  setMemberSortedOwnLodging,
} from "./lodging";

interface MockDocSnapshot {
  id: string;
  data: () => Record<string, unknown>;
}

interface MockQuerySnapshot {
  docs: MockDocSnapshot[];
}

function makeRecord(overrides: Partial<LodgingRecord> = {}): LodgingRecord {
  return {
    uid: "uid-viewer",
    stopId: "stop-1",
    status: LodgingStatus.NeedLodging,
    updatedAt: new Date("2025-06-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeMockDb() {
  const lodgingDocSet = vi.fn();

  const lodgingDoc = {
    set: lodgingDocSet,
  };

  const lodgingCollection = {
    doc: vi.fn(() => lodgingDoc),
  };

  const stopDoc = {
    collection: vi.fn(() => lodgingCollection),
  };

  const stopsCollection = {
    doc: vi.fn(() => stopDoc),
  };

  // Non-account member doc always exists in the happy-path mock
  const nonAccountDocGet = vi.fn().mockResolvedValue({ exists: true });
  const nonAccountCollection = {
    doc: vi.fn(() => ({ get: nonAccountDocGet })),
  };

  const tripDoc = {
    collection: vi.fn((name: string) => {
      if (name === "nonAccountMembers") return nonAccountCollection;
      return stopsCollection;
    }),
  };

  const tripsCollection = {
    doc: vi.fn(() => tripDoc),
  };

  const mockDb = {
    collection: vi.fn(() => tripsCollection),
  };

  return { mockDb, lodgingDocSet };
}

describe("setMemberSortedOwnLodging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws PlannerOnlyError when the caller is not a Planner", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Guest);

    const { mockDb } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(
      setMemberSortedOwnLodging(
        "guest-uid",
        "trip-1",
        "stop-1",
        "member-1",
        true,
      ),
    ).rejects.toThrow(PlannerOnlyError);
  });

  it("sets lodging status to SecuredPrivate when sortedOwn is true", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);

    const { mockDb, lodgingDocSet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    lodgingDocSet.mockResolvedValue(undefined);

    await setMemberSortedOwnLodging(
      "planner-uid",
      "trip-1",
      "stop-1",
      "member-1",
      true,
    );

    expect(lodgingDocSet).toHaveBeenCalledOnce();
    const [data] = lodgingDocSet.mock.calls[0]!;
    expect((data as { status: LodgingStatus }).status).toBe(
      LodgingStatus.SecuredPrivate,
    );
  });

  it("sets lodging status to NeedLodging when sortedOwn is false", async () => {
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);

    const { mockDb, lodgingDocSet } = makeMockDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );
    lodgingDocSet.mockResolvedValue(undefined);

    await setMemberSortedOwnLodging(
      "planner-uid",
      "trip-1",
      "stop-1",
      "member-1",
      false,
    );

    expect(lodgingDocSet).toHaveBeenCalledOnce();
    const [data] = lodgingDocSet.mock.calls[0]!;
    expect((data as { status: LodgingStatus }).status).toBe(
      LodgingStatus.NeedLodging,
    );
  });
});

describe("getLodgingForStop", () => {
  const memberGet = vi.fn();
  const stopGet = vi.fn();
  const ownDocGet = vi.fn();
  const invitedQueryGet = vi.fn();
  const firstWhere = vi.fn();
  const secondWhere = vi.fn();
  const tripCollection = vi.fn();
  const tripDoc = vi.fn();
  const stopDoc = vi.fn();
  const mockDb = { collection: tripCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    firstWhere.mockReturnValue({ where: secondWhere });
    secondWhere.mockReturnValue({ get: invitedQueryGet });

    const lodgingCollection = {
      doc: () => ({ get: ownDocGet }),
      where: firstWhere,
    };

    tripCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "members") {
          return { doc: () => ({ get: memberGet }) };
        }
        if (name === "stops") {
          return { doc: stopDoc };
        }
        return undefined;
      },
    });
    stopDoc.mockReturnValue({
      get: stopGet,
      collection: (name: string) => {
        if (name === "lodging") return lodgingCollection;
        return undefined;
      },
    });
  });

  it("throws when the requester is not a trip member", async () => {
    memberGet.mockResolvedValue({ exists: false });

    await expect(
      getLodgingForStop("uid-viewer", "trip-1", "stop-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(ownDocGet).not.toHaveBeenCalled();
  });

  it("throws when the stop does not exist", async () => {
    memberGet.mockResolvedValue({ exists: true });
    stopGet.mockResolvedValue({ exists: false });

    await expect(
      getLodgingForStop("uid-viewer", "trip-1", "stop-missing"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(ownDocGet).not.toHaveBeenCalled();
  });

  it("returns empty array when viewer has no lodging record", async () => {
    memberGet.mockResolvedValue({ exists: true });
    stopGet.mockResolvedValue({ exists: true });
    ownDocGet.mockResolvedValue({ exists: false });

    const records = await getLodgingForStop("uid-viewer", "trip-1", "stop-1");

    expect(records).toEqual([]);
    expect(firstWhere).not.toHaveBeenCalled();
  });

  it("returns only own record when viewer status is not NeedLodging", async () => {
    memberGet.mockResolvedValue({ exists: true });
    stopGet.mockResolvedValue({ exists: true });
    ownDocGet.mockResolvedValue({ exists: true, data: () => ({}) });
    vi.mocked(firebaseToLodging).mockReturnValue(
      makeRecord({ uid: "uid-viewer", status: LodgingStatus.SecuredPrivate }),
    );

    const records = await getLodgingForStop("uid-viewer", "trip-1", "stop-1");

    expect(records.map((r) => r.uid)).toEqual(["uid-viewer"]);
    expect(firstWhere).not.toHaveBeenCalled();
  });

  it("returns own record and invited SecuredCapacity records when viewer needs lodging", async () => {
    memberGet.mockResolvedValue({ exists: true });
    stopGet.mockResolvedValue({ exists: true });
    ownDocGet.mockResolvedValue({ exists: true, data: () => ({}) });
    vi.mocked(firebaseToLodging)
      .mockReturnValueOnce(
        makeRecord({ uid: "uid-viewer", status: LodgingStatus.NeedLodging }),
      )
      .mockReturnValueOnce(
        makeRecord({ uid: "uid-host", status: LodgingStatus.SecuredCapacity }),
      );
    invitedQueryGet.mockResolvedValue({
      docs: [{ id: "uid-host", data: () => ({}) }],
    } satisfies MockQuerySnapshot);

    const records = await getLodgingForStop("uid-viewer", "trip-1", "stop-1");

    expect(records.map((r) => r.uid)).toEqual(["uid-viewer", "uid-host"]);
    expect(firstWhere).toHaveBeenCalledWith(
      "status",
      "==",
      LodgingStatus.SecuredCapacity,
    );
    expect(secondWhere).toHaveBeenCalledWith(
      "invitedUids",
      "array-contains",
      "uid-viewer",
    );
  });

});

describe("setLodgingInvitees", () => {
  const memberGet = vi.fn();
  const membersGet = vi.fn();
  const hostGet = vi.fn();
  const lodgingGet = vi.fn();
  const hostUpdate = vi.fn();
  const tripCollection = vi.fn();
  const tripDoc = vi.fn();
  const stopDoc = vi.fn();
  const lodgingDoc = vi.fn();
  const mockDb = { collection: tripCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    tripCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "members") {
          return {
            doc: () => ({ get: memberGet }),
            get: membersGet,
          };
        }

        if (name === "stops") {
          return { doc: stopDoc };
        }

        return undefined;
      },
    });
    stopDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "lodging") {
          return { doc: lodgingDoc, get: lodgingGet };
        }

        return undefined;
      },
    });
    lodgingDoc.mockReturnValue({
      get: hostGet,
      update: hostUpdate,
    });
  });

  it("throws when the host is not a trip member", async () => {
    memberGet.mockResolvedValue({ exists: false });

    await expect(
      setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-guest"]),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(hostGet).not.toHaveBeenCalled();
  });

  it("throws when the host lodging record does not exist", async () => {
    memberGet.mockResolvedValue({ exists: true });
    hostGet.mockResolvedValue({ exists: false });

    await expect(
      setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-guest"]),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(hostUpdate).not.toHaveBeenCalled();
  });

  it("throws when the host status is not SecuredCapacity", async () => {
    memberGet.mockResolvedValue({ exists: true });
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: LodgingStatus.NeedLodging }),
    });

    await expect(
      setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-guest"]),
    ).rejects.toThrow("Only hosts with secured capacity can invite guests.");
    expect(hostUpdate).not.toHaveBeenCalled();
  });

  it("throws when any invited guest is not eligible for this stop", async () => {
    memberGet.mockResolvedValue({ exists: true });
    membersGet.mockResolvedValue({
      docs: [
        { id: "uid-guest", data: () => ({}) },
        { id: "uid-host", data: () => ({}) },
      ],
    });
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({
        invitedUids: [],
        status: LodgingStatus.SecuredCapacity,
      }),
    });
    lodgingGet.mockResolvedValue({
      docs: [
        {
          id: "uid-guest",
          data: () => ({ status: LodgingStatus.SecuredPrivate }),
        },
      ],
    });

    await expect(
      setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-guest"]),
    ).rejects.toThrow(
      "All invited guests must be trip members who need lodging for this stop.",
    );
    expect(hostUpdate).not.toHaveBeenCalled();
  });

  it("updates invitees for a secured-capacity host", async () => {
    memberGet.mockResolvedValue({ exists: true });
    membersGet.mockResolvedValue({
      docs: [
        { id: "uid-guest", data: () => ({}) },
        { id: "uid-host", data: () => ({}) },
      ],
    });
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({ invitedUids: [], status: LodgingStatus.SecuredCapacity }),
    });
    lodgingGet.mockResolvedValue({
      docs: [
        {
          id: "uid-guest",
          data: () => ({ status: LodgingStatus.NeedLodging }),
        },
      ],
    });
    hostUpdate.mockResolvedValue(undefined);

    await setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-guest"]);

    expect(hostUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        invitedUids: ["uid-guest"],
        updatedAt: expect.anything(),
      }),
    );
  });
});

describe("setMemberSortedOwnLodging — non-account member validation", () => {
  function makeValidationMockDb({
    nonAccountMemberExists,
  }: {
    nonAccountMemberExists: boolean;
  }) {
    const nonAccountDocGet = vi.fn().mockResolvedValue({
      exists: nonAccountMemberExists,
    });
    const lodgingDocSet = vi.fn().mockResolvedValue(undefined);

    const nonAccountCollection = {
      doc: vi.fn(() => ({ get: nonAccountDocGet })),
    };

    const lodgingCollection = {
      doc: vi.fn(() => ({ set: lodgingDocSet })),
    };

    const stopDoc = {
      collection: vi.fn(() => lodgingCollection),
    };

    const stopsCollection = {
      doc: vi.fn(() => stopDoc),
    };

    const tripDoc = {
      collection: vi.fn((name: string) => {
        if (name === "nonAccountMembers") return nonAccountCollection;
        if (name === "stops") return stopsCollection;
        return {};
      }),
    };

    const mockDb = {
      collection: vi.fn(() => ({ doc: vi.fn(() => tripDoc) })),
    };

    return { mockDb, nonAccountDocGet, lodgingDocSet };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLegMemberRole).mockResolvedValue(TripRole.Planner);
  });

  it("throws NotFoundError when memberId is not in nonAccountMembers", async () => {
    const { mockDb } = makeValidationMockDb({ nonAccountMemberExists: false });
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(
      setMemberSortedOwnLodging(
        "planner-uid",
        "trip-1",
        "stop-1",
        "uid-account",
        true,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("does not write to Firestore when memberId is not a non-account member", async () => {
    const { mockDb, lodgingDocSet } = makeValidationMockDb({
      nonAccountMemberExists: false,
    });
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(
      setMemberSortedOwnLodging(
        "planner-uid",
        "trip-1",
        "stop-1",
        "uid-account",
        true,
      ),
    ).rejects.toThrow(NotFoundError);

    expect(lodgingDocSet).not.toHaveBeenCalled();
  });

  it("succeeds and writes when memberId is a valid non-account member", async () => {
    const { mockDb, lodgingDocSet } = makeValidationMockDb({
      nonAccountMemberExists: true,
    });
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(
      setMemberSortedOwnLodging(
        "planner-uid",
        "trip-1",
        "stop-1",
        "member-na-1",
        true,
      ),
    ).resolves.toBeUndefined();

    expect(lodgingDocSet).toHaveBeenCalledOnce();
  });
});

describe("getLodgingInviteeCandidates", () => {
  const memberGet = vi.fn();
  const membersGet = vi.fn();
  const hostGet = vi.fn();
  const tripCollection = vi.fn();
  const tripDoc = vi.fn();
  const stopDoc = vi.fn();
  const lodgingDoc = vi.fn();
  const lodgingGet = vi.fn();
  const mockDb = { collection: tripCollection };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    tripCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "members") {
          return {
            doc: () => ({ get: memberGet }),
            get: membersGet,
          };
        }

        if (name === "stops") {
          return { doc: stopDoc };
        }

        return undefined;
      },
    });
    stopDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "lodging") {
          return { doc: lodgingDoc, get: lodgingGet };
        }

        return undefined;
      },
    });
    lodgingDoc.mockReturnValue({
      get: hostGet,
    });
  });

  it("returns eligible invitees and filters stale invitedUids", async () => {
    memberGet.mockResolvedValue({ exists: true });
    membersGet.mockResolvedValue({
      docs: [
        { id: "uid-guest", data: () => ({}) },
        { id: "uid-host", data: () => ({}) },
        { id: "uid-ineligible", data: () => ({}) },
      ],
    });
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({
        invitedUids: ["uid-guest", "uid-missing"],
        status: LodgingStatus.SecuredCapacity,
      }),
    });
    lodgingGet.mockResolvedValue({
      docs: [
        {
          id: "uid-guest",
          data: () => ({ status: LodgingStatus.NeedLodging }),
        },
        {
          id: "uid-ineligible",
          data: () => ({ status: LodgingStatus.SecuredPrivate }),
        },
      ],
    });

    await expect(
      getLodgingInviteeCandidates("uid-host", "trip-1", "stop-1"),
    ).resolves.toEqual({
      candidateUids: ["uid-guest"],
      invitedUids: ["uid-guest"],
    });
  });

  it("excludes Planner-role members from the candidate set even when they need lodging", async () => {
    memberGet.mockResolvedValue({ exists: true });
    membersGet.mockResolvedValue({
      docs: [
        { id: "uid-guest", data: () => ({ role: "guest" }) },
        { id: "uid-planner", data: () => ({ role: "planner" }) },
        { id: "uid-host", data: () => ({ role: "planner" }) },
      ],
    });
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({
        invitedUids: [],
        status: LodgingStatus.SecuredCapacity,
      }),
    });
    lodgingGet.mockResolvedValue({
      docs: [
        {
          id: "uid-guest",
          data: () => ({ status: LodgingStatus.NeedLodging }),
        },
        {
          id: "uid-planner",
          data: () => ({ status: LodgingStatus.NeedLodging }),
        },
      ],
    });

    await expect(
      getLodgingInviteeCandidates("uid-host", "trip-1", "stop-1"),
    ).resolves.toEqual({
      candidateUids: ["uid-guest"],
      invitedUids: [],
    });
  });
});
