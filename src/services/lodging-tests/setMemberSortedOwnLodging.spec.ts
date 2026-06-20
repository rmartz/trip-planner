import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "../errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("../legs", () => ({ getLegMemberRole: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getLegMemberRole } from "../legs";
import { setMemberSortedOwnLodging } from "../lodging";

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

describe("setMemberSortedOwnLodging — non-account member validation", () => {
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
