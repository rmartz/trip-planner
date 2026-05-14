import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { NotFoundError } from "./errors";

export interface LodgingInviteeCandidates {
  candidateUids: string[];
  invitedUids: string[];
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

  const snapshot = await stopRef.collection("lodging").get();

  return snapshot.docs
    .map((doc) => firebaseToLodging(doc.id, stopId, doc.data()))
    .filter((record) => canViewLodgingRecord(record, uid));
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
    invitedUids:
      Array.isArray(hostData["invitedUids"]) &&
      hostData["invitedUids"].every(
        (inviteeUid): inviteeUid is string => typeof inviteeUid === "string",
      )
        ? hostData["invitedUids"].filter((inviteeUid) =>
            candidateUids.has(inviteeUid),
          )
        : [],
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

  const uniqueInvitedUids = Array.from(new Set(invitedUids));
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

function canViewLodgingRecord(record: LodgingRecord, uid: string): boolean {
  if (record.uid === uid) {
    return true;
  }

  return (
    record.status === LodgingStatus.SecuredCapacity &&
    record.invitedUids?.includes(uid) === true
  );
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
      .map((doc) => doc.id)
      .filter((memberUid) => memberUid !== hostUid)
      .filter((memberUid) => {
        return lodgingStatusByUid.get(memberUid) === LodgingStatus.NeedLodging;
      }),
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
