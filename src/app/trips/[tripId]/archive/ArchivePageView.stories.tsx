import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { Leg } from "@/lib/types/trip";
import { ArchivePageView } from "./ArchivePageView";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London to Paris",
    order: 0,
    memberUids: ["uid-planner"],
    isActive: false,
    ...overrides,
  };
}

const meta: Meta<typeof ArchivePageView> = {
  component: ArchivePageView,
  args: {
    archivedLegs: [],
    onRestore: fn(),
    onDeleteForever: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ArchivePageView>;

export const Empty: Story = {};

export const WithArchivedLegs: Story = {
  args: {
    archivedLegs: [
      makeLeg({ legId: "leg-1", name: "London to Paris" }),
      makeLeg({ legId: "leg-2", name: "Paris to Berlin", order: 1 }),
      makeLeg({ legId: "leg-3", name: "Berlin to Vienna", order: 2 }),
    ],
  },
};
