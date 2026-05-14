import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SCREEN_DESTINATIONS_TRIP_COPY } from "./ScreenDestinationsTripView.copy";
import { ScreenDestinationsTripView } from "./ScreenDestinationsTripView";
import type { TripDestination } from "@/lib/types/destination";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeTripDestination(
  overrides: Partial<TripDestination> = {},
): TripDestination {
  return {
    destinationId: "dest-1",
    catalogUid: "user-1",
    name: "Paris",
    stopId: "stop-1",
    stopName: "London",
    tripId: "trip-1",
    ...overrides,
  };
}

describe("Criterion 1 — ScreenDestinationsTripView shows header with title and subheading", () => {
  it("renders the page title", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[]}
        isLoading={false}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_DESTINATIONS_TRIP_COPY.heading),
    ).toBeDefined();
  });

  it("renders the vote subheading", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[]}
        isLoading={false}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_DESTINATIONS_TRIP_COPY.subheading),
    ).toBeDefined();
  });
});

describe("Criterion 2 — each candidate card shows name and attached → {stop name} sub-label", () => {
  it("renders destination name on card", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[makeTripDestination({ name: "Eiffel Tower" })]}
        isLoading={false}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByText("Eiffel Tower")).toBeDefined();
  });

  it("renders attached → {stop name} sub-label", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[
          makeTripDestination({ name: "Eiffel Tower", stopName: "Paris Stop" }),
        ]}
        isLoading={false}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByText("attached → Paris Stop")).toBeDefined();
  });
});

describe("Criterion 3 — loading and error states", () => {
  it("renders loading state", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[]}
        isLoading={true}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_DESTINATIONS_TRIP_COPY.loadingText),
    ).toBeDefined();
  });

  it("renders error state", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[]}
        isLoading={false}
        isError={true}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_DESTINATIONS_TRIP_COPY.errorText),
    ).toBeDefined();
  });
});

describe("Criterion 4 — empty state when no destinations are attached", () => {
  it("renders empty state when there are no destinations", () => {
    render(
      <ScreenDestinationsTripView
        tripId="trip-1"
        destinations={[]}
        isLoading={false}
        isError={false}
        onBack={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_DESTINATIONS_TRIP_COPY.emptyStateText),
    ).toBeDefined();
  });
});
