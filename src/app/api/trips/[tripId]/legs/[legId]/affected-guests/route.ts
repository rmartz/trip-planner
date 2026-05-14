import { type NextRequest, NextResponse } from "next/server";
import { getAffectedGuestsForLeg, getTripMemberRole } from "@/services/legs";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

interface RouteContext {
  params: Promise<{ tripId: string; legId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, legId } = await params;

  const role = await getTripMemberRole(uid, tripId);
  if (role !== TripRole.Planner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const affectedGuestUids = await getAffectedGuestsForLeg(tripId, legId);
  return NextResponse.json({ affectedGuestUids });
}
