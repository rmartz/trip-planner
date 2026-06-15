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

function makeCreateDb() {
  const createFn = vi.fn().mockResolvedValue(undefined);
  const docFn = vi.fn(() => ({ create: createFn }));
  const colFn = vi.fn(() => ({ doc: docFn }));
  return { db: { collection: colFn }, createFn, docFn };
}

describe("createInviteLink — single-use TTL", () => {
  it("sets expiresAt to 7 days from creation", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db, createFn } = makeCreateDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const before = new Date();
    await createInviteLink("trip-1", InviteMode.SingleUse);
    const after = new Date();

    const written = createFn.mock.calls[0]?.[0] as { expiresAt: Date };
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
    const { db, createFn } = makeCreateDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await createInviteLink("trip-1", InviteMode.SingleUse);

    const written = createFn.mock.calls[0]?.[0] as { mode: string };
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
    const { db, createFn } = makeCreateDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const before = new Date();
    await createInviteLink("trip-1", InviteMode.GroupUse);
    const after = new Date();

    const written = createFn.mock.calls[0]?.[0] as { expiresAt: Date };
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
    const { db, createFn } = makeCreateDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    await createInviteLink("trip-1", InviteMode.GroupUse);

    const written = createFn.mock.calls[0]?.[0] as { mode: string };
    expect(written.mode).toBe(InviteMode.GroupUse);
  });

  it("returns the generated token", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );
    const { db } = makeCreateDb();
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );

    const link = await createInviteLink("trip-1", InviteMode.GroupUse);
    expect(typeof link.token).toBe("string");
    expect(link.token.length).toBeGreaterThan(0);
  });
});

describe("createInviteLink — token collision retry", () => {
  it("retries with a new token when create() fails with ALREADY_EXISTS (code 6)", async () => {
    const alreadyExistsError = Object.assign(new Error("ALREADY_EXISTS"), {
      code: 6,
    });
    const createFn = vi
      .fn()
      .mockRejectedValueOnce(alreadyExistsError)
      .mockResolvedValue(undefined);
    const docFn = vi.fn(() => ({ create: createFn }));
    const colFn = vi.fn(() => ({ doc: docFn }));
    vi.mocked(getAdminFirestore).mockReturnValue({
      collection: colFn,
    } as unknown as ReturnType<typeof getAdminFirestore>);
    vi.mocked(randomBytes)
      .mockReturnValueOnce(
        Buffer.from("aaaaaaaaaaaaaaaa", "hex") as unknown as ReturnType<
          typeof randomBytes
        >,
      )
      .mockReturnValue(
        Buffer.from("bbbbbbbbbbbbbbbb", "hex") as unknown as ReturnType<
          typeof randomBytes
        >,
      );

    await createInviteLink("trip-1", InviteMode.GroupUse);

    expect(createFn).toHaveBeenCalledTimes(2);
    const docCalls = docFn.mock.calls as unknown as [string][];
    expect(docCalls[0]?.[0]).not.toBe(docCalls[1]?.[0]);
  });

  it("re-throws non-collision errors from create()", async () => {
    const dbError = new Error("Database unavailable");
    const createFn = vi.fn().mockRejectedValue(dbError);
    const docFn = vi.fn(() => ({ create: createFn }));
    const colFn = vi.fn(() => ({ doc: docFn }));
    vi.mocked(getAdminFirestore).mockReturnValue({
      collection: colFn,
    } as unknown as ReturnType<typeof getAdminFirestore>);
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef12345678", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );

    await expect(createInviteLink("trip-1", InviteMode.GroupUse)).rejects.toBe(
      dbError,
    );
    expect(createFn).toHaveBeenCalledTimes(1);
  });
});
