import { TimeOfDaySlot } from "@/lib/types/activity";

const SLOT_LABELS: Record<TimeOfDaySlot, string> = {
  [TimeOfDaySlot.Afternoon]: "Afternoon",
  [TimeOfDaySlot.EarlyMorning]: "Early Morning",
  [TimeOfDaySlot.Evening]: "Evening",
  [TimeOfDaySlot.LateEvening]: "Late Evening",
  [TimeOfDaySlot.Morning]: "Morning",
};

export function slotLabel(slot: TimeOfDaySlot): string {
  return SLOT_LABELS[slot];
}
