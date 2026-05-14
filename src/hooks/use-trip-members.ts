"use client";

import { useQuery } from "@tanstack/react-query";
import { TripRole, type TripMember } from "@/lib/types/trip";

interface TripMemberJson {
  displayName?: string;
  joinedAt: string;
  memberUids: string[];
  role: TripRole;
  tripId: string;
  uid: string;
}

interface TripMembersResponse {
  accountMembers: TripMemberJson[];
}

function parseTripMember(json: TripMemberJson): TripMember {
  return {
    displayName: json.displayName,
    joinedAt: new Date(json.joinedAt),
    memberUids: json.memberUids,
    role: json.role,
    tripId: json.tripId,
    uid: json.uid,
  };
}

async function fetchTripMembers(tripId: string): Promise<TripMember[]> {
  const response = await fetch(`/api/trips/${tripId}/members`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch trip members (${String(response.status)})`,
    );
  }

  const data = (await response.json()) as TripMembersResponse;
  return data.accountMembers.map(parseTripMember);
}

export function tripMembersQueryOptions(tripId: string) {
  return {
    queryKey: ["trip-members", tripId],
    queryFn: () => fetchTripMembers(tripId),
  } as const;
}

export function useTripMembers(tripId: string) {
  return useQuery(tripMembersQueryOptions(tripId));
}
