import { type NextRequest, NextResponse } from "next/server";
import { updateLeg, softDeleteLeg } from "@/services/legs";
import { PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; legId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    fromStopId?: unknown;
    toStopId?: unknown;
    name?: unknown;
    notes?: unknown;
    isActive?: unknown;
  };
  try {
    body = (await request.json()) as {
      fromStopId?: unknown;
      toStopId?: unknown;
      name?: unknown;
      notes?: unknown;
      isActive?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const fields: {
    fromStopId?: string;
    toStopId?: string;
    name?: string;
    notes?: string;
    isActive?: boolean;
  } = {};
  if (typeof body.fromStopId === "string") fields.fromStopId = body.fromStopId;
  if (typeof body.toStopId === "string") fields.toStopId = body.toStopId;
  if (typeof body.name === "string") fields.name = body.name;
  if (typeof body.notes === "string") fields.notes = body.notes;
  if (typeof body.isActive === "boolean") fields.isActive = body.isActive;

  const { tripId, legId } = await params;

  try {
    await updateLeg(uid, tripId, legId, fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PlannerOnlyError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (
      error instanceof Error &&
      (error.message.includes("is required") ||
        error.message.includes("must be different"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, legId } = await params;

  try {
    await softDeleteLeg(uid, tripId, legId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PlannerOnlyError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
