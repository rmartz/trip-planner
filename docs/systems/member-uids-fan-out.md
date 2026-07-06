---
type: System
title: memberUids Fan-Out Invariant
description: How the denormalized memberUids array is kept in sync across every trip-scoped document whenever membership changes.
resource: src/services/member-uids.ts
tags: [firestore, security, membership]
timestamp: 2026-07-02
---

# memberUids Fan-Out Invariant

Every trip-scoped document — the `trips/{tripId}` document itself and each of its
`members/{uid}`, `stops/{stopId}`, and `legs/{legId}` subcollection documents —
carries a denormalized `memberUids: string[]` field. Firestore security rules
authorize reads against this field (`request.auth.uid in resource.data.memberUids`
via `isTripMemberFromResource()` in `firestore.rules`), because a rule cannot
perform a subcollection lookup to check membership on every read.

## The invariant

> For a given trip, the `memberUids` array must be **identical** on the trip
> document and on every one of its `members`, `stops`, and `legs` documents, and
> must equal exactly the set of account-member UIDs in the trip's `members`
> subcollection.

If a member is added but the fan-out is skipped, the new member cannot read the
stops/legs that predate their join. **More importantly, if a member is removed but
the fan-out is skipped, the ex-member's UID lingers in `memberUids` on the
subcollection documents and they retain read access to them.** This is a security
correctness requirement, not merely a consistency nicety.

## Where it is enforced

All writes go through the Admin SDK (client writes are denied by the rules). Two
seams in [`src/services/member-uids.ts`](../../src/services/member-uids.ts)
maintain the invariant:

- **`syncTripMemberUids(db, tripId)`** — the add/refresh seam: it reads the
  current `members` subcollection, recomputes the sorted UID set, and writes it
  to the trip document and every subcollection document. It is idempotent, so it
  is safe to call after any membership mutation.
- **`removeMemberAndSyncUids(db, tripId, removedUid)`** — the removal seam: it
  computes the post-removal UID set (excluding `removedUid`) and places the
  member-doc **delete** and every `memberUids` overwrite in a **single atomic
  batch**. This closes the crash window a non-atomic delete-then-sync would open,
  where the ex-member's UID could linger in `memberUids` after the delete landed.

### The 500-write batch limit

Firestore caps a `WriteBatch` at 500 operations. Both seams chunk their writes
into batches of at most 499, committing a batch per chunk, so a trip with 500+
trip-scoped documents never throws on commit.

Chunks commit atomically **within** a chunk but not **across** chunks. For the
add/refresh path a partial fan-out is only an availability nuisance (corrected by
the next sync). For the security-critical removal path the realistic case (a trip
has far fewer than 500 documents) is a single chunk and therefore fully atomic;
only at implausible scale (500+ documents) does the removal degrade to
best-effort, where the member delete and the trip-doc `memberUids` clear land in
the first chunk but some subcollection documents may transiently retain the
ex-member's UID until the next sync.

Every membership mutation calls one of the seams (or seeds `memberUids` directly
for a brand-new trip that has no subcollections yet):

| Mutation                                        | How the invariant is maintained                                                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createTripForUser` (`src/services/trips.ts`)   | Seeds `memberUids: [creatorUid]` on the trip and member documents in the creation batch (no subcollections exist).                                                                      |
| `acceptInvite` (`src/services/invite.ts`)       | Writes the `members/{uid}` document, then calls `syncTripMemberUids`.                                                                                                                   |
| `acceptInviteByLink` (`src/services/invite.ts`) | Adds the member in a transaction (with `arrayUnion` on the trip doc), then calls `syncTripMemberUids` post-commit to fan out to the stops/legs documents the transaction did not touch. |
| `removeGuest` (`src/services/members.ts`)       | Calls `removeMemberAndSyncUids`, which deletes the `members/{uid}` document and fans out the set **excluding** the removed UID in a single atomic batch.                                |

New stops and legs (`addStop` / `addLeg`) copy the trip document's current
`memberUids` at creation time, so they inherit the correct set as long as the trip
document is kept current by the seam above.

## Backfilling existing data

`syncTripMemberUids` maintains the invariant going forward. To backfill
`memberUids` onto trips that predate it, run the one-off
[`migrate-member-uids`](../scripts/migrate-member-uids.md) script before deploying
rules that authorize via `memberUids`.
