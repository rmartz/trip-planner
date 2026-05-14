"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripMembersQueryOptions } from "@/hooks/use-trip-members";
import { LodgingHostGuestPickerView } from "./LodgingHostGuestPickerView";

interface LodgingInviteesResponse {
  candidateUids: string[];
  invitedUids: string[];
}

export interface LodgingHostGuestPickerProps {
  stopId: string;
  tripId: string;
}

async function fetchLodgingInvitees(
  tripId: string,
  stopId: string,
): Promise<LodgingInviteesResponse> {
  const response = await fetch(
    `/api/trips/${tripId}/stops/${stopId}/lodging/invitees`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch lodging invitees");
  }

  return (await response.json()) as LodgingInviteesResponse;
}

async function saveLodgingInvitees(
  tripId: string,
  stopId: string,
  invitedUids: string[],
): Promise<void> {
  const response = await fetch(
    `/api/trips/${tripId}/stops/${stopId}/lodging/invitees`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitedUids }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save lodging invitees");
  }
}

export function LodgingHostGuestPicker({
  stopId,
  tripId,
}: LodgingHostGuestPickerProps) {
  const queryClient = useQueryClient();
  const [selectedUids, setSelectedUids] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const membersQuery = useQuery(tripMembersQueryOptions(tripId));
  const inviteesQuery = useQuery({
    queryKey: ["lodging-invitees", tripId, stopId],
    queryFn: () => fetchLodgingInvitees(tripId, stopId),
  });

  useEffect(() => {
    if (inviteesQuery.data !== undefined) {
      setSelectedUids(new Set(inviteesQuery.data.invitedUids));
    }
  }, [inviteesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (invitedUids: string[]) =>
      saveLodgingInvitees(tripId, stopId, invitedUids),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["lodging-invitees", tripId, stopId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["lodging", tripId, stopId],
        }),
      ]);
    },
  });

  const guests = useMemo(() => {
    if (membersQuery.data === undefined || inviteesQuery.data === undefined) {
      return [];
    }

    const candidateUids = new Set(inviteesQuery.data.candidateUids);

    return membersQuery.data
      .filter((member) => candidateUids.has(member.uid))
      .map((member) => ({
        displayName: member.displayName ?? member.uid,
        uid: member.uid,
      }));
  }, [inviteesQuery.data, membersQuery.data]);

  if (
    membersQuery.data === undefined ||
    inviteesQuery.data === undefined ||
    membersQuery.isError ||
    inviteesQuery.isError
  ) {
    return null;
  }

  return (
    <LodgingHostGuestPickerView
      guests={guests}
      isSubmitting={saveMutation.isPending}
      onSave={() => {
        void saveMutation.mutateAsync(Array.from(selectedUids));
      }}
      onToggleGuest={(uid) => {
        setSelectedUids((currentSelectedUids) => {
          const nextSelectedUids = new Set(currentSelectedUids);

          if (nextSelectedUids.has(uid)) {
            nextSelectedUids.delete(uid);
          } else {
            nextSelectedUids.add(uid);
          }

          return nextSelectedUids;
        });
      }}
      selectedUids={selectedUids}
    />
  );
}
