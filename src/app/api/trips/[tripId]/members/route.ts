import { type NextRequest, NextResponse } from "next/server";
import { getMembersForTrip, addNonAccountMember } from "@/services/members";
import { PlannerOnlyError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;
  const { accountMembers, nonAccountMembers } = await getMembersForTrip(tripId);

  return NextResponse.json({
    accountMembers: accountMembers.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
    })),
    nonAccountMembers,
  });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown };
  try {
    body = (await request.json()) as { name: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { tripId } = await params;

  try {
    const nonAccountMember = await addNonAccountMember(uid, tripId, body.name);
    return NextResponse.json(nonAccountMember, { status: 201 });
  } catch (err) {
    if (err instanceof PlannerOnlyError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
