import { type NextRequest, NextResponse } from "next/server";
import {
  getTripAvailability,
  setMyTripAvailability,
} from "@/services/trip-availability";
import { PlannerOnlyError } from "@/services/errors";
import { getTripMemberRole } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateKey(dateKey: string) {
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(5, 7));
  const day = Number(dateKey.slice(8, 10));
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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

  const availability = await getTripAvailability(tripId);

  return NextResponse.json({ availability });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { availableDates?: unknown };
  try {
    body = (await request.json()) as { availableDates?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const rawDates = body.availableDates;
  if (
    !Array.isArray(rawDates) ||
    !rawDates.every((d): d is string => typeof d === "string")
  ) {
    return NextResponse.json(
      { error: "availableDates must be an array of strings" },
      { status: 400 },
    );
  }

  if (!rawDates.every((d) => DATE_KEY_RE.test(d))) {
    return NextResponse.json(
      { error: "availableDates entries must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  if (!rawDates.every(isValidDateKey)) {
    return NextResponse.json(
      { error: "availableDates entries must be valid YYYY-MM-DD dates" },
      { status: 400 },
    );
  }

  const { tripId } = await params;

  try {
    await setMyTripAvailability(uid, tripId, rawDates);
  } catch (err) {
    if (err instanceof PlannerOnlyError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
