import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  firebaseToUnavailableRange,
  unavailableRangeToFirebase,
} from "@/lib/firebase/schema/unavailable-range";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

export async function getUnavailableRanges(
  uid: string,
): Promise<UnavailableRange[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("unavailableRanges")
    .orderBy("startDate")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) =>
    firebaseToUnavailableRange(doc.id, uid, doc.data()),
  );
}

export async function createUnavailableRange(
  uid: string,
  range: Omit<UnavailableRange, "rangeId" | "uid">,
): Promise<UnavailableRange> {
  const db = getAdminFirestore();
  const ref = await db
    .collection("users")
    .doc(uid)
    .collection("unavailableRanges")
    .add(unavailableRangeToFirebase(range));
  return { rangeId: ref.id, uid, ...range };
}

export async function deleteUnavailableRange(
  uid: string,
  rangeId: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection("users")
    .doc(uid)
    .collection("unavailableRanges")
    .doc(rangeId)
    .delete();
}
