import { type NextRequest, NextResponse } from "next/server";
import {
  getSeatOfferCandidates,
  setSeatOffer,
} from "@/services/transportation";
import { NotFoundError } from "@/services/errors";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ tripId: string; legId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, legId } = await params;

  try {
    const candidates = await getSeatOfferCandidates(uid, tripId, legId);
    return NextResponse.json(candidates);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { offeredToUids?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (parsed === null || typeof parsed !== "object") {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const rawUids = body.offeredToUids;
  if (
    !Array.isArray(rawUids) ||
    !rawUids.every((u): u is string => typeof u === "string")
  ) {
    return NextResponse.json(
      { error: "offeredToUids must be an array of strings" },
      { status: 400 },
    );
  }

  const { tripId, legId } = await params;

  try {
    await setSeatOffer(uid, tripId, legId, rawUids);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
