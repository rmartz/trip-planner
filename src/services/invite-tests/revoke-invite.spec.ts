import { afterEach, describe, expect, it, vi } from "vitest";
import { InviteMode } from "@/lib/types/invite";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { revokeInviteLink } from "../invite";

afterEach(() => {
  vi.clearAllMocks();
});

function makeRevokeDb() {
  const updateFn = vi.fn().mockResolvedValue(undefined);
  const getFn = vi.fn().mockResolvedValue({
    exists: true,
    data: () => ({
      tripId: "trip-1",
      mode: InviteMode.GroupUse,
      expiresAt: { toDate: () => new Date(Date.now() + 86400000) },
      revokedAt: null,
    }),
  });
  const docFn = vi.fn(() => ({ get: getFn, update: updateFn }));
  const colFn = vi.fn(() => ({ doc: docFn }));
  return { db: { collection: colFn }, updateFn };
}

describe("revokeInviteLink — manual revocation", () => {
  it("sets revokedAt on the invite document", async () => {
    const { db, updateFn } = makeRevokeDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await revokeInviteLink("tok-abc");

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
  });

  it("throws when the invite token does not exist", async () => {
    const updateFn = vi.fn();
    const getFn = vi.fn().mockResolvedValue({ exists: false });
    const docFn = vi.fn(() => ({ get: getFn, update: updateFn }));
    const colFn = vi.fn(() => ({ doc: docFn }));
    vi.mocked(getAdminFirestore).mockReturnValue({
      collection: colFn,
    } as unknown as ReturnType<typeof getAdminFirestore>);

    await expect(revokeInviteLink("bad-token")).rejects.toThrow();
    expect(updateFn).not.toHaveBeenCalled();
  });
});
