import { type NextRequest, NextResponse } from "next/server";
import {
  acceptInviteByLink,
  getTripByInviteLink,
  InviteLinkExpiredError,
  InviteLinkRevokedError,
  InviteLinkUsedError,
  writeNotificationForTripInvite,
} from "@/services/invite";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { InviteError } from "@/lib/types/invite";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  try {
    const trip = await getTripByInviteLink(token);

    if (!trip) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: trip.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      memberCount: trip.memberUids.length,
    });
  } catch (err) {
    if (err instanceof InviteLinkExpiredError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Expired },
        { status: 410 },
      );
    }
    if (err instanceof InviteLinkRevokedError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Revoked },
        { status: 410 },
      );
    }
    if (err instanceof InviteLinkUsedError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Used },
        { status: 410 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

  try {
    const { tripId, alreadyMember } = await acceptInviteByLink(token, uid);
    if (!alreadyMember) {
      try {
        await writeNotificationForTripInvite(tripId, uid);
      } catch (notificationError) {
        console.error(
          "Failed to write trip invite notification",
          notificationError,
        );
      }
    }
    return NextResponse.json({ tripId, alreadyMember });
  } catch (err) {
    if (err instanceof InviteLinkExpiredError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Expired },
        { status: 410 },
      );
    }
    if (err instanceof InviteLinkRevokedError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Revoked },
        { status: 410 },
      );
    }
    if (err instanceof InviteLinkUsedError) {
      return NextResponse.json(
        { error: err.message, inviteError: InviteError.Used },
        { status: 410 },
      );
    }
    if (err instanceof Error && err.message === "Invalid invite token") {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
