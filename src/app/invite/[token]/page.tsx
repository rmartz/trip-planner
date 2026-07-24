"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { InviteError } from "@/lib/types/invite";
import { InvitePageView } from "./InvitePageView";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

interface TripSummary {
  name: string;
  startDate: string;
  endDate: string;
  memberCount: number;
}

interface FetchTripSummaryResult {
  trip?: TripSummary;
  inviteError?: InviteError;
}

async function fetchTripSummary(
  token: string,
): Promise<FetchTripSummaryResult> {
  const response = await fetch(`/api/invite/${token}`);
  if (response.status === 410) {
    const body = (await response.json()) as { inviteError: InviteError };
    return { inviteError: body.inviteError };
  }
  if (!response.ok) return {};
  return { trip: (await response.json()) as TripSummary };
}

interface JoinTripResult {
  tripId: string;
  alreadyMember: boolean;
}

async function joinTrip(token: string): Promise<JoinTripResult | undefined> {
  const response = await fetch(`/api/invite/${token}`, { method: "POST" });
  if (!response.ok) return undefined;
  return (await response.json()) as JoinTripResult;
}

export default function InvitePage({ params }: InvitePageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripSummary | undefined>();
  const [inviteError, setInviteError] = useState<InviteError | undefined>();
  const [isJoining, setIsJoining] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      const { token: t } = await params;
      setToken(t);
      const result = await fetchTripSummary(t);
      setTrip(result.trip);
      setInviteError(result.inviteError);
      setLoaded(true);
    }
    void loadInvite();
  }, [params]);

  async function handleJoin() {
    if (!token) return;
    setIsJoining(true);
    try {
      const result = await joinTrip(token);
      if (!result) {
        setJoinError(true);
      } else if (result.alreadyMember) {
        setIsAlreadyMember(true);
      } else {
        router.push(`/trips/${result.tripId}/structure`);
      }
    } finally {
      setIsJoining(false);
    }
  }

  if (!loaded) {
    return null;
  }

  const invitePath = `/invite/${token ?? ""}`;
  const signInHref = `/sign-in?next=${encodeURIComponent(invitePath)}`;
  const signUpHref = `/sign-up?next=${encodeURIComponent(invitePath)}`;

  return (
    <InvitePageView
      trip={trip}
      isAuthenticated={user !== null}
      isAlreadyMember={isAlreadyMember}
      inviteError={inviteError}
      joinError={joinError}
      onJoin={() => {
        void handleJoin();
      }}
      isJoining={isJoining}
      signInHref={signInHref}
      signUpHref={signUpHref}
    />
  );
}
