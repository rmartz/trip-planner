"use client";

import { Button } from "@/components/ui/button";
import type { Leg } from "@/lib/types/trip";
import { TRANSPORT_GUEST_OVERVIEW_COPY } from "./TransportGuestOverviewView.copy";

const COPY = TRANSPORT_GUEST_OVERVIEW_COPY;

export interface TransportSeatOffer {
  driverName: string;
  driverUid: string;
  offerId: string;
  routeName: string;
  seatCount: number;
}

export interface TransportGuestLegSummary {
  leg: Leg;
  offers: TransportSeatOffer[];
}

export interface TransportGuestOverviewViewProps {
  legs: TransportGuestLegSummary[];
  onClaimSeat: (legId: string, driverUid: string) => void;
}

interface SeatOfferCardProps {
  legId: string;
  offer: TransportSeatOffer;
  onClaimSeat: (legId: string, driverUid: string) => void;
}

function SeatOfferCard({ legId, offer, onClaimSeat }: SeatOfferCardProps) {
  return (
    <li
      data-testid="transport-seat-offer-card"
      className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-400 p-3 dark:border-zinc-600"
    >
      <p className="text-sm font-medium">
        {COPY.seatOfferLabel(offer.routeName)}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {COPY.seatsAvailable(offer.seatCount)}
      </p>
      <Button
        type="button"
        size="sm"
        aria-label={COPY.claimSeatAriaLabel(offer.driverName)}
        onClick={() => {
          onClaimSeat(legId, offer.driverUid);
        }}
      >
        {COPY.claimSeatButton}
      </Button>
    </li>
  );
}

interface LegSectionProps {
  onClaimSeat: (legId: string, driverUid: string) => void;
  summary: TransportGuestLegSummary;
}

function LegSection({ onClaimSeat, summary }: LegSectionProps) {
  const { leg, offers } = summary;
  return (
    <section
      data-testid="transport-guest-leg-section"
      className="flex flex-col gap-3"
    >
      <h3 className="text-sm font-semibold">{leg.name}</h3>
      {offers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.emptyOffersText}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {offers.map((offer) => (
            <SeatOfferCard
              key={offer.offerId}
              legId={leg.legId}
              offer={offer}
              onClaimSeat={onClaimSeat}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export function TransportGuestOverviewView({
  legs,
  onClaimSeat,
}: TransportGuestOverviewViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{COPY.heading}</h2>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      {legs.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.noLegsText}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {legs.map((summary) => (
            <LegSection
              key={summary.leg.legId}
              summary={summary}
              onClaimSeat={onClaimSeat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
