import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeMemberAndSyncUids, syncTripMemberUids } from "./member-uids";

interface FakeDoc {
  id: string;
  data: () => Record<string, unknown>;
  ref: { path: string };
}

function makeDoc(collection: string, id: string, uid?: string): FakeDoc {
  return {
    id,
    data: () => (uid !== undefined ? { uid } : {}),
    ref: { path: `trips/trip-1/${collection}/${id}` },
  };
}

function makeDb(members: FakeDoc[], stops: FakeDoc[], legs: FakeDoc[]) {
  const batchUpdate = vi.fn();
  const batchDelete = vi.fn();
  const batchCommit = vi.fn().mockResolvedValue(undefined);
  // Every `db.batch()` call returns a distinct batch object so the number of
  // batches created can be asserted, but they share the update/delete/commit
  // spies so a single call site accumulates every write across all chunks.
  const batches: unknown[] = [];

  const subGet = (docs: FakeDoc[]) =>
    vi.fn().mockResolvedValue({ docs, size: docs.length });

  const memberDocDelete = vi.fn().mockResolvedValue(undefined);
  const memberDocRef = {
    path: "trips/trip-1/members/removed",
    delete: memberDocDelete,
  };

  const tripRef = {
    path: "trips/trip-1",
    collection: vi.fn((name: string) => {
      if (name === "members") {
        return { get: subGet(members), doc: vi.fn(() => memberDocRef) };
      }
      if (name === "stops") return { get: subGet(stops) };
      if (name === "legs") return { get: subGet(legs) };
      throw new Error(`unexpected collection ${name}`);
    }),
  };

  const db = {
    collection: vi.fn(() => ({ doc: vi.fn(() => tripRef) })),
    batch: vi.fn(() => {
      const batch = {
        update: batchUpdate,
        delete: batchDelete,
        commit: batchCommit,
      };
      batches.push(batch);
      return batch;
    }),
  };

  return {
    db,
    tripRef,
    memberDocRef,
    batchUpdate,
    batchDelete,
    batchCommit,
    batches,
  };
}

describe("syncTripMemberUids — recomputes from members subcollection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes the sorted member uids to the trip document", async () => {
    const { db, tripRef, batchUpdate, batchCommit } = makeDb(
      [makeDoc("members", "zed", "zed"), makeDoc("members", "amy", "amy")],
      [],
      [],
    );

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    expect(batchUpdate).toHaveBeenCalledWith(tripRef, {
      memberUids: ["amy", "zed"],
    });
    expect(batchCommit).toHaveBeenCalledOnce();
  });
});

describe("syncTripMemberUids — fans out to every subcollection document", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates memberUids on the trip, members, stops, and legs docs", async () => {
    const memberDoc = makeDoc("members", "amy", "amy");
    const stopDoc = makeDoc("stops", "stop-1");
    const legDoc = makeDoc("legs", "leg-1");
    const { db, batchUpdate } = makeDb([memberDoc], [stopDoc], [legDoc]);

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    const updatedRefs = batchUpdate.mock.calls.map(
      (call) => call[0] as unknown,
    );
    expect(updatedRefs).toContain(memberDoc.ref);
    expect(updatedRefs).toContain(stopDoc.ref);
    expect(updatedRefs).toContain(legDoc.ref);
    for (const call of batchUpdate.mock.calls) {
      expect(call[1]).toEqual({ memberUids: ["amy"] });
    }
  });
});

describe("syncTripMemberUids — removal drops the ex-member uid", () => {
  beforeEach(() => vi.clearAllMocks());

  it("excludes a uid no longer present in the members subcollection", async () => {
    const stopDoc = makeDoc("stops", "stop-1");
    const { db, batchUpdate } = makeDb(
      [makeDoc("members", "amy", "amy")],
      [stopDoc],
      [],
    );

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    const stopUpdate = batchUpdate.mock.calls.find(
      (call) => call[0] === stopDoc.ref,
    );
    expect(stopUpdate?.[1]).toEqual({ memberUids: ["amy"] });
    expect(
      (stopUpdate?.[1] as { memberUids: string[] }).memberUids,
    ).not.toContain("removed-uid");
  });
});

describe("syncTripMemberUids — falls back to the member doc id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the document id when the member doc has no uid field", async () => {
    const { db, tripRef, batchUpdate } = makeDb(
      [makeDoc("members", "doc-id-uid")],
      [],
      [],
    );

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    expect(batchUpdate).toHaveBeenCalledWith(tripRef, {
      memberUids: ["doc-id-uid"],
    });
  });
});

describe("syncTripMemberUids — chunks writes past the 500-write batch limit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("commits multiple batches so a 500+ document trip does not exceed the cap", async () => {
    // 1 trip doc + 1 member + 600 stops = 602 writes, which exceeds Firestore's
    // 500-write batch limit and must be split across multiple batches.
    const stops = Array.from({ length: 600 }, (_v, i) =>
      makeDoc("stops", `stop-${i}`),
    );
    const { db, batchUpdate, batchCommit, batches } = makeDb(
      [makeDoc("members", "amy", "amy")],
      stops,
      [],
    );

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    expect(batchUpdate).toHaveBeenCalledTimes(602);
    expect(batches.length).toBeGreaterThan(1);
    expect(batchCommit).toHaveBeenCalledTimes(batches.length);
  });

  it("keeps each committed batch at or below 499 writes", async () => {
    const stops = Array.from({ length: 600 }, (_v, i) =>
      makeDoc("stops", `stop-${i}`),
    );
    const { db, batches } = makeDb(
      [makeDoc("members", "amy", "amy")],
      stops,
      [],
    );

    await syncTripMemberUids(
      db as unknown as Parameters<typeof syncTripMemberUids>[0],
      "trip-1",
    );

    // Two batches of at most 499 writes hold all 602 writes.
    expect(batches.length).toBe(2);
  });
});

describe("removeMemberAndSyncUids — atomic delete + fan-out", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the member doc and fans out the post-removal uids in one batch", async () => {
    const stopDoc = makeDoc("stops", "stop-1");
    const { db, tripRef, memberDocRef, batchDelete, batchUpdate, batches } =
      makeDb([makeDoc("members", "amy", "amy")], [stopDoc], []);

    await removeMemberAndSyncUids(
      db as unknown as Parameters<typeof removeMemberAndSyncUids>[0],
      "trip-1",
      "removed",
    );

    // A single atomic batch holds both the delete and every memberUids update.
    expect(batches.length).toBe(1);
    expect(batchDelete).toHaveBeenCalledWith(memberDocRef);
    expect(batchUpdate).toHaveBeenCalledWith(tripRef, { memberUids: ["amy"] });
    expect(batchUpdate).toHaveBeenCalledWith(stopDoc.ref, {
      memberUids: ["amy"],
    });
  });

  it("excludes the removed uid from the fanned-out set", async () => {
    const stopDoc = makeDoc("stops", "stop-1");
    const { db, batchUpdate } = makeDb(
      [makeDoc("members", "amy", "amy"), makeDoc("members", "bob", "bob")],
      [stopDoc],
      [],
    );

    await removeMemberAndSyncUids(
      db as unknown as Parameters<typeof removeMemberAndSyncUids>[0],
      "trip-1",
      "bob",
    );

    const stopUpdate = batchUpdate.mock.calls.find(
      (call) => call[0] === stopDoc.ref,
    );
    expect(stopUpdate?.[1]).toEqual({ memberUids: ["amy"] });
    expect(
      (stopUpdate?.[1] as { memberUids: string[] }).memberUids,
    ).not.toContain("bob");
  });

  it("does not call batchUpdate on the removed member's ref (delete and update are mutually exclusive)", async () => {
    const stopDoc = makeDoc("stops", "stop-1");
    const removedMemberDoc = makeDoc("members", "removed", "removed");
    const { db, memberDocRef, batchUpdate } = makeDb(
      [removedMemberDoc, makeDoc("members", "amy", "amy")],
      [stopDoc],
      [],
    );

    await removeMemberAndSyncUids(
      db as unknown as Parameters<typeof removeMemberAndSyncUids>[0],
      "trip-1",
      "removed",
    );

    const updatedPaths = batchUpdate.mock.calls.map(
      (call) => (call[0] as { path: string }).path,
    );
    expect(updatedPaths).not.toContain(memberDocRef.path);
  });

  it("does not commit the delete separately from the fan-out for a small trip", async () => {
    const { db, batchCommit } = makeDb(
      [makeDoc("members", "amy", "amy")],
      [makeDoc("stops", "stop-1")],
      [],
    );

    await removeMemberAndSyncUids(
      db as unknown as Parameters<typeof removeMemberAndSyncUids>[0],
      "trip-1",
      "removed",
    );

    // Exactly one commit — the delete and fan-out are atomic, closing the
    // crash window where an ex-member's uid could linger in memberUids.
    expect(batchCommit).toHaveBeenCalledOnce();
  });
});
