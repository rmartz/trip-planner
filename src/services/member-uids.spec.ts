import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncTripMemberUids } from "./member-uids";

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
  const batchCommit = vi.fn().mockResolvedValue(undefined);

  const subGet = (docs: FakeDoc[]) =>
    vi.fn().mockResolvedValue({ docs, size: docs.length });

  const tripRef = {
    path: "trips/trip-1",
    collection: vi.fn((name: string) => {
      if (name === "members") return { get: subGet(members) };
      if (name === "stops") return { get: subGet(stops) };
      if (name === "legs") return { get: subGet(legs) };
      throw new Error(`unexpected collection ${name}`);
    }),
  };

  const db = {
    collection: vi.fn(() => ({ doc: vi.fn(() => tripRef) })),
    batch: vi.fn(() => ({ update: batchUpdate, commit: batchCommit })),
  };

  return { db, tripRef, batchUpdate, batchCommit };
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
