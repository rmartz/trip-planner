import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({ getAdminAuth: vi.fn() }));

import { getAdminAuth } from "@/lib/firebase/admin";
import { resolveIdentity } from "./identity";

describe("resolveIdentity", () => {
  const verifyIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminAuth).mockReturnValue({
      verifyIdToken,
    } as unknown as ReturnType<typeof getAdminAuth>);
  });

  it("returns the uid from a verified Firebase ID token", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-1" });

    await expect(resolveIdentity("valid-token")).resolves.toEqual({
      uid: "user-1",
    });
    expect(verifyIdToken).toHaveBeenCalledWith("valid-token");
  });

  it("returns undefined when token verification throws", async () => {
    verifyIdToken.mockRejectedValue(new Error("expired"));

    await expect(resolveIdentity("bad-token")).resolves.toBeUndefined();
  });

  it("returns undefined without verifying when no token is present", async () => {
    await expect(resolveIdentity(undefined)).resolves.toBeUndefined();
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});
