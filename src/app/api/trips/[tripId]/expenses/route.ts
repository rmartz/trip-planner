import { type NextRequest, NextResponse } from "next/server";
import { addExpense, getExpensesForTrip } from "@/services/expenses";
import { getTripMemberRole } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";
import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";

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

  const { tripId } = await params;

  const role = await getTripMemberRole(tripId, uid);
  if (role === undefined) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const linkedEntityRaw =
    body.linkedEntity !== undefined &&
    body.linkedEntity !== null &&
    typeof body.linkedEntity === "object"
      ? (body.linkedEntity as Record<string, unknown>)
      : undefined;

  const linkedEntity =
    linkedEntityRaw !== undefined &&
    typeof linkedEntityRaw["type"] === "string" &&
    typeof linkedEntityRaw["entityId"] === "string" &&
    typeof linkedEntityRaw["label"] === "string"
      ? {
          type: linkedEntityRaw["type"] as ExpenseLinkedEntityType,
          entityId: linkedEntityRaw["entityId"],
          label: linkedEntityRaw["label"],
        }
      : undefined;

  const expenseId = await addExpense(uid, tripId, {
    name: body.name.trim(),
    amount: body.amount,
    currency: body.currency,
    category: body.category as ExpenseCategory,
    payerUid: body.payerUid,
    participantUids: body.participantUids as string[],
    splitMethod: body.splitMethod as ExpenseSplitMethod,
    ...(linkedEntity !== undefined ? { linkedEntity } : {}),
  });

  return NextResponse.json({ expenseId });
}
