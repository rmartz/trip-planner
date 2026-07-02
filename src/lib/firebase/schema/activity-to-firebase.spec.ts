import { describe, expect, it } from "vitest";
import {
  TimeOfDaySlot,
  TimeOfDaySlotType,
  TransportationMode,
} from "@/lib/types/activity";
import { activityToFirebase } from "./activity";

// tripId is stored on each document to enable the collection-group query path
describe("activityToFirebase denormalizes tripId", () => {
  it("persists the provided tripId onto the document", () => {
    const data = activityToFirebase(
      { name: "Louvre", estimatedDurationMinutes: 90 },
      "trip-abc",
    );
    expect(data.tripId).toBe("trip-abc");
  });
});

describe("name and description fields", () => {
  it("maps name", () => {
    const data = activityToFirebase(
      {
        name: "Seine River Cruise",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect(data.name).toBe("Seine River Cruise");
  });

  it("includes description when defined", () => {
    const data = activityToFirebase(
      {
        name: "Seine River Cruise",
        estimatedDurationMinutes: 60,
        description: "Relaxing river cruise",
      },
      "trip-1",
    );
    expect(data.description).toBe("Relaxing river cruise");
  });

  it("omits description when undefined", () => {
    const data = activityToFirebase(
      {
        name: "Seine River Cruise",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect("description" in data).toBe(false);
  });
});

describe("estimatedDurationMinutes field", () => {
  it("maps estimatedDurationMinutes", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 45,
      },
      "trip-1",
    );
    expect(data.estimatedDurationMinutes).toBe(45);
  });
});

describe("timeOfDaySlot field", () => {
  it("includes timeOfDaySlot when defined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
        timeOfDaySlot: {
          type: TimeOfDaySlotType.MustOccurIn,
          slots: [TimeOfDaySlot.Morning],
        },
      },
      "trip-1",
    );
    expect(data.timeOfDaySlot?.type).toBe(TimeOfDaySlotType.MustOccurIn);
    expect(data.timeOfDaySlot?.slots).toEqual([TimeOfDaySlot.Morning]);
  });

  it("omits timeOfDaySlot when undefined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect("timeOfDaySlot" in data).toBe(false);
  });
});

describe("groupSize field", () => {
  it("includes groupSize when defined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
        groupSize: { min: 3, max: 8 },
      },
      "trip-1",
    );
    expect(data.groupSize?.min).toBe(3);
    expect(data.groupSize?.max).toBe(8);
  });

  it("omits groupSize when undefined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect("groupSize" in data).toBe(false);
  });
});

describe("costPerPerson field", () => {
  it("includes costPerPerson when defined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
        costPerPerson: 15,
      },
      "trip-1",
    );
    expect(data.costPerPerson).toBe(15);
  });

  it("omits costPerPerson when undefined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect("costPerPerson" in data).toBe(false);
  });
});

describe("transportationRequired field", () => {
  it("includes transportationRequired when defined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
        transportationRequired: TransportationMode.Private,
      },
      "trip-1",
    );
    expect(data.transportationRequired).toBe(TransportationMode.Private);
  });

  it("omits transportationRequired when undefined", () => {
    const data = activityToFirebase(
      {
        name: "x",
        estimatedDurationMinutes: 60,
      },
      "trip-1",
    );
    expect("transportationRequired" in data).toBe(false);
  });
});
