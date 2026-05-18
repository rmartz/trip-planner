import { afterEach, describe, expect, it, vi } from "vitest";
import { tripMembersQueryOptions } from "./use-trip-members";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tripMembersQueryOptions", () => {
  it("returns account and non-account members", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => ({
        accountMembers: [{ uid: "uid-alice", displayName: "Alice" }],
        nonAccountMembers: [{ nonAccountMemberId: "na-1", name: "Ben" }],
      }),
    } as Response);

    const members = await tripMembersQueryOptions("trip-1").queryFn();

    expect(members).toEqual([
      { uid: "uid-alice", displayName: "Alice" },
      { uid: "na-1", displayName: "Ben*" },
    ]);
  });

  it("throws when the members request is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(tripMembersQueryOptions("trip-1").queryFn()).rejects.toThrow(
      "Failed to fetch trip members (500)",
    );
  });
});
