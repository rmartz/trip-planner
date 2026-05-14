import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InvitePageView } from "./InvitePageView";
import { INVITE_PAGE_COPY } from "./copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const BASE_TRIP = {
  name: "Paris Trip",
  startDate: "2025-06-01T00:00:00.000Z",
  endDate: "2025-06-08T00:00:00.000Z",
  memberCount: 3,
};

describe("InvitePageView — unauthenticated", () => {
  it("renders the trip name", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={false}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in?next=/invite/tok-abc"
        signUpHref="/sign-up?next=/invite/tok-abc"
      />,
    );
    expect(screen.getByText("Paris Trip")).toBeDefined();
  });

  it("renders the sign-up CTA for unauthenticated users", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={false}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in?next=/invite/tok-abc"
        signUpHref="/sign-up?next=/invite/tok-abc"
      />,
    );
    expect(screen.getByText(INVITE_PAGE_COPY.signUpButton)).toBeDefined();
  });

  it("renders the sign-in CTA for unauthenticated users", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={false}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in?next=/invite/tok-abc"
        signUpHref="/sign-up?next=/invite/tok-abc"
      />,
    );
    expect(screen.getByText(INVITE_PAGE_COPY.signInButton)).toBeDefined();
  });

  it("does not render the join button for unauthenticated users", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={false}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in?next=/invite/tok-abc"
        signUpHref="/sign-up?next=/invite/tok-abc"
      />,
    );
    expect(screen.queryByText(INVITE_PAGE_COPY.joinButton)).toBeNull();
  });
});

describe("InvitePageView — authenticated, not yet a member", () => {
  it("renders the join button", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.getByText(INVITE_PAGE_COPY.joinButton)).toBeDefined();
  });

  it("calls onJoin when the join button is clicked", () => {
    const onJoin = vi.fn();
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={false}
        onJoin={onJoin}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    fireEvent.click(screen.getByText(INVITE_PAGE_COPY.joinButton));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it("does not render sign-in or sign-up CTAs when authenticated", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.queryByText(INVITE_PAGE_COPY.signUpButton)).toBeNull();
    expect(screen.queryByText(INVITE_PAGE_COPY.signInButton)).toBeNull();
  });
});

describe("InvitePageView — already a member", () => {
  it("renders the already-member message", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={true}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.getByText(INVITE_PAGE_COPY.alreadyMember)).toBeDefined();
  });

  it("does not render the join button when already a member", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={true}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.queryByText(INVITE_PAGE_COPY.joinButton)).toBeNull();
  });
});

describe("InvitePageView — join error", () => {
  it("renders the error message when joinError is true", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={true}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.getByText(INVITE_PAGE_COPY.joinError)).toBeDefined();
  });

  it("does not render the join button when joinError is true", () => {
    render(
      <InvitePageView
        trip={BASE_TRIP}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={true}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    expect(screen.queryByText(INVITE_PAGE_COPY.joinButton)).toBeNull();
  });
});

describe("InvitePageView — member count", () => {
  it("renders the member count sub-line", () => {
    render(
      <InvitePageView
        trip={{ ...BASE_TRIP, memberCount: 5 }}
        isAuthenticated={true}
        isAlreadyMember={false}
        joinError={false}
        onJoin={vi.fn()}
        isJoining={false}
        signInHref="/sign-in"
        signUpHref="/sign-up"
      />,
    );
    const memberLine = screen.getByText(/already going/);
    expect(memberLine.textContent).toContain("5");
  });
});
