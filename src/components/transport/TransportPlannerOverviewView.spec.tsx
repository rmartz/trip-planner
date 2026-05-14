import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "./TransportPlannerOverviewView";
import { TRANSPORT_PLANNER_OVERVIEW_COPY } from "./TransportPlannerOverviewView.copy";
import type { Leg } from "@/lib/types/trip";

afterEach(cleanup);

const COPY = TRANSPORT_PLANNER_OVERVIEW_COPY;

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "Austin → Wimberley",
    order: 0,
    memberUids: ["uid-1"],
    isActive: true,
    ...overrides,
  };
}

function makeLegSummary(
  overrides: Partial<TransportLegSummary> = {},
): TransportLegSummary {
  return {
    leg: makeLeg(),
    capacity: { driverCount: 1, seatCount: 4 },
    demand: { ridersNeeded: 3 },
    ...overrides,
  };
}

describe("TransportPlannerOverviewView — page header", () => {
  it("renders the heading", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.headingSubtext)).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — empty state", () => {
  it("shows the empty-legs message when no legs are passed", () => {
    render(<TransportPlannerOverviewView legs={[]} />);
    expect(screen.getByText(COPY.emptyLegsMessage)).toBeDefined();
  });

  it("does not render any leg sections when legs are empty", () => {
    const { container } = render(<TransportPlannerOverviewView legs={[]} />);
    expect(
      container.querySelectorAll("[data-testid=transport-leg-section]").length,
    ).toBe(0);
  });
});

describe("TransportPlannerOverviewView — per-leg cards", () => {
  it("renders the leg name in the section title", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ name: "Austin → San Antonio" }) }),
        ]}
      />,
    );
    expect(screen.getByText("Austin → San Antonio")).toBeDefined();
  });

  it("renders one section per leg", () => {
    const { container } = render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({ leg: makeLeg({ legId: "l1", name: "Leg One" }) }),
          makeLegSummary({ leg: makeLeg({ legId: "l2", name: "Leg Two" }) }),
        ]}
      />,
    );
    expect(
      container.querySelectorAll("[data-testid=transport-leg-section]").length,
    ).toBe(2);
  });
});

describe("TransportPlannerOverviewView — capacity callout", () => {
  it("renders the capacity card title", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.capacityCardTitle)).toBeDefined();
  });

  it("renders the seat count via the capacity label", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary({ capacity: { driverCount: 2, seatCount: 7 } })]}
      />,
    );
    expect(screen.getByText(COPY.capacityLabel(7))).toBeDefined();
  });

  it("renders the driver count via the driver label", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary({ capacity: { driverCount: 2, seatCount: 7 } })]}
      />,
    );
    expect(screen.getByText(COPY.driverLabel(2))).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — demand callout", () => {
  it("renders the demand card title", () => {
    render(<TransportPlannerOverviewView legs={[makeLegSummary()]} />);
    expect(screen.getByText(COPY.demandCardTitle)).toBeDefined();
  });

  it("renders the riders-needed count", () => {
    render(
      <TransportPlannerOverviewView
        legs={[makeLegSummary({ demand: { ridersNeeded: 5 } })]}
      />,
    );
    expect(screen.getByText(COPY.passengersLabel(5))).toBeDefined();
  });
});

describe("TransportPlannerOverviewView — status pill", () => {
  it("shows the covered pill when seat count meets demand", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            capacity: { driverCount: 1, seatCount: 4 },
            demand: { ridersNeeded: 3 },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.okPill)).toBeDefined();
  });

  it("shows the gap pill when seat count is below demand", () => {
    render(
      <TransportPlannerOverviewView
        legs={[
          makeLegSummary({
            capacity: { driverCount: 1, seatCount: 2 },
            demand: { ridersNeeded: 5 },
          }),
        ]}
      />,
    );
    expect(screen.getByText(COPY.gapPill(-3))).toBeDefined();
  });
});
