import { randomBytes } from "crypto";
import { ServerValue } from "firebase-admin/database";
import { getAdminDatabase, getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { getUnreadCountPath } from "@/lib/firebase/schema/unread-count";
import { NotificationType } from "@/lib/types/notification";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";
import {
  GROUP_USE_TTL_DAYS,
  type InviteLink,
  InviteMode,
  SINGLE_USE_TTL_DAYS,
} from "@/lib/types/invite";
import { FieldValue } from "firebase-admin/firestore";

export class InviteLinkExpiredError extends Error {
  constructor() {
    super("This invite link has expired");
  }
}

export class InviteLinkRevokedError extends Error {
  constructor() {
    super("This invite link is no longer active");
  }
}

export class InviteLinkUsedError extends Error {
  constructor() {
    super("This invite has already been used");
  }
}

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

export async function createInviteLink(
  tripId: string,
  mode: InviteMode,
): Promise<InviteLink> {
  const db = getAdminFirestore();
  const ttlDays =
    mode === InviteMode.SingleUse ? SINGLE_USE_TTL_DAYS : GROUP_USE_TTL_DAYS;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const token = generateToken();
    try {
      await db.collection("invites").doc(token).create({
        consumedAt: null,
        createdAt: now,
        expiresAt,
        mode,
        revokedAt: null,
        tripId,
      });
      return { createdAt: now, expiresAt, mode, token, tripId };
    } catch (err) {
      if ((err as { code?: number }).code !== 6) throw err;
      // token collision — retry with a new token
    }
  }
  throw new Error("Failed to create invite link: too many token collisions");
}

interface InviteFirebaseData {
  consumedAt: { toDate(): Date } | null;
  expiresAt: { toDate(): Date };
  mode: InviteMode;
  revokedAt: { toDate(): Date } | null;
  tripId: string;
}

function validateInviteData(data: InviteFirebaseData): void {
  const now = new Date();
  if (data.expiresAt.toDate() <= now) throw new InviteLinkExpiredError();
  if (data.consumedAt != null) throw new InviteLinkUsedError();
  if (data.revokedAt != null) throw new InviteLinkRevokedError();
}

export async function getTripByInviteLink(
  token: string,
): Promise<Trip | undefined> {
  const db = getAdminFirestore();
  const inviteSnap = await db.collection("invites").doc(token).get();
  if (!inviteSnap.exists) return undefined;

  const data = inviteSnap.data() as InviteFirebaseData;
  validateInviteData(data);

  const tripSnap = await db.collection("trips").doc(data.tripId).get();
  if (!tripSnap.exists) return undefined;
  const tripData = tripSnap.data();
  if (!tripData) return undefined;
  return firebaseToTrip(tripSnap.id, tripData);
}

export async function acceptInviteByLink(
  token: string,
  uid: string,
): Promise<AcceptInviteResult> {
  const db = getAdminFirestore();
  const inviteRef = db.collection("invites").doc(token);

  return db.runTransaction(async (txn) => {
    const inviteSnap = await txn.get(inviteRef);
    if (!inviteSnap.exists) throw new Error("Invalid invite token");

    const data = inviteSnap.data() as InviteFirebaseData;
    validateInviteData(data);

    const { tripId, mode } = data;
    const tripRef = db.collection("trips").doc(tripId);
    const memberRef = tripRef.collection("members").doc(uid);

    const memberSnap = await txn.get(memberRef);
    if (memberSnap.exists) return { alreadyMember: true, tripId };

    txn.set(memberRef, { joinedAt: new Date(), role: TripRole.Guest, uid });
    txn.update(tripRef, { memberUids: FieldValue.arrayUnion(uid) });
    if (mode === InviteMode.SingleUse) {
      txn.update(inviteRef, { consumedAt: new Date() });
    }

    return { alreadyMember: false, tripId };
  });
}

export async function revokeInviteLink(token: string): Promise<void> {
  const db = getAdminFirestore();
  try {
    await db.collection("invites").doc(token).update({ revokedAt: new Date() });
  } catch (err) {
    if ((err as { code?: number }).code === 5 /* gRPC NOT_FOUND */) {
      throw new Error("Invite not found", { cause: err });
    }
    throw err;
  }
}

export async function writeNotificationForTripInvite(
  tripId: string,
  uid: string,
): Promise<void> {
  const db = getAdminFirestore();
  const rtdb = getAdminDatabase();

  const tripSnap = await db.collection("trips").doc(tripId).get();
  const title = (tripSnap.data()?.["name"] as string | undefined) ?? "";

  const userRef = db.collection("users").doc(uid);
  const notificationRef = userRef.collection("notifications").doc();
  const batch = db.batch();
  batch.set(notificationRef, {
    createdAt: FieldValue.serverTimestamp(),
    read: false,
    title,
    tripId,
    triggerType: NotificationType.TripInvite,
    type: NotificationType.TripInvite,
    uid,
  });
  batch.set(userRef, { unreadCount: FieldValue.increment(1) }, { merge: true });
  await batch.commit();
  await rtdb.ref(getUnreadCountPath(uid)).set(ServerValue.increment(1));
}
