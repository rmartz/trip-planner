import { randomUUID } from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTripMember } from "@/lib/firebase/schema/trip";
import { firebaseToNonAccountMember } from "@/lib/firebase/schema/non-account-member";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "./errors";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";

export interface TripMembersResult {
  accountMembers: TripMember[];
  nonAccountMembers: NonAccountMember[];
}

export async function getMembersForTrip(
  tripId: string,
): Promise<TripMembersResult> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const [membersSnapshot, nonAccountSnapshot] = await Promise.all([
    tripRef.collection("members").get(),
    tripRef.collection("nonAccountMembers").get(),
  ]);

  const rawAccountMembers = membersSnapshot.docs.map((doc) =>
    firebaseToTripMember(doc.id, tripId, doc.data()),
  );

  const nonAccountMembers = nonAccountSnapshot.docs.map((doc) =>
    firebaseToNonAccountMember(doc.id, tripId, doc.data()),
  );

  const uids = rawAccountMembers.map((m) => m.uid);
  const displayNameByUid = await resolveDisplayNames(uids);

  const accountMembers = rawAccountMembers.map((m) => ({
    ...m,
    displayName: displayNameByUid[m.uid],
  }));

  return { accountMembers, nonAccountMembers };
}

export async function resolveDisplayNames(
  uids: string[],
): Promise<Record<string, string | undefined>> {
  if (uids.length === 0) return {};
  const db = getAdminFirestore();
  const snapshots = await Promise.all(
    uids.map((uid) => db.collection("users").doc(uid).get()),
  );
  const result: Record<string, string | undefined> = {};
  for (const snap of snapshots) {
    result[snap.id] = snap.data()?.["displayName"] as string | undefined;
  }
  return result;
}

export async function addNonAccountMember(
  uid: string,
  tripId: string,
  name: string,
): Promise<NonAccountMember> {
  if (!name.trim()) throw new Error("name is required");

  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const requesterDoc = await tripRef.collection("members").doc(uid).get();
  if (
    !requesterDoc.exists ||
    requesterDoc.data()?.["role"] !== TripRole.Planner
  ) {
    throw new PlannerOnlyError("Only Planners can add members");
  }

  const claimToken = generateClaimToken();
  const nonAccountRef = tripRef.collection("nonAccountMembers").doc();

  const plannerProfileSnap = await db.collection("users").doc(uid).get();
  const proxiedByName =
    (plannerProfileSnap.data()?.["displayName"] as string | undefined) ?? uid;

  await nonAccountRef.set({
    name: name.trim(),
    proxiedBy: uid,
    proxiedByName,
    claimToken,
    claimedBy: undefined,
  });

  return {
    nonAccountMemberId: nonAccountRef.id,
    tripId,
    name: name.trim(),
    proxiedBy: uid,
    proxiedByName,
    claimToken,
    claimedBy: undefined,
  };
}

export async function promoteGuestToPlanner(
  uid: string,
  tripId: string,
  targetUid: string,
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const requesterDoc = await tripRef.collection("members").doc(uid).get();
  if (
    !requesterDoc.exists ||
    requesterDoc.data()?.["role"] !== TripRole.Planner
  ) {
    throw new PlannerOnlyError("Only Planners can promote members");
  }

  const targetDoc = await tripRef.collection("members").doc(targetUid).get();
  if (!targetDoc.exists || targetDoc.data()?.["role"] !== TripRole.Guest) {
    throw new NotFoundError("Target member not found or is not a Guest");
  }

  await tripRef
    .collection("members")
    .doc(targetUid)
    .update({ role: TripRole.Planner });
}

export async function removeGuest(
  uid: string,
  tripId: string,
  targetUid: string,
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const requesterDoc = await tripRef.collection("members").doc(uid).get();
  if (
    !requesterDoc.exists ||
    requesterDoc.data()?.["role"] !== TripRole.Planner
  ) {
    throw new PlannerOnlyError("Only Planners can remove members");
  }

  const targetDoc = await tripRef.collection("members").doc(targetUid).get();
  if (!targetDoc.exists || targetDoc.data()?.["role"] !== TripRole.Guest) {
    throw new NotFoundError("Target member not found or is not a Guest");
  }

  await tripRef.collection("members").doc(targetUid).delete();
}

export function generateClaimToken(): string {
  return randomUUID();
}

export async function getNonAccountMemberByToken(
  claimToken: string,
): Promise<(NonAccountMember & { tripId: string }) | undefined> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collectionGroup("nonAccountMembers")
    .where("claimToken", "==", claimToken)
    .limit(1)
    .get();

  if (snapshot.empty) return undefined;

  const doc = snapshot.docs[0];
  if (!doc) return undefined;

  const tripRef = doc.ref.parent.parent;
  if (!tripRef) return undefined;

  return firebaseToNonAccountMember(doc.id, tripRef.id, doc.data());
}
