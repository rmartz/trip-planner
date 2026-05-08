import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import { DestinationFormView } from "./DestinationFormView";
import { DESTINATION_FORM_COPY } from "./DestinationFormView.copy";

const meta: Meta<typeof DestinationFormView> = {
  component: DestinationFormView,
  args: {
    mode: "create",
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof DestinationFormView>;

export const CreateDefault: Story = {};

export const CreateNameMissingError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    );
  },
};

export const CreateSubmitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const EditDefault: Story = {
  args: {
    mode: "edit",
    initialName: "Paris",
    initialSeasonality: "best in spring",
  },
};

export const EditSubmitting: Story = {
  args: {
    mode: "edit",
    initialName: "Paris",
    initialSeasonality: "best in spring",
    isSubmitting: true,
  },
};
