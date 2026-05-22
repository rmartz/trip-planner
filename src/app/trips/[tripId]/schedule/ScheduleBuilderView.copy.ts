import { slotLabel } from "@/lib/activity-labels";

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
  slotLabel,
} as const;
