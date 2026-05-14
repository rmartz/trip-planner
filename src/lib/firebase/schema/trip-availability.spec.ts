import { describe, expect, it } from "vitest";
import {
  firebaseToTripAvailability,
  tripAvailabilityToFirebase,
} from "./trip-availability";

describe("firebaseToTripAvailability — deserializes Firestore data", () => {
  it("returns availableDates from the document field", () => {
    const result = firebaseToTripAvailability("user-1", "trip-1", {
      availableDates: ["2025-06-10", "2025-06-11"],
    });

    expect(result.availableDates).toEqual(["2025-06-10", "2025-06-11"]);
  });

  it("returns uid and tripId from arguments", () => {
    const result = firebaseToTripAvailability("user-1", "trip-1", {
      availableDates: [],
    });

    expect(result.uid).toBe("user-1");
    expect(result.tripId).toBe("trip-1");
  });

  it("defaults to empty array when availableDates field is missing", () => {
    const result = firebaseToTripAvailability("user-1", "trip-1", {});

    expect(result.availableDates).toEqual([]);
  });
});

describe("tripAvailabilityToFirebase — serializes for Firestore", () => {
  it("writes availableDates as-is", () => {
    const result = tripAvailabilityToFirebase(["2025-06-10", "2025-06-12"]);

    expect(result.availableDates).toEqual(["2025-06-10", "2025-06-12"]);
  });

  it("writes an empty array when no dates are selected", () => {
    const result = tripAvailabilityToFirebase([]);

    expect(result.availableDates).toEqual([]);
  });
});
