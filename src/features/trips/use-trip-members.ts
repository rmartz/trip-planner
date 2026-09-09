"use client";

import { useQuery } from "@tanstack/react-query";

export interface TripMemberOption {
  displayName: string | undefined;
  uid: string;
}

interface AccountMemberJson {
  displayName?: string;
  uid: string;
}

interface NonAccountMemberJson {
  name: string;
  nonAccountMemberId: string;
}

interface TripMembersResponse {
  accountMembers: AccountMemberJson[];
  nonAccountMembers?: NonAccountMemberJson[];
}

function parseAccountMember(json: AccountMemberJson): TripMemberOption {
  return {
    displayName: json.displayName,
    uid: json.uid,
  };
}

function parseNonAccountMember(json: NonAccountMemberJson): TripMemberOption {
  return {
    displayName: `${json.name}*`,
    uid: json.nonAccountMemberId,
  };
}

async function fetchTripMembers(tripId: string): Promise<TripMemberOption[]> {
  const response = await fetch(`/api/trips/${tripId}/members`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch trip members (${String(response.status)})`,
    );
  }

  const data = (await response.json()) as TripMembersResponse;
  return [
    ...data.accountMembers.map(parseAccountMember),
    ...(data.nonAccountMembers ?? []).map(parseNonAccountMember),
  ];
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
