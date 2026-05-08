import { type NextRequest, NextResponse } from "next/server";
import { regenerateInviteToken } from "@/services/invite";
import { getTripMemberRole } from "@/services/trips";
import { TripRole } from "@/lib/types/trip";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;
  const role = await getTripMemberRole(tripId, uid);

  if (role !== TripRole.Planner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const inviteToken = await regenerateInviteToken(tripId);
  return NextResponse.json({ inviteToken });
}
