import { type NextRequest, NextResponse } from "next/server";
import { hardDeleteLeg } from "@/services/legs";
import { PlannerOnlyError } from "@/services/errors";
import { recomputeTransportGapCount } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; legId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, legId } = await params;

  try {
    await hardDeleteLeg(uid, tripId, legId);
    await recomputeTransportGapCount(tripId);
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
