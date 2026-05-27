import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

afterEach(cleanup);

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
});

async function renderPage() {
  const { default: NotificationsPage } = await import("./page");
  return render(<NotificationsPage />);
}

function findRowByText(text: string): HTMLElement | undefined {
  return screen
    .getAllByTestId("notification-row")
    .find((row) =>
      (row.querySelector("button")?.textContent ?? "").includes(text),
    );
}

describe("notification click handler — LegRemoved with tripId navigates to legs view", () => {
  it("calls router.push with the trip legs route when a LegRemoved notification is clicked", async () => {
    await renderPage();
    const button = findRowByText("Leg removed")?.querySelector("button");
    expect(button).toBeDefined();
    fireEvent.click(button!);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/trips\/.+\/legs$/),
    );
  });
});

describe("notification click handler — non-leg notifications do not navigate", () => {
  it("does not call router.push when a TripInvitation notification is clicked", async () => {
    await renderPage();
    const button = findRowByText("Invited to")?.querySelector("button");
    expect(button).toBeDefined();
    fireEvent.click(button!);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("notification click handler — marks notification as read on click", () => {
  it("marks the clicked notification as read", async () => {
    await renderPage();
    const unreadRows = screen
      .getAllByTestId("notification-row")
      .filter((row) => row.getAttribute("data-read") === "false");
    expect(unreadRows.length).toBeGreaterThan(0);
    const button = unreadRows[0]?.querySelector("button");
    fireEvent.click(button!);
    expect(unreadRows[0]?.getAttribute("data-read")).toBe("true");
  });
});

describe("NotificationListItem — tripId field on LegRemoved stub", () => {
  it("the LegRemoved stub notification carries a tripId used for navigation", async () => {
    await renderPage();
    const button = findRowByText("Leg removed")?.querySelector("button");
    fireEvent.click(button!);
    expect(mockPush).toHaveBeenCalledWith(
      expect.not.stringContaining("undefined"),
    );
  });
});
