import { describe, expect, it } from "vitest";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { activityToFirebase, firebaseToActivity } from "./activity";

// Criterion 1: Activity.pinned and Activity.pinnedSlot fields round-trip through Firebase schema
describe("pinned field", () => {
  it("firebaseToActivity maps pinned as true when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Birthday dinner",
      estimatedDurationMinutes: 90,
      pinned: true,
    });
    expect(activity.pinned).toBe(true);
  });

  it("firebaseToActivity maps pinned as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Birthday dinner",
      estimatedDurationMinutes: 90,
    });
    expect(activity.pinned).toBeUndefined();
  });

  it("activityToFirebase includes pinned when true", () => {
    const data = activityToFirebase(
      {
        name: "Birthday dinner",
        estimatedDurationMinutes: 90,
        pinned: true,
      },
      "trip-1",
    );
    expect(data.pinned).toBe(true);
  });

  it("activityToFirebase omits pinned when undefined", () => {
    const data = activityToFirebase(
      {
        name: "Birthday dinner",
        estimatedDurationMinutes: 90,
      },
      "trip-1",
    );
    expect("pinned" in data).toBe(false);
  });
});

describe("pinnedSlot field", () => {
  it("firebaseToActivity maps pinnedSlot when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Birthday dinner",
      estimatedDurationMinutes: 90,
      pinned: true,
      pinnedSlot: TimeOfDaySlot.Evening,
    });
    expect(activity.pinnedSlot).toBe(TimeOfDaySlot.Evening);
  });

  it("firebaseToActivity maps pinnedSlot as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Birthday dinner",
      estimatedDurationMinutes: 90,
      pinned: true,
    });
    expect(activity.pinnedSlot).toBeUndefined();
  });

  it("activityToFirebase includes pinnedSlot when present", () => {
    const data = activityToFirebase(
      {
        name: "Birthday dinner",
        estimatedDurationMinutes: 90,
        pinned: true,
        pinnedSlot: TimeOfDaySlot.Evening,
      },
      "trip-1",
    );
    expect(data.pinnedSlot).toBe(TimeOfDaySlot.Evening);
  });

  it("activityToFirebase omits pinnedSlot when undefined", () => {
    const data = activityToFirebase(
      {
        name: "Birthday dinner",
        estimatedDurationMinutes: 90,
        pinned: true,
      },
      "trip-1",
    );
    expect("pinnedSlot" in data).toBe(false);
  });

  it("activityToFirebase omits pinnedSlot when activity is not pinned", () => {
    const data = activityToFirebase(
      {
        name: "Birthday dinner",
        estimatedDurationMinutes: 90,
      },
      "trip-1",
    );
    expect("pinnedSlot" in data).toBe(false);
  });
});
