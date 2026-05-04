import { describe, it, expect } from "vitest";
import { firebaseToDestination, destinationToFirebase } from "./destination";

describe("firebaseToDestination", () => {
  it("maps destinationId from argument", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Paris",
    });
    expect(dest.destinationId).toBe("dest-1");
  });

  it("maps uid from argument", () => {
    const dest = firebaseToDestination("dest-1", "user-99", {
      name: "Paris",
    });
    expect(dest.uid).toBe("user-99");
  });

  it("maps name", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Tokyo",
    });
    expect(dest.name).toBe("Tokyo");
  });

  it("falls back to empty string when name is absent", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {});
    expect(dest.name).toBe("");
  });

  it("maps seasonality when present", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Paris",
      seasonality: "best in spring",
    });
    expect(dest.seasonality).toBe("best in spring");
  });

  it("maps seasonality as undefined when absent", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Paris",
    });
    expect(dest.seasonality).toBeUndefined();
  });

  it("maps tripIds when present", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Paris",
      tripIds: ["trip-a", "trip-b"],
    });
    expect(dest.tripIds).toEqual(["trip-a", "trip-b"]);
  });

  it("falls back to empty array when tripIds is absent", () => {
    const dest = firebaseToDestination("dest-1", "user-1", {
      name: "Paris",
    });
    expect(dest.tripIds).toEqual([]);
  });
});

describe("destinationToFirebase", () => {
  it("maps name", () => {
    const data = destinationToFirebase({ name: "Kyoto" });
    expect(data.name).toBe("Kyoto");
  });

  it("includes seasonality when defined", () => {
    const data = destinationToFirebase({
      name: "Kyoto",
      seasonality: "year-round",
    });
    expect(data.seasonality).toBe("year-round");
  });

  it("omits seasonality when undefined", () => {
    const data = destinationToFirebase({ name: "Kyoto" });
    expect("seasonality" in data).toBe(false);
  });

  it("maps tripIds when provided", () => {
    const data = destinationToFirebase({
      name: "Kyoto",
      tripIds: ["trip-x"],
    });
    expect(data.tripIds).toEqual(["trip-x"]);
  });

  it("falls back to empty array when tripIds is absent", () => {
    const data = destinationToFirebase({ name: "Kyoto" });
    expect(data.tripIds).toEqual([]);
  });
});
