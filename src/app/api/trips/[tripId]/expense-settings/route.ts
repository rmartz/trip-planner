import { type NextRequest, NextResponse } from "next/server";
import {
  getExpenseSettings,
  setExpenseSettings,
} from "@/services/expense-settings";
import { getTripMemberRole } from "@/services/trips";
import type { ExpenseSettingsMap } from "@/lib/types/expense-settings";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

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
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await getExpenseSettings(tripId);
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { categories?: unknown };
  try {
    body = (await request.json()) as { categories?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (body.categories === undefined || body.categories === null) {
    return NextResponse.json(
      { error: "categories is required" },
      { status: 400 },
    );
  }

  const { tripId } = await params;
  const role = await getTripMemberRole(tripId, uid);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role !== TripRole.Planner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await setExpenseSettings(tripId, body.categories as ExpenseSettingsMap);
  return NextResponse.json({ ok: true });
}
