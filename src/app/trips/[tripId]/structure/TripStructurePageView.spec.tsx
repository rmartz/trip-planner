import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Leg, Stop } from "@/lib/types/trip";
import { TRIP_STRUCTURE_COPY } from "./copy";
import { TripStructurePageView } from "./TripStructurePageView";

afterEach(cleanup);

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "London",
    startDate: new Date("2025-06-20T00:00:00.000Z"),
    endDate: new Date("2025-06-23T00:00:00.000Z"),
    order: 0,
    memberUids: ["uid-1"],
    ...overrides,
  };
}

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "London → Paris",
    order: 0,
    memberUids: ["uid-1"],
    isActive: true,
    ...overrides,
  };
}

describe("TripStructurePageView — renders page heading", () => {
  it("renders the heading and subtext", () => {
    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByText(TRIP_STRUCTURE_COPY.heading)).toBeDefined();
    expect(screen.getByText(TRIP_STRUCTURE_COPY.headingSubtext)).toBeDefined();
  });
});

describe("TripStructurePageView — Planner-only controls", () => {
  it("shows '+ Stop' button for Planner", () => {
    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={true}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.addStop }),
    ).toBeDefined();
  });

  it("hides '+ Stop' button for Guest", () => {
    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: TRIP_STRUCTURE_COPY.addStop }),
    ).toBeNull();
  });

  it("shows '+ Add leg' button for Planner", () => {
    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={true}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByText(TRIP_STRUCTURE_COPY.addLeg)).toBeDefined();
  });

  it("hides '+ Add leg' button for Guest", () => {
    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.queryByText(TRIP_STRUCTURE_COPY.addLeg)).toBeNull();
  });
});

describe("TripStructurePageView — stop cards", () => {
  it("renders STOP N label for each stop", () => {
    const stops = [
      makeStop({ stopId: "stop-1", name: "London", order: 0 }),
      makeStop({ stopId: "stop-2", name: "Paris", order: 1 }),
    ];

    render(
      <TripStructurePageView
        stops={stops}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByText(TRIP_STRUCTURE_COPY.stopLabel(1))).toBeDefined();
    expect(screen.getByText(TRIP_STRUCTURE_COPY.stopLabel(2))).toBeDefined();
  });

  it("renders stop names", () => {
    const stops = [
      makeStop({ stopId: "stop-1", name: "London", order: 0 }),
      makeStop({ stopId: "stop-2", name: "Paris", order: 1 }),
    ];

    render(
      <TripStructurePageView
        stops={stops}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByText("London")).toBeDefined();
    expect(screen.getByText("Paris")).toBeDefined();
  });

  it("shows drag handles for Planner", () => {
    const stops = [makeStop()];

    render(
      <TripStructurePageView
        stops={stops}
        legs={[]}
        isPlanner={true}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByTestId("drag-handle-stop-1")).toBeDefined();
  });

  it("hides drag handles for Guest", () => {
    const stops = [makeStop()];

    render(
      <TripStructurePageView
        stops={stops}
        legs={[]}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("drag-handle-stop-1")).toBeNull();
  });

  it("calls onAddStop when '+ Stop' is clicked", () => {
    const onAddStop = vi.fn();

    render(
      <TripStructurePageView
        stops={[]}
        legs={[]}
        isPlanner={true}
        onAddStop={onAddStop}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.addStop }).click();

    expect(onAddStop).toHaveBeenCalledTimes(1);
  });
});

describe("TripStructurePageView — leg cards", () => {
  it("renders leg name", () => {
    const legs = [makeLeg({ name: "London → Paris" })];

    render(
      <TripStructurePageView
        stops={[]}
        legs={legs}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(screen.getByText("London → Paris")).toBeDefined();
  });

  it("shows Remove button for Planner", () => {
    const legs = [makeLeg()];

    render(
      <TripStructurePageView
        stops={[]}
        legs={legs}
        isPlanner={true}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.removeLeg }),
    ).toBeDefined();
  });

  it("hides Remove button for Guest", () => {
    const legs = [makeLeg()];

    render(
      <TripStructurePageView
        stops={[]}
        legs={legs}
        isPlanner={false}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: TRIP_STRUCTURE_COPY.removeLeg }),
    ).toBeNull();
  });

  it("calls onRemoveLeg when Remove is clicked", () => {
    const onRemoveLeg = vi.fn();
    const leg = makeLeg();

    render(
      <TripStructurePageView
        stops={[]}
        legs={[leg]}
        isPlanner={true}
        onAddStop={vi.fn()}
        onEditStop={vi.fn()}
        onReorder={vi.fn()}
        onRemoveLeg={onRemoveLeg}
      />,
    );

    screen.getByRole("button", { name: TRIP_STRUCTURE_COPY.removeLeg }).click();

    expect(onRemoveLeg).toHaveBeenCalledWith(leg);
  });
});
