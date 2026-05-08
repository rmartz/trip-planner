"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MembersPageView } from "./MembersPageView";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { TripRole } from "@/lib/types/trip";
import { useAuth } from "@/hooks/use-auth";

interface MembersData {
  accountMembers: TripMember[];
  nonAccountMembers: NonAccountMember[];
}

function useMembers(tripId: string) {
  const [data, setData] = useState<MembersData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch(`/api/trips/${tripId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const json = (await res.json()) as MembersData;
      setData(json);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, isError, load };
}

export default function MembersPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const { user } = useAuth();

  const { data, isLoading, isError, load } = useMembers(tripId);

  const currentUserRole =
    data?.accountMembers.find((m) => m.uid === user?.uid)?.role ??
    TripRole.Guest;

  const handlePromote = useCallback(
    async (targetUid: string) => {
      await fetch(`/api/trips/${tripId}/members/${targetUid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote" }),
      });
      await load();
    },
    [tripId, load],
  );

  const handleRemove = useCallback(
    async (targetUid: string) => {
      await fetch(`/api/trips/${tripId}/members/${targetUid}`, {
        method: "DELETE",
      });
      await load();
    },
    [tripId, load],
  );

  const handleAddNonAccountMember = useCallback(
    async (name: string) => {
      await fetch(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await load();
    },
    [tripId, load],
  );

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Members</h1>
      <MembersPageView
        currentUserRole={currentUserRole}
        accountMembers={data?.accountMembers ?? []}
        nonAccountMembers={data?.nonAccountMembers ?? []}
        isLoading={isLoading}
        isError={isError}
        onPromote={(uid) => void handlePromote(uid)}
        onRemove={(uid) => void handleRemove(uid)}
        onAddNonAccountMember={(name) => void handleAddNonAccountMember(name)}
      />
    </main>
  );
}
