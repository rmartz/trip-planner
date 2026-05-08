"use client";

import { useState } from "react";
import { CalendarPageView } from "@/components/calendar/CalendarPageView";
import { useUnavailableRanges } from "@/hooks/use-unavailable-ranges";
import { useTrips } from "@/hooks/use-trips";
import { AddRangeModal } from "@/components/calendar/AddRangeModal";

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [addBlockOpen, setAddBlockOpen] = useState(false);

  const {
    data: ranges = [],
    isLoading: rangesLoading,
    isError: rangesError,
  } = useUnavailableRanges();
  const {
    data: trips = [],
    isLoading: tripsLoading,
    isError: tripsError,
  } = useTrips();

  const isLoading = rangesLoading || tripsLoading;
  const isError = rangesError || tripsError;

  function handlePrevMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }

  function handleNextMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }

  return (
    <>
      <CalendarPageView
        currentMonth={currentMonth}
        ranges={ranges}
        trips={trips}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onAddBlock={() => {
          setAddBlockOpen(true);
        }}
        isLoading={isLoading}
        isError={isError}
      />
      <AddRangeModal open={addBlockOpen} onOpenChange={setAddBlockOpen} />
    </>
  );
}
