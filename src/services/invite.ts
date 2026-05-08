import { randomBytes } from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

function generateToken(): string {
  return randomBytes(8).toString("base64url");
}

export async function getTripByInviteToken(
  token: string,
): Promise<Trip | undefined> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .where("inviteToken", "==", token)
    .where("inviteToken", "!=", "")
    .limit(1)
    .get();

  const [doc] = snapshot.docs;
  if (!doc) return undefined;
  return firebaseToTrip(doc.id, doc.data());
}

export interface AcceptInviteResult {
  tripId: string;
  alreadyMember: boolean;
}

export async function acceptInvite(
  token: string,
  uid: string,
): Promise<AcceptInviteResult> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .where("inviteToken", "==", token)
    .where("inviteToken", "!=", "")
    .limit(1)
    .get();

  const [tripDoc] = snapshot.docs;
  if (!tripDoc) throw new Error("Invalid invite token");

  const tripId = tripDoc.id;
  const memberRef = db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(uid);

  const existing = await memberRef.get();
  if (existing.exists) return { tripId, alreadyMember: true };

  await memberRef.set({ uid, role: TripRole.Guest, joinedAt: new Date() });
  return { tripId, alreadyMember: false };
}

export async function regenerateInviteToken(tripId: string): Promise<string> {
  const token = generateToken();
  const db = getAdminFirestore();
  await db.collection("trips").doc(tripId).update({ inviteToken: token });
  return token;
}
