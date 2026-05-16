"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DESTINATION_CATALOG_COPY } from "./DestinationCatalog.copy";
import type { Destination } from "@/lib/types/destination";

interface DestinationImagePlaceholderProps {
  label: string;
}

function DestinationImagePlaceholder({
  label,
}: DestinationImagePlaceholderProps) {
  return (
    <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
      {label}
    </div>
  );
}

interface DestinationCardProps {
  destination: Destination;
  onView: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
  onShare: (destination: Destination) => void;
  onAttach: (destination: Destination) => void;
}

function DestinationCard({
  destination,
  onView,
  onEdit,
  onShare,
  onAttach,
}: DestinationCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <DestinationImagePlaceholder
        label={DESTINATION_CATALOG_COPY.imagePlaceholderLabel}
      />
      <div className="flex flex-1 flex-col gap-1">
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            onView(destination);
          }}
          className="h-auto self-start p-0 text-left font-semibold"
        >
          {destination.name}
        </Button>
        {destination.seasonality && (
          <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {destination.seasonality}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onShare(destination);
            }}
            className="rounded-full"
          >
            {DESTINATION_CATALOG_COPY.shareButton}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onAttach(destination);
            }}
            className="rounded-full"
          >
            {DESTINATION_CATALOG_COPY.attachButton}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onView(destination);
            }}
            className="rounded-full"
          >
            {DESTINATION_CATALOG_COPY.viewButton}
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onEdit(destination);
            }}
            className="rounded-full"
          >
            {DESTINATION_CATALOG_COPY.editButton}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface DestinationCatalogViewProps {
  destinations: Destination[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onView: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
  onShare: (destination: Destination) => void;
  onAttach: (destination: Destination) => void;
}

export function DestinationCatalogView({
  destinations,
  isLoading,
  isError,
  searchQuery,
  onSearchChange,
  onAdd,
  onView,
  onEdit,
  onShare,
  onAttach,
}: DestinationCatalogViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {DESTINATION_CATALOG_COPY.heading}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {DESTINATION_CATALOG_COPY.subheading}
          </p>
        </div>
        <Button onClick={onAdd}>{DESTINATION_CATALOG_COPY.addButton}</Button>
      </div>

      <Input
        type="search"
        placeholder={DESTINATION_CATALOG_COPY.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className="w-full"
      />

      {isLoading && (
        <p className="text-zinc-500 dark:text-zinc-400">
          {DESTINATION_CATALOG_COPY.loadingText}
        </p>
      )}

      {isError && (
        <p className="text-red-500 dark:text-red-400">
          {DESTINATION_CATALOG_COPY.errorText}
        </p>
      )}

      {!isLoading && !isError && destinations.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-xl font-medium">
            {DESTINATION_CATALOG_COPY.emptyStateHeading}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            {DESTINATION_CATALOG_COPY.emptyStateDescription}
          </p>
        </div>
      )}

      {!isLoading && !isError && destinations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {DESTINATION_CATALOG_COPY.savedCount(destinations.length)}
          </p>
          <div className="flex flex-col gap-2">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.destinationId}
                destination={destination}
                onView={onView}
                onEdit={onEdit}
                onShare={onShare}
                onAttach={onAttach}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
