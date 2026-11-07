"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArchivePageView } from "./ArchivePageView";
import { AppShell } from "@/features/nav";
import type { Leg } from "@/lib/types/trip";
import { ARCHIVE_PAGE_COPY } from "./ArchivePageView.copy";

async function fetchArchivedLegs(tripId: string): Promise<Leg[]> {
  const res = await fetch(`/api/trips/${tripId}/legs/archived`);
  if (!res.ok) {
    throw new Error(`Failed to fetch archived legs (${String(res.status)})`);
  }
  const data = (await res.json()) as { legs: Leg[] };
  return data.legs;
}

export default function ArchivePage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const router = useRouter();

  const { data: legs = [], refetch: load } = useQuery({
    queryKey: ["archived-legs", tripId],
    queryFn: () => fetchArchivedLegs(tripId),
  });

  const handleRestore = useCallback(
    async (legId: string) => {
      await fetch(`/api/trips/${tripId}/legs/${legId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      await load();
    },
    [tripId, load],
  );

  const handleDeleteForever = useCallback(
    async (legId: string) => {
      await fetch(`/api/trips/${tripId}/legs/${legId}/permanent`, {
        method: "DELETE",
      });
      await load();
    },
    [tripId, load],
  );

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: ARCHIVE_PAGE_COPY.heading,
        onBack: () => {
          router.back();
        },
      }}
    >
      <ArchivePageView
        archivedLegs={legs}
        onRestore={(legId) => void handleRestore(legId)}
        onDeleteForever={(legId) => void handleDeleteForever(legId)}
      />
    </AppShell>
  );
}
