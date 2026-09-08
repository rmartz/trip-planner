"use client";

import { Button } from "@/components/ui/button";
import type { Destination } from "@/lib/types/destination";
import { DESTINATION_DETAIL_COPY } from "./DestinationDetailView.copy";

export interface DestinationDetailViewProps {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onBack: () => void;
  canShare?: boolean;
  onShare?: () => void;
}

export function DestinationDetailView({
  destination,
  onEdit,
  onBack,
  canShare = false,
  onShare,
}: DestinationDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 max-w-md p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          {DESTINATION_DETAIL_COPY.backButton}
        </Button>
        <h2 className="text-xl font-bold">{destination.name}</h2>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {DESTINATION_DETAIL_COPY.seasonalityLabel}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {destination.seasonality ?? DESTINATION_DETAIL_COPY.noSeasonality}
        </p>
      </div>

      <div className="flex gap-2">
        {canShare && (
          <Button variant="outline" onClick={onShare}>
            {DESTINATION_DETAIL_COPY.shareButton}
          </Button>
        )}
        <Button
          onClick={() => {
            onEdit(destination);
          }}
        >
          {DESTINATION_DETAIL_COPY.editButton}
        </Button>
      </div>
    </div>
  );
}
