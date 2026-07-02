import { describe, expect, it } from "vitest";
import {
  TimeOfDaySlot,
  TimeOfDaySlotType,
  TransportationMode,
} from "@/lib/types/activity";
import { firebaseToActivity } from "./activity";

// Criterion 1: Activity has name (required) and optional description fields
describe("name and description fields", () => {
  it("maps activityId from argument", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Eiffel Tower",
      estimatedDurationMinutes: 90,
    });
    expect(activity.activityId).toBe("act-1");
  });

  it("maps stopId from argument", () => {
    const activity = firebaseToActivity("act-1", "stop-xyz", "trip-1", {
      name: "Eiffel Tower",
      estimatedDurationMinutes: 90,
    });
    expect(activity.stopId).toBe("stop-xyz");
  });

  it("maps tripId from argument", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-abc", {
      name: "Eiffel Tower",
      estimatedDurationMinutes: 90,
    });
    expect(activity.tripId).toBe("trip-abc");
  });

  it("maps name", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Louvre Museum",
      estimatedDurationMinutes: 180,
    });
    expect(activity.name).toBe("Louvre Museum");
  });

  it("falls back to empty string when name is absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      estimatedDurationMinutes: 60,
    });
    expect(activity.name).toBe("");
  });

  it("maps description when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Eiffel Tower",
      estimatedDurationMinutes: 90,
      description: "Famous iron lattice tower",
    });
    expect(activity.description).toBe("Famous iron lattice tower");
  });

  it("maps description as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "Eiffel Tower",
      estimatedDurationMinutes: 90,
    });
    expect(activity.description).toBeUndefined();
  });
});

// Criterion 2: Activity has estimatedDurationMinutes (required)
describe("estimatedDurationMinutes field", () => {
  it("maps estimatedDurationMinutes", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 120,
    });
    expect(activity.estimatedDurationMinutes).toBe(120);
  });

  it("falls back to 0 when estimatedDurationMinutes is absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
    });
    expect(activity.estimatedDurationMinutes).toBe(0);
  });
});

// Criterion 3: Activity has optional timeOfDaySlot with type and one or more slots
describe("timeOfDaySlot field", () => {
  it("maps timeOfDaySlot when present with MustOccurIn type", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: {
        type: TimeOfDaySlotType.MustOccurIn,
        slots: [TimeOfDaySlot.Morning],
      },
    });
    expect(activity.timeOfDaySlot?.type).toBe(TimeOfDaySlotType.MustOccurIn);
    expect(activity.timeOfDaySlot?.slots).toEqual([TimeOfDaySlot.Morning]);
  });

  it("maps timeOfDaySlot when present with PreferredIn type", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: {
        type: TimeOfDaySlotType.PreferredIn,
        slots: [TimeOfDaySlot.Afternoon, TimeOfDaySlot.Evening],
      },
    });
    expect(activity.timeOfDaySlot?.type).toBe(TimeOfDaySlotType.PreferredIn);
    expect(activity.timeOfDaySlot?.slots).toEqual([
      TimeOfDaySlot.Afternoon,
      TimeOfDaySlot.Evening,
    ]);
  });

  it("maps multiple slots", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: {
        type: TimeOfDaySlotType.MustOccurIn,
        slots: [
          TimeOfDaySlot.EarlyMorning,
          TimeOfDaySlot.Morning,
          TimeOfDaySlot.LateEvening,
        ],
      },
    });
    expect(activity.timeOfDaySlot?.slots).toEqual([
      TimeOfDaySlot.EarlyMorning,
      TimeOfDaySlot.Morning,
      TimeOfDaySlot.LateEvening,
    ]);
  });

  it("maps timeOfDaySlot as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
    });
    expect(activity.timeOfDaySlot).toBeUndefined();
  });
});

// Criterion 4: Activity has optional group size min/max
describe("groupSize field", () => {
  it("maps groupSize when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      groupSize: { min: 2, max: 10 },
    });
    expect(activity.groupSize?.min).toBe(2);
    expect(activity.groupSize?.max).toBe(10);
  });

  it("maps groupSize with only min", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      groupSize: { min: 1 },
    });
    expect(activity.groupSize?.min).toBe(1);
    expect(activity.groupSize?.max).toBeUndefined();
  });

  it("maps groupSize with only max", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      groupSize: { max: 20 },
    });
    expect(activity.groupSize?.min).toBeUndefined();
    expect(activity.groupSize?.max).toBe(20);
  });

  it("maps groupSize as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
    });
    expect(activity.groupSize).toBeUndefined();
  });
});

// Criterion 5: Activity has optional costPerPerson
describe("costPerPerson field", () => {
  it("maps costPerPerson when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      costPerPerson: 25.5,
    });
    expect(activity.costPerPerson).toBe(25.5);
  });

  it("maps costPerPerson as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
    });
    expect(activity.costPerPerson).toBeUndefined();
  });
});

// Criterion 6: Activity has optional transportationRequired flag (Walking / Public-transit / Private)
describe("transportationRequired field", () => {
  it("maps transportationRequired as Walking when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      transportationRequired: TransportationMode.Walking,
    });
    expect(activity.transportationRequired).toBe(TransportationMode.Walking);
  });

  it("maps transportationRequired as PublicTransit when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      transportationRequired: TransportationMode.PublicTransit,
    });
    expect(activity.transportationRequired).toBe(
      TransportationMode.PublicTransit,
    );
  });

  it("maps transportationRequired as Private when present", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      transportationRequired: TransportationMode.Private,
    });
    expect(activity.transportationRequired).toBe(TransportationMode.Private);
  });

  it("maps transportationRequired as undefined when absent", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
    });
    expect(activity.transportationRequired).toBeUndefined();
  });
});

// Criterion 7: firebaseToActivity omits optional fields when helper returns undefined from malformed input
describe("malformed optional field handling", () => {
  it("omits timeOfDaySlot when field is present but not an object", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: "not-an-object",
    });
    expect("timeOfDaySlot" in activity).toBe(false);
  });

  it("omits timeOfDaySlot when field is present but missing required keys", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: { type: "must-occur-in" },
    });
    expect("timeOfDaySlot" in activity).toBe(false);
  });

  it("omits timeOfDaySlot when field is null", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      timeOfDaySlot: null,
    });
    expect("timeOfDaySlot" in activity).toBe(false);
  });

  it("omits groupSize when field is present but not an object", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      groupSize: "not-an-object",
    });
    expect("groupSize" in activity).toBe(false);
  });

  it("omits groupSize when field is null", () => {
    const activity = firebaseToActivity("act-1", "stop-1", "trip-1", {
      name: "x",
      estimatedDurationMinutes: 60,
      groupSize: null,
    });
    expect("groupSize" in activity).toBe(false);
  });
});
