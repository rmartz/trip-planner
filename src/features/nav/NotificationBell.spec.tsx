import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NotificationBell } from "./NotificationBell";
import { NOTIFICATION_BELL_COPY } from "./NotificationBell.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("NotificationBell renders bell icon", () => {
  it("renders the accessible label", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(
      screen.getByRole("button", { name: NOTIFICATION_BELL_COPY.label }),
    ).toBeDefined();
  });
});

describe("NotificationBell shows unread badge when count > 0", () => {
  it("renders the unread count when greater than zero", () => {
    render(<NotificationBell unreadCount={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });

  it("does not render a badge when count is zero", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.queryByTestId("notification-badge")).toBeNull();
  });
});

describe("NotificationBell caps badge display at 99", () => {
  it("shows '99+' when unread count exceeds 99", () => {
    render(<NotificationBell unreadCount={150} />);
    expect(screen.getByText("99+")).toBeDefined();
  });
});
