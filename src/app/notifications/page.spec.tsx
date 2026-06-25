import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();

let mockNotifications: Notification[] = [];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

vi.mock("@/components/nav/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    data: mockNotifications,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/use-mark-notification-read", () => ({
  useMarkNotificationRead: () => ({ mutate: mockMarkRead }),
}));

vi.mock("@/hooks/use-mark-all-notifications-read", () => ({
  useMarkAllNotificationsRead: () => ({ mutate: mockMarkAllRead }),
}));

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    createdAt: new Date("2026-05-11T10:00:00Z"),
    notificationId: "n-1",
    read: false,
    title: "Sample",
    tripId: "trip-1",
    triggerType: NotificationType.TripInvite,
    type: NotificationType.TripInvite,
    uid: "uid-1",
    ...overrides,
  };
}

afterEach(cleanup);

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockMarkRead.mockClear();
  mockMarkAllRead.mockClear();
  mockNotifications = [];
});

async function renderPage() {
  const { default: NotificationsPage } = await import("./page");
  return render(<NotificationsPage />);
}

describe("notifications page — renders live notification records", () => {
  it("renders a row per fetched notification with its title", async () => {
    mockNotifications = [
      makeNotification({ notificationId: "n-1", title: "Invited to Iceland" }),
      makeNotification({ notificationId: "n-2", title: "Leg removed" }),
    ];
    await renderPage();
    expect(screen.getByText("Invited to Iceland")).toBeDefined();
    expect(screen.getByText("Leg removed")).toBeDefined();
  });
});

describe("notifications page — marks an individual notification read on click", () => {
  it("invokes the mark-read mutation with the clicked notification id", async () => {
    mockNotifications = [
      makeNotification({ notificationId: "n-42", title: "Click me" }),
    ];
    await renderPage();
    fireEvent.click(screen.getByText("Click me"));
    expect(mockMarkRead).toHaveBeenCalledWith("n-42");
  });
});

describe("notifications page — navigates to the linked trip entity on click", () => {
  it("pushes the trip archive route for a LegRemoved notification", async () => {
    mockNotifications = [
      makeNotification({
        notificationId: "n-leg",
        title: "Leg removed",
        tripId: "trip-9",
        type: NotificationType.LegRemoved,
      }),
    ];
    await renderPage();
    fireEvent.click(screen.getByText("Leg removed"));
    expect(mockPush).toHaveBeenCalledWith("/trips/trip-9/archive");
  });

  it("pushes the trip overview route for a TripInvite notification", async () => {
    mockNotifications = [
      makeNotification({
        notificationId: "n-invite",
        title: "Invited",
        tripId: "trip-3",
        type: NotificationType.TripInvite,
      }),
    ];
    await renderPage();
    fireEvent.click(screen.getByText("Invited"));
    expect(mockPush).toHaveBeenCalledWith("/trips/trip-3");
  });
});

describe("notifications page — marks all notifications read", () => {
  it("invokes the mark-all-read mutation when the button is clicked", async () => {
    mockNotifications = [
      makeNotification({ notificationId: "n-1", read: false }),
    ];
    await renderPage();
    fireEvent.click(screen.getByTestId("mark-all-read-button"));
    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });
});
