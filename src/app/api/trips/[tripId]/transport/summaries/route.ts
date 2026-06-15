import { type NextRequest, NextResponse } from "next/server";
import { getLegsForTrip } from "@/services/legs";
import {
  computeLegSummary,
  getTransportationEntriesForTrip,
  resolveDriverDisplayNames,
} from "@/services/transportation";
import { getTripMemberRole, getTripMemberUids } from "@/services/trips";
import { TransportationStatus } from "@/lib/types/transportation";
import { TripRole } from "@/lib/types/trip";
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
  const role = await getTripMemberRole(tripId, uid);

  if (role !== TripRole.Planner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [legs, entries, tripMemberUids] = await Promise.all([
    getLegsForTrip(tripId),
    getTransportationEntriesForTrip(tripId),
    getTripMemberUids(tripId),
  ]);

  const driverUids = [
    ...new Set(
      entries
        .filter((e) => e.status === TransportationStatus.DrivingWithSeats)
        .map((e) => e.uid),
    ),
  ];
  const displayNameByUid = await resolveDriverDisplayNames(driverUids);

  const entriesByLegId = new Map<string, typeof entries>();
  for (const entry of entries) {
    const bucket = entriesByLegId.get(entry.legId) ?? [];
    bucket.push(entry);
    entriesByLegId.set(entry.legId, bucket);
  }

  const summaries = legs.map((leg) => {
    const legEntries = entriesByLegId.get(leg.legId) ?? [];
    const { demand, supply } = computeLegSummary(
      tripMemberUids,
      legEntries,
      displayNameByUid,
    );
    return { legId: leg.legId, leg, demand, supply };
  });

  return NextResponse.json({ role, summaries });
}
