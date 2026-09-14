import { describe, expect, it, vi } from "vitest";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { withUser } from "./define-tool";

function authInfoFor(uid: string): AuthInfo {
  return {
    token: "t",
    clientId: uid,
    scopes: [],
    extra: { identity: { uid } },
  };
}

describe("withUser", () => {
  it("passes the resolved identity to the wrapped handler", async () => {
    const run = vi.fn().mockReturnValue({
      content: [{ type: "text", text: "ran" }],
    });

    await withUser(authInfoFor("user-a"), run);

    expect(run).toHaveBeenCalledWith({ uid: "user-a" });
  });

  it("fails closed with an error result when auth is absent", async () => {
    const run = vi.fn();

    const result = await withUser(undefined, run);

    expect(result.isError).toBe(true);
    expect(run).not.toHaveBeenCalled();
  });
});
