import { type NextRequest, NextResponse } from "next/server";
import { setMemberSortedOwnLodging } from "@/services/lodging";
import { PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; stopId: string; memberId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sortedOwn?: unknown };
  try {
    body = (await request.json()) as { sortedOwn?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.sortedOwn !== "boolean") {
    return NextResponse.json(
      { error: "sortedOwn must be a boolean" },
      { status: 400 },
    );
  }

  const { tripId, stopId, memberId } = await params;

  try {
    await setMemberSortedOwnLodging(
      uid,
      tripId,
      stopId,
      memberId,
      body.sortedOwn,
    );
  } catch (err) {
    if (err instanceof PlannerOnlyError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
