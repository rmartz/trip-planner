import {
  type ExpenseUnitModel,
  isExpenseUnitModel,
} from "@/lib/types/expense-settings";

export function parseUnitModel(
  raw: unknown,
): ExpenseUnitModel | undefined | Response {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (!isExpenseUnitModel(raw)) {
    return Response.json(
      { error: "unitModel must be a valid expense unit model" },
      { status: 400 },
    );
  }
  return raw;
}

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
