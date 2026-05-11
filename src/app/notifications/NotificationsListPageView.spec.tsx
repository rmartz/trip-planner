import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  NotificationsListPageView,
  NotificationType,
  type NotificationListItem,
} from "./NotificationsListPageView";
import { NOTIFICATIONS_LIST_PAGE_COPY } from "./NotificationsListPageView.copy";

afterEach(cleanup);

function makeNotification(
  overrides: Partial<NotificationListItem> = {},
): NotificationListItem {
  return {
    body: "Sample body",
    notificationId: "notif-1",
    occurredAt: new Date("2026-05-11T10:00:00Z"),
    read: false,
    title: "Sample title",
    type: NotificationType.TripInvitation,
    ...overrides,
  };
}

describe("NotificationsListPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <NotificationsListPageView
        notifications={[]}
        isLoading={true}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.loadingText),
    ).toBeDefined();
  });

  it("does not render the notification list when loading", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[makeNotification()]}
        isLoading={true}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid=notification-list]"),
    ).toBeNull();
  });
});

describe("NotificationsListPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <NotificationsListPageView
        notifications={[]}
        isLoading={false}
        isError={true}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.errorText),
    ).toBeDefined();
  });
});

describe("NotificationsListPageView — empty state", () => {
  it("renders empty text when no notifications are present", () => {
    render(
      <NotificationsListPageView
        notifications={[]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.emptyText),
    ).toBeDefined();
  });
});

describe("NotificationsListPageView — heading", () => {
  it("renders the page heading and subtext", () => {
    render(
      <NotificationsListPageView
        notifications={[]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.heading),
    ).toBeDefined();
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.headingSubtext),
    ).toBeDefined();
  });
});

describe("NotificationsListPageView — list rendering", () => {
  it("renders one row per notification", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-1" }),
          makeNotification({ notificationId: "n-2" }),
          makeNotification({ notificationId: "n-3" }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    const list = container.querySelector("[data-testid=notification-list]");
    expect(list?.children.length).toBe(3);
  });

  it("renders each notification's title", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({
            notificationId: "n-1",
            title: "Invited to Iceland trip",
          }),
          makeNotification({ notificationId: "n-2", title: "Lodging offered" }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Invited to Iceland trip")).toBeDefined();
    expect(screen.getByText("Lodging offered")).toBeDefined();
  });

  it("renders each notification's body", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-1", body: "Reed invited you" }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Reed invited you")).toBeDefined();
  });

  it("marks unread notifications with the unread badge", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-1", read: false }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(NOTIFICATIONS_LIST_PAGE_COPY.unreadBadge),
    ).toBeDefined();
  });

  it("does not show the unread badge for read notifications", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-1", read: true }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(NOTIFICATIONS_LIST_PAGE_COPY.unreadBadge),
    ).toBeNull();
  });

  it("exposes the read state via the data-read attribute", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-1", read: true }),
          makeNotification({ notificationId: "n-2", read: false }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    const rows = screen.getAllByTestId("notification-row");
    expect(rows[0]?.getAttribute("data-read")).toBe("true");
    expect(rows[1]?.getAttribute("data-read")).toBe("false");
  });
});

describe("NotificationsListPageView — mark all read", () => {
  it("renders the mark-all-read button when at least one notification is unread", () => {
    render(
      <NotificationsListPageView
        notifications={[makeNotification({ read: false })]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: NOTIFICATIONS_LIST_PAGE_COPY.markAllReadButton,
      }),
    ).toBeDefined();
  });

  it("hides the mark-all-read button when all notifications are read", () => {
    render(
      <NotificationsListPageView
        notifications={[makeNotification({ read: true })]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: NOTIFICATIONS_LIST_PAGE_COPY.markAllReadButton,
      }),
    ).toBeNull();
  });

  it("invokes onMarkAllRead when the button is clicked", () => {
    const onMarkAllRead = vi.fn();
    render(
      <NotificationsListPageView
        notifications={[makeNotification({ read: false })]}
        isLoading={false}
        isError={false}
        onMarkAllRead={onMarkAllRead}
        onNotificationClick={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: NOTIFICATIONS_LIST_PAGE_COPY.markAllReadButton,
      }),
    );
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationsListPageView — deterministic timestamps", () => {
  it("formats relative timestamps against the provided now prop", () => {
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({
            notificationId: "n-1",
            occurredAt: new Date("2026-05-11T09:58:00Z"),
          }),
        ]}
        isLoading={false}
        isError={false}
        now={new Date("2026-05-11T10:00:00Z")}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(screen.getByText("2m ago")).toBeDefined();
  });
});

describe("NotificationsListPageView — notification click", () => {
  it("invokes onNotificationClick with the notification id when a row is clicked", () => {
    const onNotificationClick = vi.fn();
    render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ notificationId: "n-42", title: "Click me" }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={onNotificationClick}
      />,
    );
    fireEvent.click(screen.getByText("Click me"));
    expect(onNotificationClick).toHaveBeenCalledWith("n-42");
  });
});
