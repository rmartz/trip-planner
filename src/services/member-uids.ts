import type {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  WriteBatch,
} from "firebase-admin/firestore";

// Firestore caps a WriteBatch at 500 operations. We chunk well under that so a
// large trip's fan-out never throws on commit (see issue #427).
const MAX_BATCH_WRITES = 499;

function computeMemberUids(
  memberDocs: DocumentSnapshot[],
  excludeUid?: string,
): string[] {
  const memberUidSet = new Set<string>();
  for (const memberDoc of memberDocs) {
    const uidField = memberDoc.data()?.["uid"] as unknown;
    const uid = typeof uidField === "string" ? uidField : memberDoc.id;
    if (uid !== excludeUid) memberUidSet.add(uid);
  }
  return [...memberUidSet].sort();
}

/**
 * Commits a list of write operations in chunks of at most `MAX_BATCH_WRITES`,
 * one batch per chunk, so the total can exceed Firestore's 500-write batch cap.
 *
 * **Atomicity note:** each chunk commits atomically, but chunks do not commit
 * atomically with respect to one another. For the fan-out invariant this is
 * safe for the add/refresh path (a partial fan-out is an availability nuisance,
 * corrected by the next sync). For the security-critical removal path
 * (`removeMemberAndSyncUids`) the realistic case is a single chunk and is fully
 * atomic; the >499-write degradation to best-effort is documented there.
 */
async function commitInChunks(
  db: Firestore,
  writes: ((batch: WriteBatch) => void)[],
): Promise<void> {
  for (let i = 0; i < writes.length; i += MAX_BATCH_WRITES) {
    const batch = db.batch();
    for (const applyWrite of writes.slice(i, i + MAX_BATCH_WRITES)) {
      applyWrite(batch);
    }
    await batch.commit();
  }
}

async function readTripScopedRefs(
  db: Firestore,
  tripId: string,
): Promise<{
  memberDocs: DocumentSnapshot[];
  refsToUpdate: DocumentReference[];
}> {
  const tripRef = db.collection("trips").doc(tripId);

  const [membersSnapshot, stopsSnapshot, legsSnapshot] = await Promise.all([
    tripRef.collection("members").get(),
    tripRef.collection("stops").get(),
    tripRef.collection("legs").get(),
  ]);

  const refsToUpdate = [
    tripRef,
    ...membersSnapshot.docs.map((doc) => doc.ref),
    ...stopsSnapshot.docs.map((doc) => doc.ref),
    ...legsSnapshot.docs.map((doc) => doc.ref),
  ];

  return { memberDocs: membersSnapshot.docs, refsToUpdate };
}

/**
 * Recomputes the denormalized `memberUids` array from the trip's `members`
 * subcollection and fans it out to the trip document and every `members`,
 * `stops`, and `legs` document.
 *
 * This is the single seam that maintains the `memberUids` fan-out invariant
 * (documented in ARCHITECTURE.md): the array must stay in sync across all
 * trip-scoped documents whenever membership changes, otherwise ex-members
 * retain read access via `memberUids`-based security rules. Add/refresh
 * mutations (invite acceptance, trip creation) call this after writing the
 * `members/{uid}` document. The writes are chunked (issue #427) so a trip with
 * 500+ documents does not exceed Firestore's batch limit; a partial fan-out on
 * this path is only an availability nuisance and is corrected by the next sync.
 *
 * The security-critical **removal** path uses `removeMemberAndSyncUids`, which
 * keeps the delete and fan-out in a single atomic batch for the realistic case.
 */
export async function syncTripMemberUids(
  db: Firestore,
  tripId: string,
): Promise<void> {
  const { memberDocs, refsToUpdate } = await readTripScopedRefs(db, tripId);
  const memberUids = computeMemberUids(memberDocs);

  await commitInChunks(
    db,
    refsToUpdate.map(
      (ref) => (batch: WriteBatch) => batch.update(ref, { memberUids }),
    ),
  );
}

/**
 * Removes a member and fans out the post-removal `memberUids` set in one write
 * plan, closing the crash window from a non-atomic delete-then-sync (issue
 * #426). The member-doc delete and every `memberUids` overwrite are placed in a
 * single batch, so for the realistic case (< 500 trip-scoped writes) the
 * removal and fan-out commit **atomically** — the ex-member's UID can never
 * linger in `memberUids` after the delete lands.
 *
 * **Degradation beyond 499 writes:** Firestore caps a batch at 500 operations,
 * so a trip with 500+ trip-scoped documents is chunked across multiple batches
 * that do not commit atomically together. The member delete is placed in the
 * first chunk alongside the trip document, so a crash mid-fan-out still removes
 * the member and clears the trip doc's `memberUids`, but some subcollection
 * documents may transiently retain the ex-member's UID until the next sync. At
 * current scale (a trip has far fewer than 500 documents) this path is a single
 * atomic batch; the degradation only applies at implausible scale.
 */
export async function removeMemberAndSyncUids(
  db: Firestore,
  tripId: string,
  removedUid: string,
): Promise<void> {
  const { memberDocs, refsToUpdate } = await readTripScopedRefs(db, tripId);
  const memberUids = computeMemberUids(memberDocs, removedUid);

  const memberRef = db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(removedUid);

  const writes: ((batch: WriteBatch) => void)[] = [
    (batch) => batch.delete(memberRef),
    ...refsToUpdate
      .filter((ref) => ref.path !== memberRef.path)
      .map((ref) => (batch: WriteBatch) => batch.update(ref, { memberUids })),
  ];

  await commitInChunks(db, writes);
}
