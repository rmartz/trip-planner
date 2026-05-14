import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ATTACH_DESTINATION_PICKER_COPY } from "./AttachDestinationPickerView.copy";
import { AttachDestinationPickerView } from "./AttachDestinationPickerView";
import type { Trip, Stop } from "@/lib/types/trip";
import type { Destination } from "@/lib/types/destination";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    destinationId: "dest-1",
    uid: "user-1",
    name: "Paris",
    tripIds: [],
    ...overrides,
  };
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Europe 2026",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-06-30"),
    createdAt: new Date("2026-01-01"),
    createdBy: "user-1",
    memberUids: ["user-1"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "London",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-06-05"),
    order: 0,
    memberUids: ["user-1"],
    ...overrides,
  };
}

describe("Criterion 1 — Attach… picker shows the destination name being attached", () => {
  it("renders the destination name in the heading", () => {
    const dest = makeDestination({ name: "Tokyo" });
    render(
      <AttachDestinationPickerView
        destination={dest}
        trips={[makeTrip()]}
        stopsForTrip={{ "trip-1": [makeStop()] }}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Tokyo")).toBeDefined();
  });

  it("renders the picker heading text", () => {
    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[]}
        stopsForTrip={{}}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(ATTACH_DESTINATION_PICKER_COPY.heading),
    ).toBeDefined();
  });
});

describe("Criterion 2 — picker lists the user's active trips and their stops", () => {
  it("renders each trip name", () => {
    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[
          makeTrip({ tripId: "trip-1", name: "Europe 2026" }),
          makeTrip({ tripId: "trip-2", name: "Japan 2027" }),
        ]}
        stopsForTrip={{}}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Europe 2026")).toBeDefined();
    expect(screen.getByText("Japan 2027")).toBeDefined();
  });

  it("renders stops under their trip", () => {
    render(
      <AttachDestinationPickerView
        destination={makeDestination({ name: "Tokyo" })}
        trips={[makeTrip({ tripId: "trip-1", name: "Europe 2026" })]}
        stopsForTrip={{
          "trip-1": [
            makeStop({ stopId: "stop-1", name: "London" }),
            makeStop({ stopId: "stop-2", name: "Berlin", order: 1 }),
          ],
        }}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("London")).toBeDefined();
    expect(screen.getByText("Berlin")).toBeDefined();
  });

  it("renders loading state", () => {
    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[]}
        stopsForTrip={{}}
        isLoading={true}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(ATTACH_DESTINATION_PICKER_COPY.loadingText),
    ).toBeDefined();
  });

  it("renders empty state when there are no active trips", () => {
    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[]}
        stopsForTrip={{}}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(ATTACH_DESTINATION_PICKER_COPY.noTripsText),
    ).toBeDefined();
  });
});

describe("Criterion 3 — selecting a stop calls onSelectStop with trip and stop", () => {
  it("calls onSelectStop with the correct stop when a stop button is clicked", () => {
    const onSelectStop = vi.fn();
    const trip = makeTrip({ tripId: "trip-1", name: "Europe 2026" });
    const stop = makeStop({
      stopId: "stop-1",
      name: "London",
      tripId: "trip-1",
    });

    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[trip]}
        stopsForTrip={{ "trip-1": [stop] }}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={onSelectStop}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("London"));

    expect(onSelectStop).toHaveBeenCalledWith(trip, stop);
  });
});

describe("Criterion 4 — cancel button calls onCancel", () => {
  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <AttachDestinationPickerView
        destination={makeDestination()}
        trips={[]}
        stopsForTrip={{}}
        isLoading={false}
        isSubmitting={false}
        isError={false}
        onSelectStop={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(
      screen.getByText(ATTACH_DESTINATION_PICKER_COPY.cancelButton),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
