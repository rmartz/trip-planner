import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LandingPageView } from "./LandingPageView";

const meta: Meta<typeof LandingPageView> = {
  component: LandingPageView,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof LandingPageView>;

export const Default: Story = {};
