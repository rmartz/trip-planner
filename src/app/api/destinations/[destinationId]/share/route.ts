import { type NextRequest, NextResponse } from "next/server";
import { shareDestinationToUser } from "@/services/destinations";
import { NotFoundError, PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ destinationId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { recipientUid?: unknown; tripId?: unknown };
  try {
    body = (await request.json()) as {
      recipientUid?: unknown;
      tripId?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.recipientUid !== "string" || !body.recipientUid.trim()) {
    return NextResponse.json(
      { error: "recipientUid is required" },
      { status: 400 },
    );
  }

  if (typeof body.tripId !== "string" || !body.tripId.trim()) {
    return NextResponse.json({ error: "tripId is required" }, { status: 400 });
  }

  const { destinationId } = await params;

  try {
    const newDestinationId = await shareDestinationToUser(
      uid,
      body.recipientUid.trim(),
      body.tripId.trim(),
      destinationId,
    );
    return NextResponse.json(
      { destinationId: newDestinationId },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof PlannerOnlyError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
