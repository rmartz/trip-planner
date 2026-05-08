"use client";

import { useTrips } from "@/hooks/use-trips";
import { TripDashboardView } from "./TripDashboardView";

export function HomeDashboard() {
  const { data: trips = [], isLoading, isError } = useTrips();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Failed to load trips.</p>
      </div>
    );
  }

  const now = new Date();
  const activeTrips = trips.filter((t) => t.endDate >= now);
  const pastTrips = trips.filter((t) => t.endDate < now);

  return <TripDashboardView activeTrips={activeTrips} pastTrips={pastTrips} />;
}
