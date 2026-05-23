import { type NextRequest, NextResponse } from "next/server";
import {
  getExpenseSettings,
  setExpenseSettings,
} from "@/services/expense-settings";
import { getTripMemberRole } from "@/services/trips";
import {
  ExpenseSettingsCategory,
  ExpenseUnitModel,
} from "@/lib/types/expense-settings";
import type { ExpenseSettingsMap } from "@/lib/types/expense-settings";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

const KNOWN_CATEGORIES = new Set<string>(
  Object.values(ExpenseSettingsCategory),
);
const KNOWN_UNIT_MODELS = new Set<string>(Object.values(ExpenseUnitModel));

function parseCategories(raw: unknown): ExpenseSettingsMap | null {
  if (
    raw === null ||
    raw === undefined ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    return null;
  }
  const input = raw as Record<string, unknown>;
  for (const key of Object.keys(input)) {
    if (!KNOWN_CATEGORIES.has(key)) return null;
  }
  const result = {} as ExpenseSettingsMap;
  for (const category of Object.values(ExpenseSettingsCategory)) {
    const value = input[category];
    if (
      value === null ||
      value === undefined ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return null;
    }
    const entry = value as Record<string, unknown>;
    const unitModel = entry["unitModel"];
    if (typeof unitModel !== "string" || !KNOWN_UNIT_MODELS.has(unitModel)) {
      return null;
    }
    const ids = entry["defaultParticipantMemberIds"];
    let participantIds: string[] | null = null;
    if (ids !== null && ids !== undefined) {
      if (
        !Array.isArray(ids) ||
        !ids.every((id): id is string => typeof id === "string")
      ) {
        return null;
      }
      participantIds = ids;
    }
    result[category] = {
      unitModel: unitModel as ExpenseUnitModel,
      defaultParticipantMemberIds: participantIds,
    };
  }
  return result;
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

  const categories = parseCategories(body.categories);
  if (categories === null) {
    return NextResponse.json(
      { error: "categories is required and must be a valid settings map" },
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

  await setExpenseSettings(tripId, categories);
  return NextResponse.json({ ok: true });
}
