"use client";

import { Button } from "@/components/ui/button";
import type { Stop } from "@/lib/types/trip";
import { LODGING_GUEST_OVERVIEW_COPY } from "./LodgingGuestOverviewView.copy";

const COPY = LODGING_GUEST_OVERVIEW_COPY;

export enum LodgingGuestOfferStatus {
  Accepted = "accepted",
  Declined = "declined",
  Pending = "pending",
}

export interface LodgingGuestOffer {
  bedCount: number;
  hostName: string;
  offerId: string;
  offerLabel: string;
  status: LodgingGuestOfferStatus;
}

export interface LodgingGuestStopSummary {
  offers: LodgingGuestOffer[];
  sortedOwnLodging: boolean;
  stop: Stop;
}

export interface LodgingGuestOverviewViewProps {
  onAcceptOffer: (stopId: string, offerId: string) => void;
  onDeclineOffer: (stopId: string, offerId: string) => void;
  onToggleSortedOwn: (stopId: string, sortedOwn: boolean) => void;
  stops: LodgingGuestStopSummary[];
}

function offerStatusPill(status: LodgingGuestOfferStatus): {
  label: string;
  tint: string;
} {
  if (status === LodgingGuestOfferStatus.Accepted)
    return {
      label: COPY.offerStatusAccepted,
      tint: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    };
  if (status === LodgingGuestOfferStatus.Declined)
    return {
      label: COPY.offerStatusDeclined,
      tint: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    };
  return {
    label: COPY.offerStatusPending,
    tint: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };
}

interface OfferRowProps {
  offer: LodgingGuestOffer;
  onAccept: () => void;
  onDecline: () => void;
}

function OfferRow({ offer, onAccept, onDecline }: OfferRowProps) {
  const pill = offerStatusPill(offer.status);
  return (
    <li
      data-testid="lodging-guest-offer-row"
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{offer.hostName}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${pill.tint}`}
        >
          {pill.label}
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {offer.offerLabel} · {COPY.bedsLabel(offer.bedCount)}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={
            offer.status === LodgingGuestOfferStatus.Accepted
              ? "default"
              : "outline"
          }
          aria-label={COPY.acceptOfferAriaLabel(offer.hostName)}
          onClick={onAccept}
        >
          {COPY.acceptOfferButton}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={
            offer.status === LodgingGuestOfferStatus.Declined
              ? "default"
              : "outline"
          }
          aria-label={COPY.declineOfferAriaLabel(offer.hostName)}
          onClick={onDecline}
        >
          {COPY.declineOfferButton}
        </Button>
      </div>
    </li>
  );
}

interface StopSectionProps {
  onAcceptOffer: (stopId: string, offerId: string) => void;
  onDeclineOffer: (stopId: string, offerId: string) => void;
  onToggleSortedOwn: (stopId: string, sortedOwn: boolean) => void;
  summary: LodgingGuestStopSummary;
}

function StopSection({
  onAcceptOffer,
  onDeclineOffer,
  onToggleSortedOwn,
  summary,
}: StopSectionProps) {
  const { offers, sortedOwnLodging, stop } = summary;
  return (
    <section
      data-testid="lodging-guest-stop-section"
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h3 className="text-sm font-semibold">{stop.name}</h3>

      {offers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.emptyOffersText}
        </p>
      ) : (
        <ul
          data-testid="lodging-guest-offer-list"
          className="flex flex-col gap-2"
        >
          {offers.map((offer) => (
            <OfferRow
              key={offer.offerId}
              offer={offer}
              onAccept={() => {
                onAcceptOffer(stop.stopId, offer.offerId);
              }}
              onDecline={() => {
                onDeclineOffer(stop.stopId, offer.offerId);
              }}
            />
          ))}
        </ul>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={sortedOwnLodging}
          onChange={(e) => {
            onToggleSortedOwn(stop.stopId, e.target.checked);
          }}
        />
        {COPY.sortedOwnLodgingLabel}
      </label>
    </section>
  );
}

export function LodgingGuestOverviewView({
  onAcceptOffer,
  onDeclineOffer,
  onToggleSortedOwn,
  stops,
}: LodgingGuestOverviewViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{COPY.heading}</h2>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      {stops.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.noStopsText}
        </p>
      ) : (
        <div
          data-testid="lodging-guest-stop-list"
          className="flex flex-col gap-3"
        >
          {stops.map((summary) => (
            <StopSection
              key={summary.stop.stopId}
              summary={summary}
              onAcceptOffer={onAcceptOffer}
              onDeclineOffer={onDeclineOffer}
              onToggleSortedOwn={onToggleSortedOwn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
