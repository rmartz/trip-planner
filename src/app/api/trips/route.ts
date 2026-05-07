import { type NextRequest, NextResponse } from "next/server";
import { getTripsForUser } from "@/services/trips";
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
