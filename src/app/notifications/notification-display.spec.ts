import { describe, expect, it } from "vitest";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";
import { NotificationType as ViewNotificationType } from "./NotificationsListPageView";
import {
  notificationLinkPath,
  notificationToListItem,
} from "./notification-display";

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

describe("notificationToListItem — maps domain type to a view display category", () => {
  it("maps TripInvite to the TripInvitation display category", () => {
    const item = notificationToListItem(
      makeNotification({ type: NotificationType.TripInvite }),
    );
    expect(item.type).toBe(ViewNotificationType.TripInvitation);
  });

  it("maps LegRemoved to the LegRemoved display category", () => {
    const item = notificationToListItem(
      makeNotification({ type: NotificationType.LegRemoved }),
    );
    expect(item.type).toBe(ViewNotificationType.LegRemoved);
  });

  it("maps VoteReceived to the ActivityScheduled display category", () => {
    const item = notificationToListItem(
      makeNotification({ type: NotificationType.VoteReceived }),
    );
    expect(item.type).toBe(ViewNotificationType.ActivityScheduled);
  });

  it("carries the createdAt timestamp through as occurredAt", () => {
    const createdAt = new Date("2026-05-11T10:00:00Z");
    const item = notificationToListItem(makeNotification({ createdAt }));
    expect(item.occurredAt).toBe(createdAt);
  });
});

describe("notificationLinkPath — resolves the linked in-app route", () => {
  it("links a LegRemoved notification to the trip archive view", () => {
    const path = notificationLinkPath(
      makeNotification({ type: NotificationType.LegRemoved, tripId: "trip-9" }),
    );
    expect(path).toBe("/trips/trip-9/archive");
  });

  it("links a TripInvite notification to the trip overview", () => {
    const path = notificationLinkPath(
      makeNotification({ type: NotificationType.TripInvite, tripId: "trip-3" }),
    );
    expect(path).toBe("/trips/trip-3");
  });

  it("returns undefined when the notification has no tripId", () => {
    const path = notificationLinkPath(makeNotification({ tripId: "" }));
    expect(path).toBeUndefined();
  });
});
