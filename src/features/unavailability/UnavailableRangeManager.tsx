"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateUnavailableRange,
  useDeleteUnavailableRange,
  useUnavailableRanges,
} from "@/hooks/use-unavailable-ranges";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          onDelete(range.rangeId);
        }}
        disabled={isDeleting}
        className="shrink-0"
      >
        {COPY.deleteButtonLabel}
      </Button>
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
      startDate: new Date(startDate + "T00:00:00"),
      endDate: new Date(endDate + "T00:00:00"),
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
          <Label htmlFor="start-date">{COPY.startDateLabel}</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="end-date">{COPY.endDateLabel}</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="range-note">{COPY.noteLabel}</Label>
        <Input
          id="range-note"
          type="text"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
          placeholder={COPY.notePlaceholder}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending || !startDate || !endDate}
        className="self-start"
      >
        {COPY.addButtonLabel}
      </Button>
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
