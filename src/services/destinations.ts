import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  destinationToFirebase,
  firebaseToDestination,
} from "@/lib/firebase/schema/destination";
import type { Destination } from "@/lib/types/destination";

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

export async function updateDestinationForUser(
  uid: string,
  destinationId: string,
  name: string,
  seasonality: string | undefined,
): Promise<void> {
  if (!name.trim()) throw new Error("name is required");

  const db = getAdminFirestore();
  await db
    .collection("users")
    .doc(uid)
    .collection("destinations")
    .doc(destinationId)
    .update(
      destinationToFirebase({ name: name.trim(), seasonality, tripIds: [] }),
    );
}
