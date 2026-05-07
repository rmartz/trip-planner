import { type NextRequest, NextResponse } from "next/server";
import { updateLeg } from "@/services/legs";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; legId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { fromStopId?: unknown; toStopId?: unknown };
  try {
    body = (await request.json()) as {
      fromStopId?: unknown;
      toStopId?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const fields: { fromStopId?: string; toStopId?: string } = {};
  if (typeof body.fromStopId === "string") fields.fromStopId = body.fromStopId;
  if (typeof body.toStopId === "string") fields.toStopId = body.toStopId;

  const { tripId, legId } = await params;

  try {
    await updateLeg(uid, tripId, legId, fields);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
