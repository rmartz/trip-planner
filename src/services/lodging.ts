import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { NotFoundError } from "./errors";

export async function getLodgingForStop(
  uid: string,
  tripId: string,
  stopId: string,
): Promise<LodgingRecord[]> {
  const tripRef = await getTripRefForMember(uid, tripId);
  const snapshot = await tripRef
    .collection("stops")
    .doc(stopId)
    .collection("lodging")
    .get();

  return snapshot.docs
    .map((doc) => firebaseToLodging(doc.id, stopId, doc.data()))
    .filter((record) => canViewLodgingRecord(record, uid));
}

export async function setLodgingInvitees(
  hostUid: string,
  tripId: string,
  stopId: string,
  invitedUids: string[],
): Promise<void> {
  const tripRef = await getTripRefForMember(hostUid, tripId);
  const stopRef = tripRef.collection("stops").doc(stopId);

  const hostDoc = await stopRef.collection("lodging").doc(hostUid).get();
  if (!hostDoc.exists) {
    throw new NotFoundError("Lodging record not found for this host.");
  }

  const hostData = hostDoc.data() ?? {};
  const hostStatus = hostData["status"] as string | undefined;
  if (hostStatus !== LodgingStatus.SecuredCapacity) {
    throw new Error("Only hosts with secured capacity can invite guests.");
  }

  await stopRef.collection("lodging").doc(hostUid).update({
    invitedUids,
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
