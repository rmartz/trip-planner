import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  destinationToFirebase,
  firebaseToDestination,
} from "@/lib/firebase/schema/destination";
import { NotFoundError, PlannerOnlyError } from "./errors";
import type { Destination } from "@/lib/types/destination";
import { TripRole } from "@/lib/types/trip";

export async function getDestinationsForUser(
  uid: string,
): Promise<Destination[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("destinations")
    .get();
  return snapshot.docs.map((doc) =>
    firebaseToDestination(doc.id, uid, doc.data()),
  );
}

export async function createDestinationForUser(
  uid: string,
  name: string,
  seasonality: string | undefined,
): Promise<string> {
  if (!name.trim()) throw new Error("name is required");

  const db = getAdminFirestore();
  const ref = db.collection("users").doc(uid).collection("destinations").doc();
  await ref.set(
    destinationToFirebase({ name: name.trim(), seasonality, tripIds: [] }),
  );
  return ref.id;
}

export async function shareDestinationToUser(
  senderUid: string,
  recipientUid: string,
  tripId: string,
  destinationId: string,
): Promise<string> {
  const db = getAdminFirestore();

  const memberDoc = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(senderUid)
    .get();

  if (!memberDoc.exists) {
    throw new PlannerOnlyError("Only Planners can share destinations");
  }

  const role = memberDoc.data()?.["role"] as string | undefined;
  if (role !== TripRole.Planner) {
    throw new PlannerOnlyError("Only Planners can share destinations");
  }

  const recipientMemberDoc = await db
    .collection("trips")
    .doc(tripId)
    .collection("members")
    .doc(recipientUid)
    .get();

  if (!recipientMemberDoc.exists) {
    throw new NotFoundError("Recipient is not a member of this trip");
  }

  const sourceDoc = await db
    .collection("users")
    .doc(senderUid)
    .collection("destinations")
    .doc(destinationId)
    .get();

  if (!sourceDoc.exists || !sourceDoc.data()) {
    throw new NotFoundError("Destination not found");
  }

  const source = firebaseToDestination(
    destinationId,
    senderUid,
    sourceDoc.data() as Record<string, unknown>,
  );

  const ref = db
    .collection("users")
    .doc(recipientUid)
    .collection("destinations")
    .doc();

  await ref.set(
    destinationToFirebase({
      name: source.name,
      seasonality: source.seasonality,
      tripIds: [],
    }),
  );

  return ref.id;
}

export async function updateDestinationForUser(
  uid: string,
  destinationId: string,
  name: string,
  seasonality: string | undefined,
): Promise<void> {
  if (!name.trim()) throw new Error("name is required");

  const db = getAdminFirestore();
  const update: { name: string; seasonality?: string } = {
    name: name.trim(),
  };
  if (seasonality !== undefined) {
    update.seasonality = seasonality;
  }
  await db
    .collection("users")
    .doc(uid)
    .collection("destinations")
    .doc(destinationId)
    .update(update);
}
