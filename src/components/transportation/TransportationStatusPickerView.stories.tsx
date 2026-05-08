import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TransportationStatus } from "@/lib/types/transportation";
import { TransportationStatusPickerView } from "./TransportationStatusPickerView";

const meta: Meta<typeof TransportationStatusPickerView> = {
  component: TransportationStatusPickerView,
  args: {
    legId: "leg-1",
    routeName: "I-35 caravan",
    departureLabel: "Fri 4pm",
    value: TransportationStatus.NeedTransportation,
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TransportationStatusPickerView>;

export const Default: Story = {};

export const Driving: Story = {
  args: {
    value: TransportationStatus.Driving,
  },
};

export const DrivingWithSeats: Story = {
  args: {
    routeName: "Hill Country drive",
    departureLabel: "Sat 10am",
    value: TransportationStatus.DrivingWithSeats,
  },
};

export const RidingWith: Story = {
  args: {
    value: TransportationStatus.RidingWith,
  },
};

export const FlyingOrOther: Story = {
  args: {
    routeName: "Drive to Vegas from Denver",
    departureLabel: "Sun 8am",
    value: TransportationStatus.FlyingOrOther,
  },
};
