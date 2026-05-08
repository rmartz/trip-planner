"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUnavailableRange } from "@/hooks/use-unavailable-ranges";
import { ADD_RANGE_MODAL_COPY } from "./AddRangeModal.copy";

const COPY = ADD_RANGE_MODAL_COPY;

export interface AddRangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRangeModal({ open, onOpenChange }: AddRangeModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const createMutation = useCreateUnavailableRange();

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    createMutation.mutate(
      {
        startDate: new Date(startDate + "T00:00:00"),
        endDate: new Date(endDate + "T00:00:00"),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setStartDate("");
          setEndDate("");
          setNote("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{COPY.sheetTitle}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modal-start-date">{COPY.startDateLabel}</Label>
              <Input
                id="modal-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modal-end-date">{COPY.endDateLabel}</Label>
              <Input
                id="modal-end-date"
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-note">{COPY.noteLabel}</Label>
            <Input
              id="modal-note"
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
              placeholder={COPY.notePlaceholder}
            />
          </div>
          <SheetFooter>
            <Button
              type="submit"
              disabled={createMutation.isPending || !startDate || !endDate}
            >
              {COPY.addButtonLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
