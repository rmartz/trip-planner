import type { Firestore } from "firebase-admin/firestore";

/**
 * Recomputes the denormalized `memberUids` array from the trip's `members`
 * subcollection and fans it out atomically to the trip document and every
 * `members`, `stops`, and `legs` document.
 *
 * This is the single seam that maintains the `memberUids` fan-out invariant
 * (documented in ARCHITECTURE.md): the array must stay in sync across all
 * trip-scoped documents whenever membership changes, otherwise ex-members
 * retain read access via `memberUids`-based security rules. Every membership
 * mutation (add on invite acceptance / trip creation, remove on guest removal)
 * must call this after writing the `members/{uid}` document.
 */
export async function syncTripMemberUids(
  db: Firestore,
  tripId: string,
): Promise<void> {
  const tripRef = db.collection("trips").doc(tripId);

  const [membersSnapshot, stopsSnapshot, legsSnapshot] = await Promise.all([
    tripRef.collection("members").get(),
    tripRef.collection("stops").get(),
    tripRef.collection("legs").get(),
  ]);

  const memberUidSet = new Set<string>();
  for (const memberDoc of membersSnapshot.docs) {
    const uidField = memberDoc.data()["uid"] as unknown;
    memberUidSet.add(typeof uidField === "string" ? uidField : memberDoc.id);
  }
  const memberUids = [...memberUidSet].sort();

  const refsToUpdate = [
    tripRef,
    ...membersSnapshot.docs.map((doc) => doc.ref),
    ...stopsSnapshot.docs.map((doc) => doc.ref),
    ...legsSnapshot.docs.map((doc) => doc.ref),
  ];

  const batch = db.batch();
  for (const ref of refsToUpdate) {
    batch.update(ref, { memberUids });
  }
  await batch.commit();
}
