import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InvitePageView } from "./InvitePageView";

const meta: Meta<typeof InvitePageView> = {
  component: InvitePageView,
};

export default meta;

type Story = StoryObj<typeof InvitePageView>;

const BASE_TRIP = {
  name: "Paris Adventure",
  startDate: "2026-09-01T00:00:00.000Z",
  endDate: "2026-09-08T00:00:00.000Z",
  memberCount: 4,
};

export const Unauthenticated: Story = {
  args: {
    trip: BASE_TRIP,
    isAuthenticated: false,
    isAlreadyMember: false,
    joinError: false,
    onJoin: () => undefined,
    isJoining: false,
    signInHref: "/sign-in?next=/invite/tok-abc",
    signUpHref: "/sign-up?next=/invite/tok-abc",
  },
};

export const AuthenticatedNotMember: Story = {
  args: {
    trip: BASE_TRIP,
    isAuthenticated: true,
    isAlreadyMember: false,
    joinError: false,
    onJoin: () => undefined,
    isJoining: false,
    signInHref: "/sign-in",
    signUpHref: "/sign-up",
  },
};

export const Joining: Story = {
  args: {
    trip: BASE_TRIP,
    isAuthenticated: true,
    isAlreadyMember: false,
    joinError: false,
    onJoin: () => undefined,
    isJoining: true,
    signInHref: "/sign-in",
    signUpHref: "/sign-up",
  },
};

export const AlreadyMember: Story = {
  args: {
    trip: BASE_TRIP,
    isAuthenticated: true,
    isAlreadyMember: true,
    joinError: false,
    onJoin: () => undefined,
    isJoining: false,
    signInHref: "/sign-in",
    signUpHref: "/sign-up",
  },
};

export const JoinError: Story = {
  args: {
    trip: BASE_TRIP,
    isAuthenticated: true,
    isAlreadyMember: false,
    joinError: true,
    onJoin: () => undefined,
    isJoining: false,
    signInHref: "/sign-in",
    signUpHref: "/sign-up",
  },
};
