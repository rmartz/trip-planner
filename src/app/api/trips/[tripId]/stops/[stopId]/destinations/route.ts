import { type NextRequest, NextResponse } from "next/server";
import { attachDestinationToStop } from "@/services/stop-destinations";
import { NotFoundError, PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    destinationId?: unknown;
    catalogUid?: unknown;
    destinationName?: unknown;
  };
  try {
    body = (await request.json()) as {
      destinationId?: unknown;
      catalogUid?: unknown;
      destinationName?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.destinationId !== "string" || !body.destinationId.trim()) {
    return NextResponse.json(
      { error: "destinationId is required" },
      { status: 400 },
    );
  }

  if (typeof body.catalogUid !== "string" || !body.catalogUid.trim()) {
    return NextResponse.json(
      { error: "catalogUid is required" },
      { status: 400 },
    );
  }

  if (
    typeof body.destinationName !== "string" ||
    !body.destinationName.trim()
  ) {
    return NextResponse.json(
      { error: "destinationName is required" },
      { status: 400 },
    );
  }

  const { tripId, stopId } = await params;

  try {
    await attachDestinationToStop(
      uid,
      tripId,
      stopId,
      body.destinationId.trim(),
      body.catalogUid.trim(),
      body.destinationName.trim(),
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

  return NextResponse.json({ ok: true });
}
