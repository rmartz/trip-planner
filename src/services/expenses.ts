import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToExpense } from "@/lib/firebase/schema/expense";
import type { Expense } from "@/lib/types/expense";

export async function getExpensesForTrip(tripId: string): Promise<Expense[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("trips")
    .doc(tripId)
    .collection("expenses")
    .get();

  return snapshot.docs.map((doc) =>
    firebaseToExpense(doc.id, tripId, doc.data()),
  );
}
