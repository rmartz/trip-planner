import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLodging } from "@/lib/firebase/schema/lodging";
import { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";
import { NotFoundError } from "./errors";

export async function getLodgingForStop(
  tripId: string,
  stopId: string,
): Promise<LodgingRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("stops")
    .doc(stopId)
    .collection("lodging")
    .get();
  return snapshot.docs.map((doc) =>
    firebaseToLodging(doc.id, stopId, doc.data()),
  );
}

export async function setLodgingInvitees(
  hostUid: string,
  tripId: string,
  stopId: string,
  invitedUids: string[],
): Promise<void> {
  const db = getAdminFirestore();
  const stopRef = db
    .collection("trips")
    .doc(tripId)
    .collection("stops")
    .doc(stopId);

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
