import { beforeEach, describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import { LodgingStatus } from "@/lib/types/lodging";
import { PlannerOnlyError } from "./errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("./legs", () => ({ getLegMemberRole: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getLegMemberRole } from "./legs";
import { setMemberSortedOwnLodging } from "./lodging";

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

  const tripDoc = {
    collection: vi.fn(() => stopsCollection),
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
