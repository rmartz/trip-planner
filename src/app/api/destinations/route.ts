import { type NextRequest, NextResponse } from "next/server";
import {
  createDestinationForUser,
  getDestinationsForUser,
} from "@/services/destinations";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const destinations = await getDestinationsForUser(uid);
  return NextResponse.json(destinations);
}

export async function POST(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown; seasonality?: unknown };
  try {
    body = (await request.json()) as { name: unknown; seasonality?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const seasonality =
    typeof body.seasonality === "string" && body.seasonality.trim()
      ? body.seasonality.trim()
      : undefined;

  const destinationId = await createDestinationForUser(
    uid,
    body.name.trim(),
    seasonality,
  );

  return NextResponse.json({ destinationId });
}
