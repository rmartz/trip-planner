import { type NextRequest, NextResponse } from "next/server";
import { promoteGuestToPlanner, removeGuest } from "@/services/members";
import { NotFoundError, PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; memberId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action: unknown };
  try {
    body = (await request.json()) as { action: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (body.action !== "promote") {
    return NextResponse.json(
      { error: "action must be 'promote'" },
      { status: 400 },
    );
  }

  const { tripId, memberId } = await params;

  try {
    await promoteGuestToPlanner(uid, tripId, memberId);
    return NextResponse.json({ ok: true });
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, memberId } = await params;

  try {
    await removeGuest(uid, tripId, memberId);
    return NextResponse.json({ ok: true });
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
