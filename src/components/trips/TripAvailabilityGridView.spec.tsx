import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TripAvailabilityGridView } from "./TripAvailabilityGridView";
import { TRIP_AVAILABILITY_GRID_COPY } from "./TripAvailabilityGridView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Jun 10–12
const DATES = [
  new Date("2025-06-10T00:00:00"),
  new Date("2025-06-11T00:00:00"),
  new Date("2025-06-12T00:00:00"),
];

describe("Criterion 1 — grid renders a cell for each date in the trip range", () => {
  it("renders a cell for every date in the dates array", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    expect(screen.getByTestId("avail-input-cell-2025-06-10")).toBeDefined();
    expect(screen.getByTestId("avail-input-cell-2025-06-11")).toBeDefined();
    expect(screen.getByTestId("avail-input-cell-2025-06-12")).toBeDefined();
  });

  it("shows a loading state when isLoading is true", () => {
    render(
      <TripAvailabilityGridView
        dates={[]}
        myAvailableDates={new Set()}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={true}
        onToggleDates={vi.fn()}
      />,
    );

    expect(
      screen.getByText(TRIP_AVAILABILITY_GRID_COPY.loadingText),
    ).toBeDefined();
  });
});

describe("Criterion 2 — tap a cell to toggle availability", () => {
  it("calls onToggleDates with the date key when a cell is clicked", () => {
    const onToggleDates = vi.fn();
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={false}
        onToggleDates={onToggleDates}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    fireEvent.pointerDown(cell);
    fireEvent.pointerUp(cell);

    expect(onToggleDates).toHaveBeenCalledWith(["2025-06-10"]);
  });

  it("calls onToggleDates with multiple date keys during a drag sequence", () => {
    const onToggleDates = vi.fn();
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={false}
        onToggleDates={onToggleDates}
      />,
    );

    const cell10 = screen.getByTestId("avail-input-cell-2025-06-10");
    const cell11 = screen.getByTestId("avail-input-cell-2025-06-11");

    fireEvent.pointerDown(cell10);
    fireEvent.pointerEnter(cell11);
    fireEvent.pointerUp(cell11);

    expect(onToggleDates).toHaveBeenCalledWith(
      expect.arrayContaining(["2025-06-10", "2025-06-11"]),
    );
  });
});

describe("Criterion 3 — cell heat reflects aggregate member counts", () => {
  it("gives data-heat='all' when all planners are available on a date", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{ "2025-06-10": 2 }}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    expect(cell.dataset["heat"]).toBe("all");
  });

  it("gives data-heat='none' when no planners are available on a date", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{ "2025-06-10": 0 }}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    expect(cell.dataset["heat"]).toBe("none");
  });

  it("gives data-heat='some' when a partial number of planners are available", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set()}
        memberCountByDate={{ "2025-06-10": 1 }}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    expect(cell.dataset["heat"]).toBe("some");
  });
});

describe("Criterion 4 — my own availability is reflected in cell state", () => {
  it("gives data-mine='true' for dates in myAvailableDates", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set(["2025-06-10"])}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    expect(cell.dataset["mine"]).toBe("true");
  });

  it("gives data-mine='false' for dates not in myAvailableDates", () => {
    render(
      <TripAvailabilityGridView
        dates={DATES}
        myAvailableDates={new Set(["2025-06-11"])}
        memberCountByDate={{}}
        plannerCount={2}
        isLoading={false}
        onToggleDates={vi.fn()}
      />,
    );

    const cell = screen.getByTestId("avail-input-cell-2025-06-10");
    expect(cell.dataset["mine"]).toBe("false");
  });
});
