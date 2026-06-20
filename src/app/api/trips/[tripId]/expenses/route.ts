import { type NextRequest, NextResponse } from "next/server";
import { addExpense, getExpensesForTrip } from "@/services/expenses";
import { getTripMemberRole, getTripMemberUids } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";
import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import {
  EXPENSE_CATEGORY_VALUES,
  EXPENSE_LINKED_ENTITY_TYPE_VALUES,
  EXPENSE_SPLIT_METHOD_VALUES,
  isValidCurrencyCode,
} from "./expense-validation";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;
  const role = await getTripMemberRole(tripId, uid);
  if (role === undefined) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expenses = await getExpensesForTrip(tripId);

  return NextResponse.json({
    expenses: expenses.map((expense) => ({
      ...expense,
    })),
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  const role = await getTripMemberRole(tripId, uid);
  if (role === undefined) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (rawBody === null || typeof rawBody !== "object") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const body = rawBody as {
    name: unknown;
    amount: unknown;
    currency: unknown;
    category: unknown;
    payerUid: unknown;
    participantUids: unknown;
    splitMethod: unknown;
    linkedEntity?: unknown;
  };

  if (
    typeof body.name !== "string" ||
    typeof body.amount !== "number" ||
    typeof body.currency !== "string" ||
    typeof body.category !== "string" ||
    typeof body.payerUid !== "string" ||
    !Array.isArray(body.participantUids) ||
    typeof body.splitMethod !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "name, amount, currency, category, payerUid, participantUids, and splitMethod are required",
      },
      { status: 400 },
    );
  }

  if (!body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!Number.isFinite(body.amount) || body.amount <= 0) {
    return NextResponse.json(
      { error: "amount must be greater than 0" },
      { status: 400 },
    );
  }

  if (!isValidCurrencyCode(body.currency)) {
    return NextResponse.json(
      { error: "currency must be a valid ISO 4217 code" },
      { status: 400 },
    );
  }

  if (!EXPENSE_CATEGORY_VALUES.has(body.category as ExpenseCategory)) {
    return NextResponse.json(
      { error: "category must be a valid expense category" },
      { status: 400 },
    );
  }

  if (
    !EXPENSE_SPLIT_METHOD_VALUES.has(body.splitMethod as ExpenseSplitMethod)
  ) {
    return NextResponse.json(
      { error: "splitMethod must be a valid expense split method" },
      { status: 400 },
    );
  }

  if (
    !body.participantUids.every(
      (participantUid): participantUid is string =>
        typeof participantUid === "string",
    )
  ) {
    return NextResponse.json(
      { error: "participantUids must be an array of strings" },
      { status: 400 },
    );
  }

  if (body.participantUids.length === 0) {
    return NextResponse.json(
      { error: "participantUids must include at least one member" },
      { status: 400 },
    );
  }

  const tripMemberUids = new Set(await getTripMemberUids(tripId));
  if (!tripMemberUids.has(body.payerUid)) {
    return NextResponse.json(
      { error: "payerUid must be a trip member" },
      { status: 400 },
    );
  }

  if (
    !body.participantUids.every((participantUid) =>
      tripMemberUids.has(participantUid),
    )
  ) {
    return NextResponse.json(
      { error: "participantUids must all be trip members" },
      { status: 400 },
    );
  }

  if (
    body.linkedEntity !== undefined &&
    body.linkedEntity !== null &&
    typeof body.linkedEntity !== "object"
  ) {
    return NextResponse.json(
      { error: "linkedEntity must be an object" },
      { status: 400 },
    );
  }

  const linkedEntityRaw =
    body.linkedEntity !== undefined && body.linkedEntity !== null
      ? (body.linkedEntity as Record<string, unknown>)
      : undefined;

  let linkedEntity:
    | {
        type: ExpenseLinkedEntityType;
        entityId: string;
        label: string;
      }
    | undefined;
  if (linkedEntityRaw !== undefined) {
    if (
      typeof linkedEntityRaw["type"] !== "string" ||
      typeof linkedEntityRaw["entityId"] !== "string" ||
      typeof linkedEntityRaw["label"] !== "string"
    ) {
      return NextResponse.json(
        {
          error: "linkedEntity must include type, entityId, and label strings",
        },
        { status: 400 },
      );
    }

    if (
      !EXPENSE_LINKED_ENTITY_TYPE_VALUES.has(
        linkedEntityRaw["type"] as ExpenseLinkedEntityType,
      )
    ) {
      return NextResponse.json(
        { error: "linkedEntity.type must be a valid linked entity type" },
        { status: 400 },
      );
    }

    linkedEntity = {
      type: linkedEntityRaw["type"] as ExpenseLinkedEntityType,
      entityId: linkedEntityRaw["entityId"],
      label: linkedEntityRaw["label"],
    };
  }

  const expenseId = await addExpense(uid, tripId, {
    name: body.name.trim(),
    amount: body.amount,
    currency: body.currency,
    category: body.category as ExpenseCategory,
    payerUid: body.payerUid,
    participantUids: body.participantUids,
    splitMethod: body.splitMethod as ExpenseSplitMethod,
    ...(linkedEntity !== undefined ? { linkedEntity } : {}),
  });

  return NextResponse.json({ expenseId });
}
