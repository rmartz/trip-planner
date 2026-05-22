import { afterEach, describe, expect, it, vi } from "vitest";
import { InviteMode } from "@/lib/types/invite";
import {
  InviteLinkExpiredError,
  InviteLinkRevokedError,
  InviteLinkUsedError,
} from "../invite";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { acceptInviteByLink } from "../invite";

afterEach(() => {
  vi.clearAllMocks();
});

const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 1000);

function makeInviteDoc(overrides: {
  mode?: InviteMode;
  expiresAt?: Date;
  consumedAt?: Date;
  revokedAt?: Date;
  exists?: boolean;
}) {
  const exists = overrides.exists ?? true;
  return {
    exists,
    data: () =>
      exists
        ? {
            tripId: "trip-1",
            mode: overrides.mode ?? InviteMode.GroupUse,
            expiresAt: { toDate: () => overrides.expiresAt ?? FUTURE },
            consumedAt: overrides.consumedAt
              ? { toDate: () => overrides.consumedAt }
              : null,
            revokedAt: overrides.revokedAt
              ? { toDate: () => overrides.revokedAt }
              : null,
          }
        : undefined,
  };
}

function makeTransactionDb(
  inviteDocData: ReturnType<typeof makeInviteDoc>,
  memberExists: boolean,
) {
  const memberSetFn = vi.fn().mockResolvedValue(undefined);
  const inviteUpdateFn = vi.fn().mockResolvedValue(undefined);

  const memberDocRef = { set: memberSetFn };
  const inviteDocRef = { update: inviteUpdateFn };

  const transactionGetFn = vi.fn().mockImplementation((ref: unknown) => {
    if (ref === inviteDocRef) return Promise.resolve(inviteDocData);
    return Promise.resolve({ exists: memberExists });
  });
  const transactionSetFn = vi.fn().mockResolvedValue(undefined);
  const transactionUpdateFn = vi.fn().mockResolvedValue(undefined);

  const runTransactionFn = vi
    .fn()
    .mockImplementation(async (cb: (t: unknown) => Promise<unknown>) => {
      const txn = {
        get: transactionGetFn,
        set: transactionSetFn,
        update: transactionUpdateFn,
      };
      return cb(txn);
    });

  const memberDocFn = vi.fn(() => memberDocRef);
  const membersColFn = vi.fn(() => ({ doc: memberDocFn }));
  const inviteDocFn = vi.fn(() => inviteDocRef);
  const tripDocFn = vi.fn(() => ({ collection: membersColFn }));

  const colFn = vi.fn().mockImplementation((name: string) => {
    if (name === "invites") return { doc: inviteDocFn };
    if (name === "trips") return { doc: tripDocFn };
    return {};
  });

  return {
    db: { collection: colFn, runTransaction: runTransactionFn },
    transactionSetFn,
    transactionUpdateFn,
    runTransactionFn,
  };
}

describe("acceptInviteByLink — expired link", () => {
  it("throws InviteLinkExpiredError when expiresAt is in the past", async () => {
    const inviteDoc = makeInviteDoc({ expiresAt: PAST });
    const { db } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(acceptInviteByLink("tok-abc", "uid-x")).rejects.toThrow(
      InviteLinkExpiredError,
    );
  });

  it("throws InviteLinkExpiredError when expiresAt equals now (boundary)", async () => {
    const now = new Date();
    const inviteDoc = makeInviteDoc({ expiresAt: now });
    const { db } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(acceptInviteByLink("tok-abc", "uid-x")).rejects.toThrow(
      InviteLinkExpiredError,
    );
  });
});

describe("acceptInviteByLink — revoked link", () => {
  it("throws InviteLinkRevokedError when revokedAt is set", async () => {
    const inviteDoc = makeInviteDoc({ revokedAt: PAST });
    const { db } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(acceptInviteByLink("tok-abc", "uid-x")).rejects.toThrow(
      InviteLinkRevokedError,
    );
  });
});

describe("acceptInviteByLink — single-use auto-revocation", () => {
  it("sets consumedAt on the invite after a new member joins", async () => {
    const inviteDoc = makeInviteDoc({ mode: InviteMode.SingleUse });
    const { db, transactionUpdateFn } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await acceptInviteByLink("tok-abc", "uid-new");

    expect(transactionUpdateFn).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ consumedAt: expect.any(Date) }),
    );
  });

  it("throws InviteLinkUsedError on second accept when consumedAt is already set", async () => {
    const inviteDoc = makeInviteDoc({
      mode: InviteMode.SingleUse,
      consumedAt: PAST,
    });
    const { db } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(acceptInviteByLink("tok-abc", "uid-second")).rejects.toThrow(
      InviteLinkUsedError,
    );
  });
});

describe("acceptInviteByLink — group-use multiple joins", () => {
  it("does not set revokedAt after a member joins a group-use link", async () => {
    const inviteDoc = makeInviteDoc({ mode: InviteMode.GroupUse });
    const { db, transactionUpdateFn } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await acceptInviteByLink("tok-abc", "uid-new");

    const revokeCalls = transactionUpdateFn.mock.calls.filter((call) => {
      const data = call[1] as Record<string, unknown>;
      return "revokedAt" in data;
    });
    expect(revokeCalls.length).toBe(0);
  });

  it("returns the tripId for a successful group-use join", async () => {
    const inviteDoc = makeInviteDoc({ mode: InviteMode.GroupUse });
    const { db } = makeTransactionDb(inviteDoc, false);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const result = await acceptInviteByLink("tok-abc", "uid-new");
    expect(result.tripId).toBe("trip-1");
    expect(result.alreadyMember).toBe(false);
  });
});
