import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  expenseSettingsToFirebase,
  firebaseToExpenseSettings,
} from "@/lib/firebase/schema/expense-settings";
import type { ExpenseSettingsMap } from "@/lib/types/expense-settings";

const SETTINGS_DOC = "config";

export async function getExpenseSettings(
  tripId: string,
): Promise<ExpenseSettingsMap> {
  const db = getAdminFirestore();
  const doc = await db
    .collection("trips")
    .doc(tripId)
    .collection("expenseSettings")
    .doc(SETTINGS_DOC)
    .get();
  return firebaseToExpenseSettings(doc.exists ? (doc.data() ?? {}) : {});
}

export async function setExpenseSettings(
  tripId: string,
  settings: ExpenseSettingsMap,
): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection("trips")
    .doc(tripId)
    .collection("expenseSettings")
    .doc(SETTINGS_DOC)
    .set(expenseSettingsToFirebase(settings));
}
