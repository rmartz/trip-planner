import { type NextRequest, NextResponse } from "next/server";
import { addLeg, getLegsForTrip } from "@/services/legs";
import { getTripMemberRole } from "@/services/trips";
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
  const [legs, role] = await Promise.all([
    getLegsForTrip(tripId),
    getTripMemberRole(tripId, uid),
  ]);

  return NextResponse.json({ legs, role: role ?? null });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    fromStopId: unknown;
    toStopId: unknown;
    name: unknown;
    notes?: unknown;
  };
  try {
    body = (await request.json()) as {
      fromStopId: unknown;
      toStopId: unknown;
      name: unknown;
      notes?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.fromStopId !== "string" || !body.fromStopId.trim()) {
    return NextResponse.json(
      { error: "fromStopId is required" },
      { status: 400 },
    );
  }

  if (typeof body.toStopId !== "string" || !body.toStopId.trim()) {
    return NextResponse.json(
      { error: "toStopId is required" },
      { status: 400 },
    );
  }

  if (body.fromStopId === body.toStopId) {
    return NextResponse.json(
      { error: "fromStopId and toStopId must be different" },
      { status: 400 },
    );
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const notes = typeof body.notes === "string" ? body.notes : undefined;

  const { tripId } = await params;
  const legId = await addLeg(
    uid,
    tripId,
    body.fromStopId,
    body.toStopId,
    body.name,
    notes,
  );

  return NextResponse.json({ legId });
}
