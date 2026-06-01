import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GROUP_USE_TTL_DAYS,
  InviteMode,
  SINGLE_USE_TTL_DAYS,
} from "@/lib/types/invite";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("crypto", () => ({ randomBytes: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { randomBytes } from "crypto";
import { createInviteLink } from "../invite";

afterEach(() => {
  vi.clearAllMocks();
});

function makeSetDb() {
  const setFn = vi.fn().mockResolvedValue(undefined);
  const docFn = vi.fn(() => ({ set: setFn }));
  const colFn = vi.fn(() => ({ doc: docFn }));
  return { db: { collection: colFn }, setFn, docFn };
}

describe("createInviteLink — single-use TTL", () => {
  it("sets expiresAt to 7 days from creation", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db, setFn } = makeSetDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const before = new Date();
    await createInviteLink("trip-1", InviteMode.SingleUse);
    const after = new Date();

    const written = setFn.mock.calls[0]?.[0] as { expiresAt: Date };
    const expectedMin = new Date(
      before.getTime() + SINGLE_USE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    const expectedMax = new Date(
      after.getTime() + SINGLE_USE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    expect(written.expiresAt.getTime()).toBeGreaterThanOrEqual(
      expectedMin.getTime(),
    );
    expect(written.expiresAt.getTime()).toBeLessThanOrEqual(
      expectedMax.getTime(),
    );
  });

  it("writes mode as single-use", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db, setFn } = makeSetDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await createInviteLink("trip-1", InviteMode.SingleUse);

    const written = setFn.mock.calls[0]?.[0] as { mode: string };
    expect(written.mode).toBe(InviteMode.SingleUse);
  });
});

describe("createInviteLink — group-use TTL", () => {
  it("sets expiresAt to 30 days from creation", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db, setFn } = makeSetDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const before = new Date();
    await createInviteLink("trip-1", InviteMode.GroupUse);
    const after = new Date();

    const written = setFn.mock.calls[0]?.[0] as { expiresAt: Date };
    const expectedMin = new Date(
      before.getTime() + GROUP_USE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    const expectedMax = new Date(
      after.getTime() + GROUP_USE_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    expect(written.expiresAt.getTime()).toBeGreaterThanOrEqual(
      expectedMin.getTime(),
    );
    expect(written.expiresAt.getTime()).toBeLessThanOrEqual(
      expectedMax.getTime(),
    );
  });

  it("writes mode as group-use", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db, setFn } = makeSetDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await createInviteLink("trip-1", InviteMode.GroupUse);

    const written = setFn.mock.calls[0]?.[0] as { mode: string };
    expect(written.mode).toBe(InviteMode.GroupUse);
  });

  it("returns the generated token", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db } = makeSetDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const link = await createInviteLink("trip-1", InviteMode.GroupUse);
    expect(typeof link.token).toBe("string");
    expect(link.token.length).toBeGreaterThan(0);
  });
});
