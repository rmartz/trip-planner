import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";
import { NotFoundError } from "../errors";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { setLodgingInvitees } from "../lodging";

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
      get: vi.fn().mockResolvedValue({ data: () => ({ name: "Reykjavik" }) }),
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
