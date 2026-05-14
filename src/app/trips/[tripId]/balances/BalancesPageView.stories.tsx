import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  type BalanceRow,
  BalancesPageView,
  type TransferRow,
} from "./BalancesPageView";

const BALANCES: BalanceRow[] = [
  {
    amountCents: 8500,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
  },
  {
    amountCents: -6000,
    currency: "USD",
    memberId: "member-bob",
    memberName: "Bob",
  },
  {
    amountCents: -2500,
    currency: "USD",
    memberId: "member-carol",
    memberName: "Carol",
  },
];

const TRANSFERS: TransferRow[] = [
  {
    amountCents: 6000,
    currency: "USD",
    fromMemberId: "member-bob",
    fromMemberName: "Bob",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "t-1",
  },
  {
    amountCents: 2500,
    currency: "USD",
    fromMemberId: "member-carol",
    fromMemberName: "Carol",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "t-2",
  },
];

const meta: Meta<typeof BalancesPageView> = {
  component: BalancesPageView,
  args: {
    balances: BALANCES,
    transfers: TRANSFERS,
    isLoading: false,
    isError: false,
  },
};

export default meta;

type Story = StoryObj<typeof BalancesPageView>;

export const Loaded: Story = {};

export const AllSettled: Story = {
  args: {
    balances: BALANCES.map((b) => ({ ...b, amountCents: 0 })),
    transfers: [],
  },
};

export const Empty: Story = {
  args: {
    balances: [],
    transfers: [],
  },
};

export const Loading: Story = {
  args: {
    balances: [],
    transfers: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    balances: [],
    transfers: [],
    isError: true,
  },
};
