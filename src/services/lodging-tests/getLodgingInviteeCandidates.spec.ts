import { beforeEach, describe, expect, it, vi } from "vitest";
import { LodgingStatus } from "@/lib/types/lodging";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getLodgingInviteeCandidates } from "../lodging";

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
