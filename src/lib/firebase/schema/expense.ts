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

function toNumericRecord(value: unknown): Record<string, number> | undefined {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return undefined;
  }

  const record: Record<string, number> = {};
  for (const [key, recordValue] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (typeof recordValue === "number" && Number.isFinite(recordValue)) {
      record[key] = recordValue;
    }
  }
  return Object.keys(record).length > 0 ? record : undefined;
}

export function firebaseToExpense(
  expenseId: string,
  tripId: string,
  data: DocumentData,
): Expense {
  const linkedEntity = toLinkedEntity(data["linkedEntity"]);
  const participantAmounts = toNumericRecord(data["participantAmounts"]);
  const participantShares = toNumericRecord(data["participantShares"]);
  const confirmedParticipantUids = toParticipantUids(
    data["confirmedParticipantUids"],
  );
  return {
    expenseId,
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    amount: (data["amount"] as number | undefined) ?? 0,
    currency: (data["currency"] as string | undefined) ?? "USD",
    category:
      (data["category"] as ExpenseCategory | undefined) ??
      ExpenseCategory.Other,
    payerUid: (data["payerUid"] as string | undefined) ?? "",
    participantUids: toParticipantUids(data["participantUids"]),
    splitMethod:
      (data["splitMethod"] as ExpenseSplitMethod | undefined) ??
      ExpenseSplitMethod.Even,
    ...(participantAmounts !== undefined ? { participantAmounts } : {}),
    ...(participantShares !== undefined ? { participantShares } : {}),
    ...(confirmedParticipantUids.length > 0
      ? { confirmedParticipantUids }
      : {}),
    ...(linkedEntity !== undefined ? { linkedEntity } : {}),
  };
}

export function expenseToFirebase(
  expense: Omit<Expense, "expenseId" | "tripId">,
): {
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  participantAmounts?: Record<string, number>;
  participantShares?: Record<string, number>;
  confirmedParticipantUids?: string[];
  linkedEntity?: ExpenseLinkedEntity;
} {
  return {
    name: expense.name,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    payerUid: expense.payerUid,
    participantUids: expense.participantUids,
    splitMethod: expense.splitMethod,
    ...(expense.participantAmounts !== undefined
      ? { participantAmounts: expense.participantAmounts }
      : {}),
    ...(expense.participantShares !== undefined
      ? { participantShares: expense.participantShares }
      : {}),
    ...(expense.confirmedParticipantUids !== undefined
      ? { confirmedParticipantUids: expense.confirmedParticipantUids }
      : {}),
    ...(expense.linkedEntity !== undefined
      ? { linkedEntity: expense.linkedEntity }
      : {}),
  };
}
