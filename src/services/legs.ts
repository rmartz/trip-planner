import { ServerValue } from "firebase-admin/database";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToLeg } from "@/lib/firebase/schema/trip";
import { getUnreadCountPath } from "@/lib/firebase/schema/unread-count";
import { NotificationType } from "@/lib/types/notification";
import { TripRole } from "@/lib/types/trip";
import type { Leg } from "@/lib/types/trip";
import { PlannerOnlyError } from "./errors";

export async function getLegsForTrip(tripId: string): Promise<Leg[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("legs")
    .orderBy("order")
    .get();
  return snapshot.docs
    .map((doc) => firebaseToLeg(doc.id, tripId, doc.data()))
    .filter((leg) => leg.isActive);
}

export async function getLegMemberRole(
  uid: string,
  tripId: string,
): Promise<TripRole | null> {
  const db = getAdminFirestore();
  const memberDoc = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(uid)
    .get();
  if (!memberDoc.exists) return null;
  return (memberDoc.data()?.["role"] as TripRole | undefined) ?? null;
}

export async function addLeg(
  uid: string,
  tripId: string,
  fromStopId: string,
  toStopId: string,
  name: string,
  notes?: string,
): Promise<string> {
  if (!fromStopId.trim()) throw new Error("fromStopId is required");
  if (!toStopId.trim()) throw new Error("toStopId is required");
  if (fromStopId === toStopId)
    throw new Error("fromStopId and toStopId must be different");
  if (!name.trim()) throw new Error("name is required");

  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new Error("Only Planners can add legs");
  }

  const tripDoc = await tripRef.get();
  const memberUids =
    (tripDoc.data()?.["memberUids"] as string[] | undefined) ?? [];

  const existingLegs = await tripRef
    .collection("legs")
    .orderBy("order", "desc")
    .limit(1)
    .get();
  const nextOrder = existingLegs.empty
    ? 0
    : ((existingLegs.docs[0]?.data()["order"] as number | undefined) ?? 0) + 1;

  const legRef = tripRef.collection("legs").doc();
  await legRef.set({
    fromStopId,
    toStopId,
    name,
    ...(notes !== undefined && { notes }),
    order: nextOrder,
    memberUids,
    isActive: true,
  });

  return legRef.id;
}

export async function updateLeg(
  uid: string,
  tripId: string,
  legId: string,
  fields: {
    fromStopId?: string;
    toStopId?: string;
    name?: string;
    notes?: string;
    isActive?: boolean;
  },
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can edit legs");
  }

  const updates: Record<string, unknown> = {};
  if (fields.fromStopId !== undefined) {
    if (!fields.fromStopId.trim()) throw new Error("fromStopId is required");
    updates["fromStopId"] = fields.fromStopId;
  }
  if (fields.toStopId !== undefined) {
    if (!fields.toStopId.trim()) throw new Error("toStopId is required");
    updates["toStopId"] = fields.toStopId;
  }
  if (fields.name !== undefined) {
    if (!fields.name.trim()) throw new Error("name is required");
    updates["name"] = fields.name;
  }
  if (fields.notes !== undefined) {
    updates["notes"] = fields.notes;
  }
  if (fields.isActive !== undefined) {
    updates["isActive"] = fields.isActive;
  }

  if (Object.keys(updates).length === 0) return;

  await tripRef.collection("legs").doc(legId).update(updates);
}

export async function softDeleteLeg(
  uid: string,
  tripId: string,
  legId: string,
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can remove legs");
  }

  await tripRef.collection("legs").doc(legId).update({ isActive: false });
}

export async function getAffectedGuestsForLeg(
  tripId: string,
  legId: string,
): Promise<string[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("transportation")
    .where("legId", "==", legId)
    .get();

  const uniqueUids = [
    ...new Set(
      snapshot.docs
        .map((doc) => doc.data()["uid"] as string | undefined)
        .filter((uid): uid is string => !!uid),
    ),
  ];
  if (uniqueUids.length === 0) return [];

  const tripMembersRef = db
    .collection("trips")
    .doc(tripId)
    .collection("members");
  const memberDocs = await Promise.all(
    uniqueUids.map((uid) => tripMembersRef.doc(uid).get()),
  );

  return memberDocs
    .filter(
      (memberDoc) =>
        ((memberDoc.data()?.["role"] as TripRole | undefined) ??
          TripRole.Guest) === TripRole.Guest,
    )
    .map((memberDoc) => memberDoc.id);
}

export async function hardDeleteLeg(
  uid: string,
  tripId: string,
  legId: string,
): Promise<void> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists || memberDoc.data()?.["role"] !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can permanently delete legs");
  }

  await tripRef.collection("legs").doc(legId).delete();
}

export async function getArchivedLegsForTrip(tripId: string): Promise<Leg[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("legs")
    .where("isActive", "==", false)
    .orderBy("order")
    .get();
  return snapshot.docs.map((doc) => firebaseToLeg(doc.id, tripId, doc.data()));
}

export async function getAllLegsForTrip(tripId: string): Promise<Leg[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("legs")
    .orderBy("order")
    .get();
  return snapshot.docs.map((doc) => firebaseToLeg(doc.id, tripId, doc.data()));
}

export async function getLegById(
  tripId: string,
  legId: string,
): Promise<Leg | undefined> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("trips")
    .doc(tripId)
    .collection("legs")
    .doc(legId)
    .get();
  const data = doc.data();
  if (!data) return undefined;
  return firebaseToLeg(doc.id, tripId, data);
}

export async function writeNotificationsForLegDeletion(
  tripId: string,
  legId: string,
  legName: string,
): Promise<void> {
  const affectedUids = await getAffectedGuestsForLeg(tripId, legId);
  if (affectedUids.length === 0) return;

  const db = getAdminFirestore();
  const rtdb = getAdminDatabase();
  await Promise.all(
    affectedUids.map(async (uid) => {
      const userRef = db.collection("users").doc(uid);
      const notificationRef = userRef.collection("notifications").doc();
      const batch = db.batch();
      batch.set(notificationRef, {
        createdAt: FieldValue.serverTimestamp(),
        read: false,
        title: legName,
        tripId,
        triggerType: NotificationType.LegRemoved,
        type: NotificationType.LegRemoved,
        uid,
      });
      batch.set(
        userRef,
        { unreadCount: FieldValue.increment(1) },
        { merge: true },
      );
      await batch.commit();
      await rtdb.ref(getUnreadCountPath(uid)).set(ServerValue.increment(1));
    }),
  );
}
