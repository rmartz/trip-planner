import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TripPhasePill, TripPhase } from "./TripPhasePill";

const meta: Meta<typeof TripPhasePill> = {
  component: TripPhasePill,
};

export default meta;

type Story = StoryObj<typeof TripPhasePill>;

export const Planning: Story = {
  args: {
    phase: TripPhase.Planning,
  },
};

export const Coordination: Story = {
  args: {
    phase: TripPhase.Coordination,
  },
};

export const SettlingUp: Story = {
  args: {
    phase: TripPhase.SettlingUp,
  },
};

export const Settled: Story = {
  args: {
    phase: TripPhase.Settled,
  },
};
