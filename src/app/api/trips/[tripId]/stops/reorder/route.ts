import { type NextRequest, NextResponse } from "next/server";
import { reorderStops } from "@/services/stops";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { stopIds: unknown };
  try {
    body = (await request.json()) as { stopIds: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (
    !Array.isArray(body.stopIds) ||
    !body.stopIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "stopIds must be an array of strings" },
      { status: 400 },
    );
  }

  const { tripId } = await params;

  try {
    await reorderStops(uid, tripId, body.stopIds);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Planners")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
