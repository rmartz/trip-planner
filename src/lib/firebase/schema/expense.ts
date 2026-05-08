import type { DocumentData } from "firebase/firestore";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import type {
  Expense,
  ExpenseLinkedEntity,
  ExpenseLinkedEntityType,
} from "@/lib/types/expense";

function toParticipantUids(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function toLinkedEntity(value: unknown): ExpenseLinkedEntity | undefined {
  if (value === null || value === undefined || typeof value !== "object") {
    return undefined;
  }
  const obj = value as Record<string, unknown>;
  const type = obj["type"] as ExpenseLinkedEntityType | undefined;
  const entityId = obj["entityId"] as string | undefined;
  const label = obj["label"] as string | undefined;
  if (!type || !entityId || !label) {
    return undefined;
  }
  return { type, entityId, label };
}

export function firebaseToExpense(
  expenseId: string,
  tripId: string,
  data: DocumentData,
): Expense {
  const linkedEntity = toLinkedEntity(data["linkedEntity"]);
  return {
    expenseId,
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    amount: (data["amount"] as number | undefined) ?? 0,
    category:
      (data["category"] as ExpenseCategory | undefined) ??
      ExpenseCategory.Other,
    payerUid: (data["payerUid"] as string | undefined) ?? "",
    participantUids: toParticipantUids(data["participantUids"]),
    splitMethod:
      (data["splitMethod"] as ExpenseSplitMethod | undefined) ??
      ExpenseSplitMethod.Even,
    ...(linkedEntity !== undefined ? { linkedEntity } : {}),
  };
}

export function expenseToFirebase(
  expense: Omit<Expense, "expenseId" | "tripId">,
): {
  name: string;
  amount: number;
  category: ExpenseCategory;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  linkedEntity?: ExpenseLinkedEntity;
} {
  return {
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    payerUid: expense.payerUid,
    participantUids: expense.participantUids,
    splitMethod: expense.splitMethod,
    ...(expense.linkedEntity !== undefined
      ? { linkedEntity: expense.linkedEntity }
      : {}),
  };
}
