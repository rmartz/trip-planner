import { type NextRequest, NextResponse } from "next/server";
import { createTripForUser, getTripsForUser } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await getTripsForUser(uid);
  return NextResponse.json(
    trips.map((trip) => ({
      ...trip,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      createdAt: trip.createdAt.toISOString(),
    })),
  );
}

export async function POST(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown; startDate: unknown; endDate: unknown };
  try {
    body = (await request.json()) as {
      name: unknown;
      startDate: unknown;
      endDate: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (
    typeof body.name !== "string" ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string"
  ) {
    return NextResponse.json(
      { error: "name, startDate, and endDate are required" },
      { status: 400 },
    );
  }

  if (!body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before or equal to endDate" },
      { status: 400 },
    );
  }

  const tripId = await createTripForUser(
    uid,
    body.name.trim(),
    startDate,
    endDate,
  );

  return NextResponse.json({ tripId });
}
