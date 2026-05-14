import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { NotFoundError } from "./errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/lodging", () => ({
  firebaseToLodging: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import {
  getLodgingForStop,
  getLodgingInviteeCandidates,
  setLodgingInvitees,
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

describe("getLodgingForStop", () => {
  const memberGet = vi.fn();
  const lodgingGet = vi.fn();
  const tripCollection = vi.fn();
  const tripDoc = vi.fn();
  const stopDoc = vi.fn();
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
          return { get: lodgingGet };
        }

        return undefined;
      },
    });
  });

  it("throws when the requester is not a trip member", async () => {
    memberGet.mockResolvedValue({ exists: false });

    await expect(
      getLodgingForStop("uid-viewer", "trip-1", "stop-1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(lodgingGet).not.toHaveBeenCalled();
  });

  it("returns only records visible to the requester", async () => {
    memberGet.mockResolvedValue({ exists: true });
    lodgingGet.mockResolvedValue({
      docs: [
        { id: "uid-viewer", data: () => ({ source: "self" }) },
        { id: "uid-host-invited", data: () => ({ source: "invited" }) },
        { id: "uid-host-hidden", data: () => ({ source: "hidden" }) },
        { id: "uid-host-private", data: () => ({ source: "private" }) },
      ],
    } satisfies MockQuerySnapshot);

    vi.mocked(firebaseToLodging).mockImplementation((uid, stopId, data) => {
      expect(stopId).toBe("stop-1");
      expect(data).toBeDefined();

      const recordsByUid: Record<string, LodgingRecord> = {
        "uid-host-hidden": makeRecord({
          uid: "uid-host-hidden",
          status: LodgingStatus.SecuredCapacity,
          invitedUids: ["uid-other"],
        }),
        "uid-host-invited": makeRecord({
          uid: "uid-host-invited",
          status: LodgingStatus.SecuredCapacity,
          invitedUids: ["uid-viewer"],
        }),
        "uid-host-private": makeRecord({
          uid: "uid-host-private",
          status: LodgingStatus.SecuredPrivate,
          invitedUids: ["uid-viewer"],
        }),
        "uid-viewer": makeRecord(),
      };

      return recordsByUid[uid] ?? makeRecord({ uid });
    });

    const records = await getLodgingForStop("uid-viewer", "trip-1", "stop-1");

    expect(records.map((record) => record.uid)).toEqual([
      "uid-viewer",
      "uid-host-invited",
    ]);
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
      docs: [{ id: "uid-guest" }, { id: "uid-host" }],
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
      docs: [{ id: "uid-guest" }, { id: "uid-host" }],
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
      docs: [{ id: "uid-guest" }, { id: "uid-host" }, { id: "uid-ineligible" }],
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
});
