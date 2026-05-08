"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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

async function fetchTripSummary(
  token: string,
): Promise<TripSummary | undefined> {
  const response = await fetch(`/api/invite/${token}`);
  if (!response.ok) return undefined;
  return (await response.json()) as TripSummary;
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
  const [isJoining, setIsJoining] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void params.then(async ({ token: t }) => {
      setToken(t);
      const summary = await fetchTripSummary(t);
      setTrip(summary);
      setLoaded(true);
    });
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

  if (!loaded || !trip) {
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
