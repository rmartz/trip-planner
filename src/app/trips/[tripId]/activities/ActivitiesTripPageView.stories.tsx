import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { InterestVote } from "@/lib/types/interest-vote";
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
    ...overrides,
  };
}

const meta: Meta<typeof ActivitiesTripPageView> = {
  component: ActivitiesTripPageView,
  args: {
    proposals: [
      makeProposal({ proposalId: "p-1", name: "Hiking the Ridge Trail" }),
      makeProposal({
        proposalId: "p-2",
        name: "Kayaking on the River",
        description: "Bring sunscreen and water shoes.",
        proposerName: "Bob",
        counts: { yes: 3, maybe: 0, no: 1 },
        timeHint: "Sunday afternoon",
        userVote: InterestVote.Yes,
      }),
      makeProposal({
        proposalId: "p-3",
        name: "Cooking class",
        description: undefined,
        proposerName: "Casey",
        counts: { yes: 1, maybe: 2, no: 0 },
        timeHint: undefined,
      }),
    ],
    isLoading: false,
    isError: false,
    onVote: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ActivitiesTripPageView>;

export const Loaded: Story = {};

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
