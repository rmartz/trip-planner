import { type NextRequest, NextResponse } from "next/server";
import {
  publishSchedule,
  PublishScheduleForbiddenError,
} from "@/services/schedule";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderedActivityIds: unknown };
  try {
    body = (await request.json()) as { orderedActivityIds: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (
    !Array.isArray(body.orderedActivityIds) ||
    !body.orderedActivityIds.every((id) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "orderedActivityIds must be an array of strings" },
      { status: 400 },
    );
  }

  const { tripId, stopId } = await params;

  try {
    await publishSchedule(uid, tripId, stopId, body.orderedActivityIds);
  } catch (error) {
    if (error instanceof PublishScheduleForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: "published" });
}
