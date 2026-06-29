import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { revokeInviteLink } from "../invite";

afterEach(() => {
  vi.clearAllMocks();
});

function makeRevokeDb(updateFn: ReturnType<typeof vi.fn> = vi.fn()) {
  const docFn = vi.fn(() => ({ update: updateFn }));
  const colFn = vi.fn(() => ({ doc: docFn }));
  return { db: { collection: colFn }, updateFn };
}

describe("revokeInviteLink — manual revocation", () => {
  it("sets revokedAt on the invite document without a prior read", async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    const { db } = makeRevokeDb(updateFn);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await revokeInviteLink("tok-abc");

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
  });

  it("does not call get() before calling update()", async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    const getFn = vi.fn();
    const docFn = vi.fn(() => ({ get: getFn, update: updateFn }));
    const colFn = vi.fn(() => ({ doc: docFn }));
    vi.mocked(getAdminFirestore).mockReturnValue({
      collection: colFn,
    } as unknown as ReturnType<typeof getAdminFirestore>);

    await revokeInviteLink("tok-abc");

    expect(getFn).not.toHaveBeenCalled();
  });

  it("throws 'Invite not found' when update fails with gRPC NOT_FOUND (code 5)", async () => {
    const notFoundError = Object.assign(new Error("NOT_FOUND"), { code: 5 });
    const updateFn = vi.fn().mockRejectedValue(notFoundError);
    const { db } = makeRevokeDb(updateFn);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(revokeInviteLink("bad-token")).rejects.toThrow(
      "Invite not found",
    );
  });

  it("re-throws unexpected errors from update()", async () => {
    const dbError = new Error("Database unavailable");
    const updateFn = vi.fn().mockRejectedValue(dbError);
    const { db } = makeRevokeDb(updateFn);
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await expect(revokeInviteLink("tok-abc")).rejects.toThrow(
      "Database unavailable",
    );
  });
});
