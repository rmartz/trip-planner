import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { NotificationType } from "@/lib/types/notification";
import type { Notification } from "@/lib/types/notification";
import { firebaseToNotification, notificationToFirebase } from "./notification";

const CREATED_AT = "2026-05-01T10:00:00Z";

function makeTimestamp(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

/**
 * Returns a DocumentData object suitable for passing to firebaseToNotification.
 * All fields have sensible defaults; pass overrides to vary individual values.
 */
function makeFirebaseNotificationData(
  overrides: Partial<{
    type: NotificationType;
    read: boolean;
    createdAt: Timestamp;
    title: string;
    tripId: string;
    triggerType: NotificationType;
  }> = {},
) {
  return {
    type: NotificationType.VoteReceived,
    read: false,
    createdAt: makeTimestamp(CREATED_AT),
    title: "Jess voted 'Yes' on Marfa",
    tripId: "trip-1",
    triggerType: NotificationType.VoteReceived,
    ...overrides,
  };
}

/**
 * Returns a domain Notification object (minus notificationId) suitable for
 * passing to notificationToFirebase. All fields have sensible defaults; pass
 * overrides to vary individual values.
 */
function makeNotification(
  overrides: Partial<Omit<Notification, "notificationId">> = {},
): Omit<Notification, "notificationId"> {
  return {
    uid: "uid-1",
    type: NotificationType.VoteReceived,
    read: false,
    createdAt: new Date(CREATED_AT),
    title: "Jess voted 'Yes' on Marfa",
    tripId: "trip-1",
    triggerType: NotificationType.VoteReceived,
    ...overrides,
  };
}

// criterion 1: Notification type has required fields: notificationId, type, read, createdAt, title, tripId, triggerType

describe("firebaseToNotification — maps notificationId from argument", () => {
  it("maps notificationId", () => {
    const notification = firebaseToNotification(
      "notif-abc",
      "uid-1",
      makeFirebaseNotificationData(),
    );
    expect(notification.notificationId).toBe("notif-abc");
  });
});

describe("firebaseToNotification — maps uid from argument", () => {
  it("maps uid", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-xyz",
      makeFirebaseNotificationData({ title: "Some title" }),
    );
    expect(notification.uid).toBe("uid-xyz");
  });
});

describe("firebaseToNotification — maps type field", () => {
  it("maps type as NotificationType enum value", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({
        type: NotificationType.TripInvite,
        title: "You were invited",
        triggerType: NotificationType.TripInvite,
      }),
    );
    expect(notification.type).toBe(NotificationType.TripInvite);
  });

  it("maps type independently of triggerType", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({
        type: NotificationType.TripInvite,
        triggerType: NotificationType.VoteReceived,
      }),
    );
    expect(notification.type).toBe(NotificationType.TripInvite);
    expect(notification.triggerType).toBe(NotificationType.VoteReceived);
  });
});

describe("firebaseToNotification — maps read field", () => {
  it("maps read as true", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({ read: true }),
    );
    expect(notification.read).toBe(true);
  });

  it("maps read as false", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({ read: false }),
    );
    expect(notification.read).toBe(false);
  });

  it("defaults read to false when absent", () => {
    const notification = firebaseToNotification("notif-1", "uid-1", {
      type: NotificationType.VoteReceived,
      createdAt: makeTimestamp(CREATED_AT),
      title: "title",
      tripId: "trip-1",
      triggerType: NotificationType.VoteReceived,
    });
    expect(notification.read).toBe(false);
  });
});

describe("firebaseToNotification — converts createdAt Timestamp to Date", () => {
  it("converts Timestamp to Date", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData(),
    );
    expect(notification.createdAt.toISOString()).toBe(
      new Date(CREATED_AT).toISOString(),
    );
  });

  it("falls back to current time when createdAt is absent", () => {
    const before = Date.now();
    const notification = firebaseToNotification("notif-1", "uid-1", {
      type: NotificationType.VoteReceived,
      read: false,
      title: "title",
      tripId: "trip-1",
      triggerType: NotificationType.VoteReceived,
    });
    const after = Date.now();
    expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(notification.createdAt.getTime()).toBeLessThanOrEqual(after);
  });
});

describe("firebaseToNotification — maps title field", () => {
  it("maps title", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({ title: "Jess voted 'Yes' on Marfa" }),
    );
    expect(notification.title).toBe("Jess voted 'Yes' on Marfa");
  });
});

describe("firebaseToNotification — maps tripId field", () => {
  it("maps tripId", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({ tripId: "trip-abc" }),
    );
    expect(notification.tripId).toBe("trip-abc");
  });
});

describe("firebaseToNotification — maps triggerType field", () => {
  it("maps triggerType", () => {
    const notification = firebaseToNotification(
      "notif-1",
      "uid-1",
      makeFirebaseNotificationData({
        triggerType: NotificationType.VoteReceived,
      }),
    );
    expect(notification.triggerType).toBe(NotificationType.VoteReceived);
  });
});

// criterion 2: notificationToFirebase converts Notification to Firestore document shape

describe("notificationToFirebase — maps type", () => {
  it("maps type", () => {
    const data = notificationToFirebase(
      makeNotification({
        type: NotificationType.TripInvite,
        title: "You were invited",
        triggerType: NotificationType.TripInvite,
      }),
    );
    expect(data.type).toBe(NotificationType.TripInvite);
  });
});

describe("notificationToFirebase — maps read", () => {
  it("maps read as true", () => {
    const data = notificationToFirebase(makeNotification({ read: true }));
    expect(data.read).toBe(true);
  });
});

describe("notificationToFirebase — converts createdAt to Timestamp", () => {
  it("converts Date to Timestamp", () => {
    const date = new Date(CREATED_AT);
    const data = notificationToFirebase(makeNotification({ createdAt: date }));
    expect(data.createdAt.toDate().toISOString()).toBe(date.toISOString());
  });
});

describe("notificationToFirebase — maps title", () => {
  it("maps title", () => {
    const data = notificationToFirebase(
      makeNotification({ title: "Jess voted 'Yes' on Marfa" }),
    );
    expect(data.title).toBe("Jess voted 'Yes' on Marfa");
  });
});

describe("notificationToFirebase — maps tripId", () => {
  it("maps tripId", () => {
    const data = notificationToFirebase(
      makeNotification({ tripId: "trip-xyz" }),
    );
    expect(data.tripId).toBe("trip-xyz");
  });
});

describe("notificationToFirebase — maps triggerType", () => {
  it("maps triggerType", () => {
    const data = notificationToFirebase(
      makeNotification({ triggerType: NotificationType.VoteReceived }),
    );
    expect(data.triggerType).toBe(NotificationType.VoteReceived);
  });
});
