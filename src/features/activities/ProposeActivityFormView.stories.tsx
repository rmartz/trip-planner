import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ProposeActivityFormView } from "./ProposeActivityFormView";

const meta: Meta<typeof ProposeActivityFormView> = {
  component: ProposeActivityFormView,
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof ProposeActivityFormView>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
