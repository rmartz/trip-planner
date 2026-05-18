import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";
import {
  ActivitiesTripPageView,
  type ActivityProposal,
} from "./ActivitiesTripPageView";

function makeProposal(
  overrides: Partial<ActivityProposal> = {},
): ActivityProposal {
  return {
    proposalId: "prop-1",
    name: "Hiking the Ridge Trail",
    description: "Bring water and sunscreen.",
    proposerName: "Alice",
    counts: { yes: 2, maybe: 1, no: 0 },
    timeHint: "Saturday morning",
    userVote: undefined,
    voterNames: { yes: [], maybe: [], no: [] },
    ...overrides,
  };
}

const meta: Meta<typeof ActivitiesTripPageView> = {
  component: ActivitiesTripPageView,
  args: {
    proposals: [
      makeProposal({
        proposalId: "p-1",
        name: "Hiking the Ridge Trail",
        voterNames: {
          yes: ["Marco", "Jess", "Tara", "Bob"],
          maybe: ["Kev"],
          no: [],
        },
      }),
      makeProposal({
        proposalId: "p-2",
        name: "Kayaking on the River",
        description: "Bring sunscreen and water shoes.",
        proposerName: "Bob",
        counts: { yes: 3, maybe: 0, no: 1 },
        timeHint: "Sunday afternoon",
        userVote: InterestVote.Yes,
        voterNames: { yes: ["Alice", "Casey", "Dana"], maybe: [], no: ["Pat"] },
      }),
      makeProposal({
        proposalId: "p-3",
        name: "Cooking class",
        description: undefined,
        proposerName: "Casey",
        counts: { yes: 1, maybe: 2, no: 0 },
        timeHint: undefined,
        voterNames: { yes: ["Alice"], maybe: ["Marco", "Jess"], no: [] },
      }),
    ],
    isLoading: false,
    isError: false,
    onVote: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ActivitiesTripPageView>;

export const GuestLoaded: Story = {
  args: {
    role: TripRole.Guest,
  },
};

export const PlannerLoaded: Story = {
  args: {
    role: TripRole.Planner,
  },
};

export const PlannerVoterNamesAbsent: Story = {
  args: {
    role: TripRole.Planner,
    proposals: [
      makeProposal({
        proposalId: "p-1",
        name: "Hiking the Ridge Trail",
        voterNames: undefined,
      }),
    ],
  },
};

export const Loading: Story = {
  args: {
    proposals: [],
    isLoading: true,
    isError: false,
  },
};

export const Error: Story = {
  args: {
    proposals: [],
    isLoading: false,
    isError: true,
  },
};

export const Empty: Story = {
  args: {
    proposals: [],
    isLoading: false,
    isError: false,
  },
};
