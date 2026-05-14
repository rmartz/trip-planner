import { type NextRequest, NextResponse } from "next/server";
import { setLodgingInvitees } from "@/services/lodging";
import { NotFoundError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { invitedUids?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (parsed === null || typeof parsed !== "object") {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const rawUids = body.invitedUids;
  if (
    !Array.isArray(rawUids) ||
    !rawUids.every((u): u is string => typeof u === "string")
  ) {
    return NextResponse.json(
      { error: "invitedUids must be an array of strings" },
      { status: 400 },
    );
  }

  const { tripId, stopId } = await params;

  try {
    await setLodgingInvitees(uid, tripId, stopId, rawUids);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
