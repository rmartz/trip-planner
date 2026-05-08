import { type NextRequest, NextResponse } from "next/server";
import { getTripByInviteToken, acceptInvite } from "@/services/invite";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const trip = await getTripByInviteToken(token);

  if (!trip) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: trip.name,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    memberCount: trip.memberUids.length,
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

  try {
    const { tripId, alreadyMember } = await acceptInvite(token, uid);
    return NextResponse.json({ tripId, alreadyMember });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid invite token") {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
