import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { TripRole } from "@/lib/types/trip";
import { NotFoundError, PlannerOnlyError } from "./errors";
import { getLegMemberRole } from "./legs";

export interface LodgingInviteeCandidates {
  candidateUids: string[];
  invitedUids: string[];
}

export async function setMemberSortedOwnLodging(
  plannerUid: string,
  tripId: string,
  stopId: string,
  memberId: string,
  sortedOwn: boolean,
): Promise<void> {
  const role = await getLegMemberRole(plannerUid, tripId);
  if (role !== TripRole.Planner) {
    throw new PlannerOnlyError();
  }

  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const nonAccountMemberDoc = await tripRef
    .collection("nonAccountMembers")
    .doc(memberId)
    .get();
  if (!nonAccountMemberDoc.exists) {
    throw new NotFoundError("Member not found in non-account members");
  }

  const lodgingRef = tripRef
    .collection("stops")
    .doc(stopId)
    .collection("lodging")
    .doc(memberId);

  if (sortedOwn) {
    await lodgingRef.set(
      {
        status: LodgingStatus.SecuredPrivate,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    await lodgingRef.set(
      {
        status: LodgingStatus.NeedLodging,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}

export async function getLodgingForStop(
  uid: string,
  tripId: string,
  stopId: string,
): Promise<LodgingRecord[]> {
  const tripRef = await getTripRefForMember(uid, tripId);
  const stopRef = tripRef.collection("stops").doc(stopId);
  const stopDoc = await stopRef.get();
  if (!stopDoc.exists) {
    throw new NotFoundError("Stop not found");
  }

  const lodgingRef = stopRef.collection("lodging");
  const ownDoc = await lodgingRef.doc(uid).get();

  if (!ownDoc.exists) {
    return [];
  }

  const ownRecord = firebaseToLodging(uid, stopId, ownDoc.data() ?? {});

  if (ownRecord.status !== LodgingStatus.NeedLodging) {
    return [ownRecord];
  }

  const invitedSnapshot = await lodgingRef
    .where("status", "==", LodgingStatus.SecuredCapacity)
    .where("invitedUids", "array-contains", uid)
    .get();

  const invitedRecords = invitedSnapshot.docs.map((doc) =>
    firebaseToLodging(doc.id, stopId, doc.data()),
  );

  return [ownRecord, ...invitedRecords];
}

export async function getLodgingInviteeCandidates(
  hostUid: string,
  tripId: string,
  stopId: string,
): Promise<LodgingInviteeCandidates> {
  const tripRef = await getTripRefForMember(hostUid, tripId);
  const stopRef = tripRef.collection("stops").doc(stopId);
  const hostData = await getInviteableHostData(hostUid, stopRef);
  const candidateUids = await getEligibleInviteeUids(hostUid, tripRef, stopRef);

  return {
    candidateUids: Array.from(candidateUids),
    invitedUids: getFilteredInvitedUids(hostData, candidateUids),
  };
}

export async function setLodgingInvitees(
  hostUid: string,
  tripId: string,
  stopId: string,
  invitedUids: string[],
): Promise<void> {
  const tripRef = await getTripRefForMember(hostUid, tripId);
  const stopRef = tripRef.collection("stops").doc(stopId);
  await getInviteableHostData(hostUid, stopRef);

  const uniqueInvitedUidSet = new Set(invitedUids);
  const uniqueInvitedUids = Array.from(uniqueInvitedUidSet);
  const eligibleInviteeUids = await getEligibleInviteeUids(
    hostUid,
    tripRef,
    stopRef,
  );

  if (
    !uniqueInvitedUids.every((inviteeUid) =>
      eligibleInviteeUids.has(inviteeUid),
    )
  ) {
    throw new Error(
      "All invited guests must be trip members who need lodging for this stop.",
    );
  }

  await stopRef.collection("lodging").doc(hostUid).update({
    invitedUids: uniqueInvitedUids,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function getTripRefForMember(uid: string, tripId: string) {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);
  const memberDoc = await tripRef.collection("members").doc(uid).get();

  if (!memberDoc.exists) {
    throw new NotFoundError("Trip not found");
  }

  return tripRef;
}

async function getEligibleInviteeUids(
  hostUid: string,
  tripRef: FirebaseFirestore.DocumentReference,
  stopRef: FirebaseFirestore.DocumentReference,
): Promise<Set<string>> {
  const [membersSnapshot, lodgingSnapshot] = await Promise.all([
    tripRef.collection("members").get(),
    stopRef.collection("lodging").get(),
  ]);

  const lodgingStatusByUid = new Map(
    lodgingSnapshot.docs.map((doc) => [
      doc.id,
      doc.data()["status"] as string | undefined,
    ]),
  );

  return new Set(
    membersSnapshot.docs
      .filter((doc) => doc.id !== hostUid)
      .filter(
        (doc) =>
          (doc.data()["role"] as string | undefined) !== TripRole.Planner,
      )
      .filter(
        (doc) => lodgingStatusByUid.get(doc.id) === LodgingStatus.NeedLodging,
      )
      .map((doc) => doc.id),
  );
}

async function getInviteableHostData(
  hostUid: string,
  stopRef: FirebaseFirestore.DocumentReference,
) {
  const hostDoc = await stopRef.collection("lodging").doc(hostUid).get();
  if (!hostDoc.exists) {
    throw new NotFoundError("Lodging record not found for this host.");
  }

  const hostData = hostDoc.data() ?? {};
  const hostStatus = hostData["status"] as string | undefined;
  if (hostStatus !== LodgingStatus.SecuredCapacity) {
    throw new Error("Only hosts with secured capacity can invite guests.");
  }

  return hostData;
}

function getFilteredInvitedUids(
  hostData: Record<string, unknown>,
  candidateUids: Set<string>,
): string[] {
  const invitedUids = hostData["invitedUids"];

  if (
    !Array.isArray(invitedUids) ||
    !invitedUids.every((inviteeUid): inviteeUid is string => {
      return typeof inviteeUid === "string";
    })
  ) {
    return [];
  }

  return invitedUids.filter((inviteeUid) => candidateUids.has(inviteeUid));
}
