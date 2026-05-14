import { type NextRequest, NextResponse } from "next/server";
import { addStop, getStopMemberRole, getStopsForTrip } from "@/services/stops";
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
  const role = await getStopMemberRole(uid, tripId);

  if (role === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stops = await getStopsForTrip(tripId);

  return NextResponse.json({
    stops: stops.map((stop) => ({
      ...stop,
      startDate: stop.startDate.toISOString(),
      endDate: stop.endDate.toISOString(),
    })),
    role,
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown; startDate: unknown; endDate: unknown };
  try {
    body = (await request.json()) as {
      name: unknown;
      startDate: unknown;
      endDate: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (
    typeof body.name !== "string" ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string"
  ) {
    return NextResponse.json(
      { error: "name, startDate, and endDate are required" },
      { status: 400 },
    );
  }

  if (!body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before or equal to endDate" },
      { status: 400 },
    );
  }

  const { tripId } = await params;
  const stopId = await addStop(
    uid,
    tripId,
    body.name.trim(),
    startDate,
    endDate,
  );

  return NextResponse.json({ stopId });
}
