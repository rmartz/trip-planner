import { type NextRequest, NextResponse } from "next/server";
import { getLodgingForStop } from "@/services/lodging";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, stopId } = await params;
  const records = await getLodgingForStop(tripId, stopId);

  return NextResponse.json({ records });
}
