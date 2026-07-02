import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";

export const EXPENSE_CATEGORY_VALUES = new Set(Object.values(ExpenseCategory));
export const EXPENSE_LINKED_ENTITY_TYPE_VALUES = new Set(
  Object.values(ExpenseLinkedEntityType),
);
export const EXPENSE_SPLIT_METHOD_VALUES = new Set(
  Object.values(ExpenseSplitMethod),
);
export const EXPENSE_UNIT_MODEL_VALUES = new Set(
  Object.values(ExpenseUnitModel),
);

const SUPPORTED_CURRENCY_CODES =
  typeof Intl.supportedValuesOf === "function"
    ? new Set(Intl.supportedValuesOf("currency"))
    : null;

export function isValidCurrencyCode(currency: string): boolean {
  if (!/^[A-Z]{3}$/.test(currency)) {
    return false;
  }

  if (SUPPORTED_CURRENCY_CODES !== null) {
    return SUPPORTED_CURRENCY_CODES.has(currency);
  }

  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(0);
    return true;
  } catch {
    return false;
  }
}
