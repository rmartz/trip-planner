import { type NextRequest, NextResponse } from "next/server";
import { updateDestinationForUser } from "@/services/destinations";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> },
) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { destinationId } = await params;

  let body: { name: unknown; seasonality?: unknown };
  try {
    body = (await request.json()) as { name: unknown; seasonality?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const seasonality =
    typeof body.seasonality === "string" && body.seasonality.trim()
      ? body.seasonality.trim()
      : undefined;

  await updateDestinationForUser(
    uid,
    destinationId,
    body.name.trim(),
    seasonality,
  );

  return NextResponse.json({ success: true });
}
