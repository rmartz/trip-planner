import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("../notify-offer", () => ({
  writeNotificationsForLodgingOffer: vi.fn().mockResolvedValue(undefined),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { setLodgingInvitees } from "../lodging";
import { writeNotificationsForLodgingOffer } from "../notify-offer";

describe("setLodgingInvitees — lodging offer notifications", () => {
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

  function eligible(uids: string[]) {
    membersGet.mockResolvedValue({
      docs: [
        ...uids.map((uid) => ({ id: uid, data: () => ({}) })),
        { id: "uid-host", data: () => ({}) },
      ],
    });
    lodgingGet.mockResolvedValue({
      docs: uids.map((uid) => ({
        id: uid,
        data: () => ({ status: LodgingStatus.NeedLodging }),
      })),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFirestore).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getAdminFirestore>,
    );

    tripCollection.mockReturnValue({ doc: tripDoc });
    tripDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "members") {
          return { doc: () => ({ get: memberGet }), get: membersGet };
        }
        if (name === "stops") return { doc: stopDoc };
        return undefined;
      },
    });
    stopDoc.mockReturnValue({
      collection: (name: string) => {
        if (name === "lodging") return { doc: lodgingDoc, get: lodgingGet };
        return undefined;
      },
      get: vi.fn().mockResolvedValue({ data: () => ({ name: "Reykjavik" }) }),
    });
    lodgingDoc.mockReturnValue({ get: hostGet, update: hostUpdate });
    memberGet.mockResolvedValue({ exists: true });
    hostUpdate.mockResolvedValue(undefined);
  });

  it("notifies only guests newly surfaced to since the prior invitee set", async () => {
    eligible(["uid-old", "uid-new"]);
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({
        invitedUids: ["uid-old"],
        status: LodgingStatus.SecuredCapacity,
      }),
    });

    await setLodgingInvitees("uid-host", "trip-1", "stop-1", [
      "uid-old",
      "uid-new",
    ]);

    expect(writeNotificationsForLodgingOffer).toHaveBeenCalledWith(
      "trip-1",
      expect.any(String),
      ["uid-new"],
    );
  });

  it("does not notify when no new guests are added", async () => {
    eligible(["uid-old"]);
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({
        invitedUids: ["uid-old"],
        status: LodgingStatus.SecuredCapacity,
      }),
    });

    await setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-old"]);

    expect(writeNotificationsForLodgingOffer).not.toHaveBeenCalled();
  });

  it("still updates invitees when the notification write fails", async () => {
    eligible(["uid-new"]);
    hostGet.mockResolvedValue({
      exists: true,
      data: () => ({ invitedUids: [], status: LodgingStatus.SecuredCapacity }),
    });
    vi.mocked(writeNotificationsForLodgingOffer).mockRejectedValueOnce(
      new Error("rtdb down"),
    );

    await setLodgingInvitees("uid-host", "trip-1", "stop-1", ["uid-new"]);

    expect(hostUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ invitedUids: ["uid-new"] }),
    );
  });
});
