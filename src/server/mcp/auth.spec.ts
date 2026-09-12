import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthInfo } from "@modelcontextprotocol/server";

vi.mock("@/lib/firebase/admin", () => ({ getAdminAuth: vi.fn() }));

import { getAdminAuth } from "@/lib/firebase/admin";
import { identityFromAuthInfo, verifyBearerToken } from "./auth";

describe("verifyBearerToken", () => {
  const verifyIdToken = vi.fn();
  const request = new Request("https://example.test/api/mcp");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminAuth).mockReturnValue({
      verifyIdToken,
    } as unknown as ReturnType<typeof getAdminAuth>);
  });

  it("packs the resolved identity into AuthInfo for a valid token", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-1" });

    const authInfo = await verifyBearerToken(request, "valid-token");

    expect(authInfo?.clientId).toBe("user-1");
    expect(authInfo?.extra).toEqual({ identity: { uid: "user-1" } });
  });

  it("returns undefined for an invalid token so withMcpAuth answers 401", async () => {
    verifyIdToken.mockRejectedValue(new Error("invalid"));

    await expect(
      verifyBearerToken(request, "bad-token"),
    ).resolves.toBeUndefined();
  });
});

describe("identityFromAuthInfo", () => {
  it("recovers the identity that verifyBearerToken stored", async () => {
    vi.mocked(getAdminAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockResolvedValue({ uid: "user-2" }),
    } as unknown as ReturnType<typeof getAdminAuth>);
    const request = new Request("https://example.test/api/mcp");

    const authInfo = await verifyBearerToken(request, "valid-token");

    expect(identityFromAuthInfo(authInfo)).toEqual({ uid: "user-2" });
  });

  it("returns undefined when the identity payload is malformed", () => {
    const malformed = {
      token: "t",
      clientId: "c",
      scopes: [],
      extra: { identity: { uid: 42 } },
    } as unknown as AuthInfo;

    expect(identityFromAuthInfo(malformed)).toBeUndefined();
  });
});
