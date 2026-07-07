import type { DocumentData } from "firebase/firestore";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import type { Expense, ExpenseLinkedEntity } from "@/lib/types/expense";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";
import { toEnumOrUndefined, toLinkedEntity, toStringArray } from "./helpers";

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
  const confirmedParticipantUids = toStringArray(
    data["confirmedParticipantUids"],
    "confirmedParticipantUids",
  );
  const unitModel = toEnumOrUndefined(
    ExpenseUnitModel,
    data["unitModel"],
    "unitModel",
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
    participantUids: toStringArray(data["participantUids"], "participantUids"),
    splitMethod:
      (data["splitMethod"] as ExpenseSplitMethod | undefined) ??
      ExpenseSplitMethod.Even,
    ...(participantAmounts !== undefined ? { participantAmounts } : {}),
    ...(participantShares !== undefined ? { participantShares } : {}),
    ...(confirmedParticipantUids.length > 0
      ? { confirmedParticipantUids }
      : {}),
    ...(linkedEntity !== undefined ? { linkedEntity } : {}),
    ...(unitModel !== undefined ? { unitModel } : {}),
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
  unitModel?: ExpenseUnitModel;
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
    ...(expense.unitModel !== undefined
      ? { unitModel: expense.unitModel }
      : {}),
  };
}
