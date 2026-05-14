import { type NextRequest, NextResponse } from "next/server";
import { getTripDestinations } from "@/services/stop-destinations";
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

  const role = await getTripMemberRole(tripId, uid);
  if (role === undefined) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const destinations = await getTripDestinations(tripId);
  return NextResponse.json(destinations);
}
