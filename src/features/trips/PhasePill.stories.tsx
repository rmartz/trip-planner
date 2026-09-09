import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PhasePill } from "./PhasePill";
import { TripPhase } from "@/lib/types/trip";

const meta: Meta<typeof PhasePill> = {
  component: PhasePill,
};

export default meta;

type Story = StoryObj<typeof PhasePill>;

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
