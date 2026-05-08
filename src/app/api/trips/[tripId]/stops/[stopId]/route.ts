import { type NextRequest, NextResponse } from "next/server";
import { updateStop } from "@/services/stops";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; startDate?: unknown; endDate?: unknown };
  try {
    body = (await request.json()) as {
      name?: unknown;
      startDate?: unknown;
      endDate?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const fields: { name?: string; startDate?: Date; endDate?: Date } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    fields.name = body.name.trim();
  }

  if (body.startDate !== undefined) {
    if (typeof body.startDate !== "string") {
      return NextResponse.json(
        { error: "Invalid startDate format" },
        { status: 400 },
      );
    }
    const d = new Date(body.startDate);
    if (isNaN(d.getTime()))
      return NextResponse.json(
        { error: "Invalid startDate format" },
        { status: 400 },
      );
    fields.startDate = d;
  }

  if (body.endDate !== undefined) {
    if (typeof body.endDate !== "string") {
      return NextResponse.json(
        { error: "Invalid endDate format" },
        { status: 400 },
      );
    }
    const d = new Date(body.endDate);
    if (isNaN(d.getTime()))
      return NextResponse.json(
        { error: "Invalid endDate format" },
        { status: 400 },
      );
    fields.endDate = d;
  }

  const { tripId, stopId } = await params;

  try {
    await updateStop(uid, tripId, stopId, fields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Planners")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
