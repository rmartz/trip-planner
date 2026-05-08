"use client";

import { useTrips } from "@/hooks/use-trips";
import { HOME_DASHBOARD_COPY } from "./HomeDashboard.copy";
import { TripDashboardView } from "./TripDashboardView";

export function HomeDashboard() {
  const { data: trips = [], isLoading, isError } = useTrips();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">{HOME_DASHBOARD_COPY.loadingText}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{HOME_DASHBOARD_COPY.errorText}</p>
      </div>
    );
  }

  const now = new Date();
  const activeTrips = trips.filter((t) => t.endDate >= now);
  const pastTrips = trips.filter((t) => t.endDate < now);

  return <TripDashboardView activeTrips={activeTrips} pastTrips={pastTrips} />;
}
