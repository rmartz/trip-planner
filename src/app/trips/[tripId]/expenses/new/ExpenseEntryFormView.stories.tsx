import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  ExpenseEntryFormView,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "./ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

const MEMBERS: ExpenseEntryMemberOption[] = [
  { memberId: "member-alice", name: "Alice" },
  { memberId: "member-bob", name: "Bob" },
  { memberId: "member-carol", name: "Carol" },
];

const LINKED_ENTITIES: ExpenseEntryLinkedEntityOption[] = [
  { entityId: "stop-paris", label: "Paris stop" },
  { entityId: "lodging-1", label: "Lyon hotel" },
  { entityId: "transport-1", label: "Paris → Lyon train" },
];

const meta: Meta<typeof ExpenseEntryFormView> = {
  component: ExpenseEntryFormView,
  args: {
    memberOptions: MEMBERS,
    linkedEntityOptions: LINKED_ENTITIES,
    initialPayerId: "member-alice",
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ExpenseEntryFormView>;

export const Default: Story = {};

export const NoPreselectedPayer: Story = {
  args: {
    initialPayerId: undefined,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const SubmitError: Story = {
  args: {
    submitError: EXPENSE_ENTRY_FORM_COPY.submitError,
  },
};
