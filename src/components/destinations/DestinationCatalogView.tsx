"use client";

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
  onEdit: (destination: Destination) => void;
  onShare: (destination: Destination) => void;
  onAttach: (destination: Destination) => void;
}

function DestinationCard({
  destination,
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
        <p className="font-semibold">{destination.name}</p>
        {destination.seasonality && (
          <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {destination.seasonality}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onShare(destination);
            }}
            className="rounded-full border border-zinc-300 px-3 py-0.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {DESTINATION_CATALOG_COPY.shareButton}
          </button>
          <button
            type="button"
            onClick={() => {
              onAttach(destination);
            }}
            className="rounded-full border border-zinc-300 px-3 py-0.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {DESTINATION_CATALOG_COPY.attachButton}
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(destination);
            }}
            className="rounded-full border border-zinc-300 px-3 py-0.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {DESTINATION_CATALOG_COPY.editButton}
          </button>
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
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {DESTINATION_CATALOG_COPY.addButton}
        </button>
      </div>

      <input
        type="search"
        placeholder={DESTINATION_CATALOG_COPY.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
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
