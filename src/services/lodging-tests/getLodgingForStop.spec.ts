import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { NotFoundError } from "../errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/lodging", () => ({
  firebaseToLodging: vi.fn(),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { getLodgingForStop } from "../lodging";

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
