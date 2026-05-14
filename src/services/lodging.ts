import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { LodgingStatus } from "@/lib/types/lodging";
import { PlannerOnlyError } from "./errors";
import { getLegMemberRole } from "./legs";
import { TripRole } from "@/lib/types/trip";

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
  const lodgingRef = db
    .collection("trips")
    .doc(tripId)
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
