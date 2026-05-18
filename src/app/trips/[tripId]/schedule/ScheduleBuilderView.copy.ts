import { TimeOfDaySlot } from "@/lib/types/activity";

const SLOT_LABELS: Record<TimeOfDaySlot, string> = {
  [TimeOfDaySlot.Afternoon]: "Afternoon",
  [TimeOfDaySlot.EarlyMorning]: "Early Morning",
  [TimeOfDaySlot.Evening]: "Evening",
  [TimeOfDaySlot.LateEvening]: "Late Evening",
  [TimeOfDaySlot.Morning]: "Morning",
};

export const SCHEDULE_BUILDER_COPY = {
  draftBadge: "Draft",
  emptyProposals: "No activities proposed for this stop yet.",
  heading: "Build Schedule",
  headingSubtext: "Arrange activities into a draft schedule",
  moveDownLabel: (name: string) => `Move down: ${name}`,
  moveUpLabel: (name: string) => `Move up: ${name}`,
  pinnedSectionHeading: "Required (pinned)",
  proposedSectionHeading: "Proposed activities",
  publishButton: "Publish schedule",
  slotLabel: (slot: TimeOfDaySlot) => SLOT_LABELS[slot],
  stopLabel: (name: string) => name,
} as const;
