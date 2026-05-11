import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  ExpenseSettingsCategory,
  ExpenseSettingsPageView,
  ExpenseUnitModel,
  type ExpenseSettingsCategoryConfig,
  type ExpenseSettingsMemberOption,
} from "./ExpenseSettingsPageView";

const MEMBERS: ExpenseSettingsMemberOption[] = [
  { memberId: "member-alice", name: "Alice" },
  { memberId: "member-bob", name: "Bob" },
  { memberId: "member-carol", name: "Carol" },
];

const CATEGORIES: ExpenseSettingsCategoryConfig[] = [
  {
    category: ExpenseSettingsCategory.Activities,
    categoryLabel: "Activities",
    defaultParticipantMemberIds: ["member-alice", "member-bob", "member-carol"],
    unitModel: ExpenseUnitModel.UsageShare,
  },
  {
    category: ExpenseSettingsCategory.Food,
    categoryLabel: "Food",
    defaultParticipantMemberIds: ["member-alice", "member-bob", "member-carol"],
    unitModel: ExpenseUnitModel.SharedBucket,
  },
  {
    category: ExpenseSettingsCategory.Lodging,
    categoryLabel: "Lodging",
    defaultParticipantMemberIds: ["member-alice", "member-bob"],
    unitModel: ExpenseUnitModel.PerUnit,
  },
  {
    category: ExpenseSettingsCategory.Transport,
    categoryLabel: "Transport",
    defaultParticipantMemberIds: ["member-alice"],
    unitModel: ExpenseUnitModel.UsageShare,
  },
];

const meta: Meta<typeof ExpenseSettingsPageView> = {
  component: ExpenseSettingsPageView,
  args: {
    initialCategories: CATEGORIES,
    memberOptions: MEMBERS,
    onSave: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ExpenseSettingsPageView>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
