import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, userEvent, within } from "storybook/test";
import { CreateTripPageView } from "./CreateTripPageView";
import { CREATE_TRIP_PAGE_COPY } from "./copy";

const meta: Meta<typeof CreateTripPageView> = {
  component: CreateTripPageView,
  args: {
    onSubmit: fn(),
    isSubmitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof CreateTripPageView>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const NameMissingError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );
  },
};

export const StartDateMissingError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel),
      "Summer road trip",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );
  },
};

export const EndDateMissingError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel),
      "Summer road trip",
    );
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
      "2025-06-01",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );
  },
};

export const EndBeforeStartError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel),
      "Summer road trip",
    );
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
      "2025-06-08",
    );
    await userEvent.type(
      canvas.getByLabelText(CREATE_TRIP_PAGE_COPY.endDateLabel),
      "2025-06-01",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );
  },
};
