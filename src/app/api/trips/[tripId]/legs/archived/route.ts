import { type NextRequest, NextResponse } from "next/server";
import { getArchivedLegsForTrip, getLegMemberRole } from "@/services/legs";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { TripRole } from "@/lib/types/trip";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  const role = await getLegMemberRole(uid, tripId);
  if (role !== TripRole.Planner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const legs = await getArchivedLegsForTrip(tripId);
  return NextResponse.json({ legs });
}
