"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import {
  useUnavailableRanges,
  useCreateUnavailableRange,
  useDeleteUnavailableRange,
} from "@/hooks/use-unavailable-ranges";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { UNAVAILABLE_RANGE_MANAGER_COPY } from "./UnavailableRangeManager.copy";

const COPY = UNAVAILABLE_RANGE_MANAGER_COPY;

function formatDateRange(startDate: Date, endDate: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${startDate.toLocaleDateString(undefined, opts)} – ${endDate.toLocaleDateString(undefined, opts)}`;
}

interface RangeRowProps {
  range: UnavailableRange;
  onDelete: (rangeId: string) => void;
  isDeleting: boolean;
}

function RangeRow({ range, onDelete, isDeleting }: RangeRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium">
          {formatDateRange(range.startDate, range.endDate)}
        </p>
        {range.note && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {range.note}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          onDelete(range.rangeId);
        }}
        disabled={isDeleting}
        className="shrink-0 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        {COPY.deleteButtonLabel}
      </button>
    </div>
  );
}

interface AddRangeFormProps {
  onSubmit: (range: { startDate: Date; endDate: Date; note?: string }) => void;
  isPending: boolean;
}

function AddRangeForm({ onSubmit, isPending }: AddRangeFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onSubmit({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      note: note.trim() || undefined,
    });
    setStartDate("");
    setEndDate("");
    setNote("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {COPY.startDateLabel}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
            required
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {COPY.endDateLabel}
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
            required
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {COPY.noteLabel}
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
          placeholder={COPY.notePlaceholder}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !startDate || !endDate}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {COPY.addButtonLabel}
      </button>
    </form>
  );
}

export function UnavailableRangeManager() {
  const { data: ranges, isLoading, isError } = useUnavailableRanges();
  const createMutation = useCreateUnavailableRange();
  const deleteMutation = useDeleteUnavailableRange();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">{COPY.sectionTitle}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.sectionDescription}
        </p>
      </div>

      <AddRangeForm
        onSubmit={(range) => {
          createMutation.mutate(range);
        }}
        isPending={createMutation.isPending}
      />

      <div className="flex flex-col gap-2">
        {isLoading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.loadingText}
          </p>
        )}
        {isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {COPY.errorText}
          </p>
        )}
        {!isLoading && !isError && !ranges?.length && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.emptyStateText}
          </p>
        )}
        {ranges?.map((range) => (
          <RangeRow
            key={range.rangeId}
            range={range}
            onDelete={(id) => {
              deleteMutation.mutate(id);
            }}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
