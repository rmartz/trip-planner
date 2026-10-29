"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MembersPageView } from "./MembersPageView";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { TripRole } from "@/lib/types/trip";
import { useAuth } from "@/hooks/use-auth";

interface MembersData {
  accountMembers: TripMember[];
  nonAccountMembers: NonAccountMember[];
}

async function fetchMembers(tripId: string): Promise<MembersData> {
  const res = await fetch(`/api/trips/${tripId}/members`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return (await res.json()) as MembersData;
}

function useMembers(tripId: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trip-members-detail", tripId],
    queryFn: () => fetchMembers(tripId),
  });

  return { data, isLoading, isError, load: refetch };
}

function useInviteToken(tripId: string) {
  const [inviteToken, setInviteToken] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (!res.ok) return;
        const json = (await res.json()) as { inviteToken?: string };
        setInviteToken(json.inviteToken ?? "");
      } catch {
        // ignore — token stays empty
      }
    }
    void load();
  }, [tripId]);

  const regenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/invite`, {
        method: "POST",
      });
      if (res.ok) {
        const json = (await res.json()) as { inviteToken: string };
        setInviteToken(json.inviteToken);
      }
    } finally {
      setIsRegenerating(false);
    }
  }, [tripId]);

  return { inviteToken, isRegenerating, regenerate };
}

export default function MembersPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const { user } = useAuth();

  const { data, isLoading, isError, load } = useMembers(tripId);
  const { inviteToken, isRegenerating, regenerate } = useInviteToken(tripId);

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
        inviteToken={inviteToken}
        currentUserRole={currentUserRole}
        accountMembers={data?.accountMembers ?? []}
        nonAccountMembers={data?.nonAccountMembers ?? []}
        isLoading={isLoading}
        isError={isError}
        isRegeneratingInvite={isRegenerating}
        onPromote={(uid) => void handlePromote(uid)}
        onRemove={(uid) => void handleRemove(uid)}
        onAddNonAccountMember={(name) => void handleAddNonAccountMember(name)}
        onRegenInvite={() => void regenerate()}
      />
    </main>
  );
}
