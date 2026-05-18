import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  expenseToFirebase,
  firebaseToExpense,
} from "@/lib/firebase/schema/expense";
import type { Expense } from "@/lib/types/expense";
import { TripRole } from "@/lib/types/trip";

export async function getExpenseMemberRole(
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
  return (memberDoc.data()?.["role"] as TripRole | undefined) ?? TripRole.Guest;
}

export async function getExpensesForTrip(tripId: string): Promise<Expense[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("expenses")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) =>
    firebaseToExpense(doc.id, tripId, doc.data()),
  );
}

export async function addExpense(
  uid: string,
  tripId: string,
  expense: Omit<Expense, "expenseId" | "tripId">,
): Promise<string> {
  const db = getAdminFirestore();
  const tripRef = db.collection("trips").doc(tripId);

  const memberDoc = await tripRef.collection("members").doc(uid).get();
  if (!memberDoc.exists) {
    throw new Error("Only trip members can add expenses");
  }

  const expenseRef = tripRef.collection("expenses").doc();
  await expenseRef.set({
    ...expenseToFirebase(expense),
    createdAt: new Date(),
  });

  return expenseRef.id;
}
