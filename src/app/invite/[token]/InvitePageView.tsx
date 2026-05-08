"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INVITE_PAGE_COPY } from "./copy";

interface TripSummary {
  name: string;
  startDate: string;
  endDate: string;
  memberCount: number;
}

export interface InvitePageViewProps {
  trip: TripSummary;
  isAuthenticated: boolean;
  isAlreadyMember: boolean;
  onJoin: () => void;
  isJoining: boolean;
  signInHref: string;
  signUpHref: string;
}

export function InvitePageView({
  trip,
  isAuthenticated,
  isAlreadyMember,
  onJoin,
  isJoining,
  signInHref,
  signUpHref,
}: InvitePageViewProps) {
  const dateRange = `${new Date(trip.startDate).toLocaleDateString()} – ${new Date(trip.endDate).toLocaleDateString()}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="w-16 h-16 rounded-xl bg-muted" aria-hidden="true" />

      <div className="text-center space-y-1">
        <p className="text-sm font-mono text-muted-foreground">
          {INVITE_PAGE_COPY.invitedBy}
        </p>
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-sm text-muted-foreground">
          {dateRange} &middot; {trip.memberCount}{" "}
          {INVITE_PAGE_COPY.alreadyGoing}
        </p>
      </div>

      {isAlreadyMember ? (
        <p className="text-sm text-muted-foreground">
          {INVITE_PAGE_COPY.alreadyMember}
        </p>
      ) : isAuthenticated ? (
        <Button
          onClick={onJoin}
          disabled={isJoining}
          className="w-full max-w-xs"
        >
          {INVITE_PAGE_COPY.joinButton}
        </Button>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href={signUpHref}
            className={cn(buttonVariants(), "w-full justify-center")}
          >
            {INVITE_PAGE_COPY.signUpButton}
          </Link>
          <Link
            href={signInHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-center",
            )}
          >
            {INVITE_PAGE_COPY.signInButton}
          </Link>
        </div>
      )}
    </main>
  );
}
