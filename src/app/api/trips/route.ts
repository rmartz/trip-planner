import { type NextRequest, NextResponse } from "next/server";
import { createTripForUser, getTripsForUser } from "@/services/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trips = await getTripsForUser(uid);
  return NextResponse.json(
    trips.map((trip) => ({
      ...trip,
      startDate: formatLocalDate(trip.startDate),
      endDate: formatLocalDate(trip.endDate),
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

  const startDateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(body.startDate);
  const endDateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(body.endDate);

  if (!startDateParts || !endDateParts) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const startDate = new Date(
    Number(startDateParts[1]),
    Number(startDateParts[2]) - 1,
    Number(startDateParts[3]),
  );
  const endDate = new Date(
    Number(endDateParts[1]),
    Number(endDateParts[2]) - 1,
    Number(endDateParts[3]),
  );

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
