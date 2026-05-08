import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { VoteRow } from "./VoteRow";
import { InterestVote } from "@/lib/types/interest-vote";

const meta: Meta<typeof VoteRow> = {
  component: VoteRow,
  args: {
    onChange: fn(),
    counts: { yes: 5, maybe: 2, no: 1 },
  },
};

export default meta;

type Story = StoryObj<typeof VoteRow>;

export const NoVote: Story = {
  args: {
    value: undefined,
  },
};

export const VotedYes: Story = {
  args: {
    value: InterestVote.Yes,
  },
};

export const VotedMaybe: Story = {
  args: {
    value: InterestVote.Maybe,
  },
};

export const VotedNo: Story = {
  args: {
    value: InterestVote.No,
  },
};

export const ZeroCounts: Story = {
  args: {
    value: undefined,
    counts: { yes: 0, maybe: 0, no: 0 },
  },
};
