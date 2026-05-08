"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArchivePageView } from "./ArchivePageView";
import { AppShell } from "@/components/nav/AppShell";
import type { Leg } from "@/lib/types/trip";
import { ARCHIVE_PAGE_COPY } from "./ArchivePageView.copy";

function useArchivedLegs(tripId: string) {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/legs/archived`);
      if (!res.ok) return;
      const data = (await res.json()) as { legs: Leg[] };
      setLegs(data.legs);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { legs, isLoading, load };
}

export default function ArchivePage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const router = useRouter();

  const { legs, load } = useArchivedLegs(tripId);

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
