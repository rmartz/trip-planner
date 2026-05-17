import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import {
  type NotificationListItem,
  NotificationsListPageView,
  NotificationType,
} from "../NotificationsListPageView";

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

describe("notification type icons — each type renders an SVG icon", () => {
  it("ActivityScheduled renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.ActivityScheduled }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("ExpenseAdded renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.ExpenseAdded }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("LegRemoved renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.LegRemoved }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("LodgingOffer renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.LodgingOffer }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("TransportOffer renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.TransportOffer }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("TripInvitation renders an SVG icon", () => {
    const { container } = render(
      <NotificationsListPageView
        notifications={[
          makeNotification({ type: NotificationType.TripInvitation }),
        ]}
        isLoading={false}
        isError={false}
        onMarkAllRead={vi.fn()}
        onNotificationClick={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });
});
